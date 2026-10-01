#!/usr/bin/env bash
# Deploy the backend on the VM: pull, install, fix .env, fix nginx, restart pm2.
# Usage:  bash Server/backend/deploy.sh            (auto-detects the pm2 process)
#         PM2_NAME=my-api bash Server/backend/deploy.sh
# Safe to re-run — it only asks for values that are missing.
set -euo pipefail

main() {
  BACKEND=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
  cd "$BACKEND"

  echo "==> Pulling latest code"
  git pull --ff-only

  echo "==> Installing dependencies"
  npm ci --no-audit --no-fund

  echo "==> Finding pm2 process"
  local found
  found=$(pm2 jlist 2>/dev/null | node -e '
    let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
      const [backend, want] = process.argv.slice(1);
      let apps = []; try { apps = JSON.parse(s.slice(s.indexOf("["))); } catch {}
      const a = apps.find(a => want ? a.name === want
        : a.pm2_env.pm_cwd === backend || (a.pm2_env.pm_exec_path || "").startsWith(backend + "/"));
      if (a) console.log(a.name + "\t" + a.pm2_env.pm_cwd);
    });' "$BACKEND" "${PM2_NAME:-}" || true)
  local name cwd
  if [[ -n $found ]]; then
    IFS=$'\t' read -r name cwd <<<"$found"
    echo "  found '$name' (cwd: $cwd)"
  else
    name=${PM2_NAME:-tanak-backend}; cwd=$BACKEND
    echo "  no running process found — will start '$name'"
  fi

  # dotenv reads .env from the process working directory
  ENV_FILE="$cwd/.env"
  touch "$ENV_FILE"; chmod 600 "$ENV_FILE"

  echo "==> Checking $ENV_FILE"
  ensure MSG91_AUTH_KEY          ask-secret "MSG91 auth key"
  ensure MSG91_INTEGRATED_NUMBER ask        "MSG91 WhatsApp number, e.g. 91XXXXXXXXXX"
  ensure JWT_SECRET              gen
  ensure QR_TOKEN_SECRET         gen
  ensure DASHBOARD_API_KEY       ask-secret "must match the admin dashboard's key"
  ensure DATABASE_URL            ask-secret "Supabase Postgres connection string"
  set_env NODE_ENV production; echo "  ✓ NODE_ENV=production"

  echo "==> Verifying MSG91 credentials"
  if curl -s -m 15 -H "authkey: $(get_env MSG91_AUTH_KEY)" \
      "https://control.msg91.com/api/v5/whatsapp/get-template-client/$(get_env MSG91_INTEGRATED_NUMBER)?template_name=tanak_prabha_otp" \
      | grep -q '"approved"'; then
    echo "  ✓ key + number valid, template approved"
  else
    echo "  ✗ MSG91 rejected the key/number — fix them in $ENV_FILE and re-run"; exit 1
  fi

  echo "==> Ensuring push-token columns exist (idempotent)"
  local out; out=$(cd "$cwd" && node "$BACKEND/migrate-push-tokens.js" 2>&1)
  echo "  $out"
  [[ $out == *"Migration complete"* ]] || exit 1

  fix_nginx

  echo "==> Restarting pm2"
  export NODE_ENV=production   # overrides a NODE_ENV that pm2 may have saved
  if [[ -n $found ]]; then
    pm2 restart "$name" --update-env
  else
    (cd "$cwd" && pm2 start src/server.js --name "$name")
  fi
  pm2 save >/dev/null

  echo "==> Health check"
  local port i; port=$(get_env PORT); port=${port:-5000}
  for i in {1..10}; do
    if curl -s -m 5 "http://localhost:$port/health" | grep -q '"environment":"production"'; then
      echo "  ✓ server up in production mode on :$port"; break
    fi
    ((i < 10)) || { echo "  ✗ health check failed — run: pm2 logs $name --lines 50"; exit 1; }
    sleep 2
  done

  echo
  echo "Done. Live logs: https://api.tanakprabha.in/log?key=<DASHBOARD_API_KEY>"
}

get_env() { grep -E "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- || true; }

set_env() {
  if grep -qE "^$1=" "$ENV_FILE"; then
    K=$1 V=$2 awk 'index($0, ENVIRON["K"] "=") == 1 { print ENVIRON["K"] "=" ENVIRON["V"]; next } { print }' \
      "$ENV_FILE" >"$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE" && chmod 600 "$ENV_FILE"
  else
    [[ -s $ENV_FILE && $(tail -c1 "$ENV_FILE") != "" ]] && echo >>"$ENV_FILE"
    printf '%s=%s\n' "$1" "$2" >>"$ENV_FILE"
  fi
}

# ensure KEY gen|ask|ask-secret [hint] — keeps a real value, otherwise generates or prompts
ensure() {
  local k=$1 mode=$2 hint=${3:-} cur v=""
  cur=$(get_env "$k")
  if [[ -n $cur && $cur != your* && $cur != \<* ]]; then echo "  ✓ $k"; return; fi
  case $mode in
    gen)        v=$(openssl rand -hex 48); echo "  + $k generated (existing app logins will need to sign in again)";;
    ask)        read -rp  "  $k ($hint): " v </dev/tty;;
    ask-secret) read -rsp "  $k ($hint, hidden): " v </dev/tty; echo;;
  esac
  if [[ -z $v ]]; then echo "  ✗ $k is required"; exit 1; fi
  set_env "$k" "$v"
}

# Make nginx forward the real client IP so per-IP rate limits work
fix_nginx() {
  command -v nginx >/dev/null || { echo "==> nginx not found, skipping"; return; }
  echo "==> Checking nginx forwards client IP"
  sudo -v
  local backup=/var/backups/nginx-$(date +%s) changed=() f
  while IFS= read -r f; do
    if sudo grep -q 'X-Forwarded-For' "$f"; then echo "  ✓ $f"; continue; fi
    sudo mkdir -p "$backup"; sudo cp "$f" "$backup/"
    sudo sed -i -E 's/^([[:space:]]*)(proxy_pass[^;]*;)/\1\2\n\1proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;/' "$f"
    changed+=("$f"); echo "  + added X-Forwarded-For to $f"
  done < <(sudo grep -rlE '^[[:space:]]*proxy_pass' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null \
             | xargs -r -n1 readlink -f | sort -u)
  ((${#changed[@]})) || return 0
  if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx; echo "  ✓ nginx reloaded"
  else
    for f in "${changed[@]}"; do sudo cp "$backup/$(basename "$f")" "$f"; done
    echo "  ✗ nginx config test failed — restored originals from $backup"; exit 1
  fi
}

main "$@"

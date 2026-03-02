import EventEmitter from 'events';

// ANSI color codes for terminal output
const ANSI = {
    reset:   '\x1b[0m',
    dim:     '\x1b[2m',
    bold:    '\x1b[1m',
    yellow:  '\x1b[33m',
    red:     '\x1b[31m',
    cyan:    '\x1b[36m',
    green:   '\x1b[32m',
    magenta: '\x1b[35m',
};

class LiveLogger extends EventEmitter {
    constructor() {
        super();
        this.originalConsole = {
            log:   console.log,
            error: console.error,
            warn:  console.warn,
            info:  console.info,
        };
        this.init();
    }

    init() {
        // Override console methods so we can intercept and re-emit
        console.log   = (...args) => this.intercept('log',   ...args);
        console.error = (...args) => this.intercept('error', ...args);
        console.warn  = (...args) => this.intercept('warn',  ...args);
        console.info  = (...args) => this.intercept('info',  ...args);
    }

    /**
     * Detect the semantic tag of a message so the browser UI can colour it.
     *  'otp'       → OTP lines  (bright yellow in browser, yellow in terminal)
     *  'keepalive' → keep-alive pings (faded/dimmed)
     *  'health'    → /health route hits (faded/dimmed)
     *  'error'     → errors (red)
     *  'warn'      → warnings (orange)
     *  'log'       → default white
     */
    detectTag(level, message) {
        const m = message.toLowerCase();

        // OTP-related messages
        if (
            m.includes('otp') ||
            m.includes('generateotp') ||
            m.includes('dev otp') ||
            m.includes('sending msg91')
        ) {
            return 'otp';
        }

        // Keep-alive ping
        if (m.includes('keep-alive') || m.includes('keep alive') || m.includes('🏓')) {
            return 'keepalive';
        }

        // Morgan HTTP log for /health
        if (m.includes('/health')) {
            return 'health';
        }

        if (level === 'error') return 'error';
        if (level === 'warn')  return 'warn';

        return 'log';
    }

    intercept(level, ...args) {
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try { return JSON.stringify(arg); } catch { return String(arg); }
            }
            return String(arg);
        }).join(' ');

        const tag = this.detectTag(level, message);

        // ── Terminal colouring ─────────────────────────────────────
        let colored = message;
        switch (tag) {
            case 'otp':
                colored = `${ANSI.bold}${ANSI.yellow}${message}${ANSI.reset}`;
                break;
            case 'keepalive':
            case 'health':
                colored = `${ANSI.dim}${message}${ANSI.reset}`;
                break;
            case 'error':
                colored = `${ANSI.red}${message}${ANSI.reset}`;
                break;
            case 'warn':
                colored = `${ANSI.yellow}${message}${ANSI.reset}`;
                break;
            default:
                // plain white — no wrapping needed
                break;
        }

        // Print to terminal with colour
        this.originalConsole.log(colored);

        // ── Emit to SSE clients (browser /log viewer) ──────────────
        this.emit('log', {
            timestamp: new Date().toISOString(),
            level,
            tag,
            message,
        });
    }
}

// Singleton
const liveLogger = new LiveLogger();
export default liveLogger;

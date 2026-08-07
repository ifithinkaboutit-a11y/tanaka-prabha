"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**
 * LocalizedContentEditor - Internationalized content input for English & Hindi
 *
 * Both languages are shown side by side (English left, हिंदी right) so an editor
 * can translate without switching tabs. On narrow screens the columns stack.
 */
export function LocalizedContentEditor({
  value = {},
  onChange,
  fields = [],
  entityLabel = "content",
}) {
  const updateField = (lang, fieldKey, fieldValue) => {
    const key = fieldKey + (lang === "english" ? "" : "_hi")
    onChange?.({ ...value, [key]: fieldValue })
  }

  const getValue = (lang, fieldKey) => {
    const key = fieldKey + (lang === "english" ? "" : "_hi")
    return value[key] ?? ""
  }

  const getCompletion = (lang) => {
    const langKey = lang === "english" ? "" : "_hi"
    const langFields = fields.filter((f) => f.key)
    const filled = langFields.filter((f) => {
      const v = (value || {})[f.key + langKey]
      return typeof v === "string" ? v.trim().length > 0 : Boolean(v && (!Array.isArray(v) || v.length > 0))
    })
    return langFields.length ? Math.round((filled.length / langFields.length) * 100) : 0
  }

  return (
    <div className="w-full space-y-4">
      {/* Column headers */}
      <div className="grid gap-4 md:grid-cols-2">
        <ColumnHeader
          title="English"
          hint={`Enter ${entityLabel} in English`}
          percent={getCompletion("english")}
        />
        <ColumnHeader
          title="हिंदी"
          hint={`${entityLabel} हिंदी में दर्ज करें`}
          percent={getCompletion("hindi")}
        />
      </div>

      {/* One row per field, English on the left, Hindi on the right */}
      {fields.map(({ key, label, labelHi, type = "text", placeholder, placeholderHi, rows = 3 }) => (
        <div key={key} className="grid gap-4 md:grid-cols-2">
          <FieldInput
            id={`${key}-en`}
            label={`${label} (English)`}
            type={type}
            rows={rows}
            placeholder={placeholder}
            value={getValue("english", key)}
            onChange={(v) => updateField("english", key, v)}
          />
          <FieldInput
            id={`${key}-hi`}
            label={`${labelHi || label} (हिंदी)`}
            type={type}
            rows={rows}
            placeholder={placeholderHi || placeholder}
            value={getValue("hindi", key)}
            onChange={(v) => updateField("hindi", key, v)}
          />
        </div>
      ))}
    </div>
  )
}

function ColumnHeader({ title, hint, percent }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <CompletionBadge percent={percent} />
    </div>
  )
}

function FieldInput({ id, label, type, rows, placeholder, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="font-[inherit]"
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-[inherit]"
        />
      )}
    </div>
  )
}

function CompletionBadge({ percent }) {
  const color = percent > 0 ? "bg-zinc-500" : "bg-muted"
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white ${color}`}>
      {percent}%
    </span>
  )
}

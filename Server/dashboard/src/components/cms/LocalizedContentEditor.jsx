"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

/**
 * LocalizedContentEditor - Internationalized content input for English & Hindi
 * Provides consistent UX for adding/editing content in two language formats
 */
export function LocalizedContentEditor({
  value = {},
  onChange,
  fields = [],
  entityLabel = "content",
}) {
  const [activeTab, setActiveTab] = React.useState("english")

  const updateField = (lang, fieldKey, fieldValue) => {
    const langKey = lang === "english" ? "" : "_hi"
    const key = fieldKey + langKey
    onChange?.({ ...value, [key]: fieldValue })
  }

  const getValue = (lang, fieldKey) => {
    const langKey = lang === "english" ? "" : "_hi"
    return value[fieldKey + langKey] ?? ""
  }

  const getCompletion = (lang) => {
    const langKey = lang === "english" ? "" : "_hi"
    const langFields = fields.filter((f) => f.key)
    const filled = langFields.filter((f) => ((value || {})[f.key + langKey] ?? "").trim().length > 0)
    return langFields.length ? Math.round((filled.length / langFields.length) * 100) : 0
  }

  return (
    <Tabs defaultValue="english" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="english" className="gap-2 px-4">
          <span>English</span>
          <CompletionBadge percent={getCompletion("english")} />
        </TabsTrigger>
        <TabsTrigger value="hindi" className="gap-2 px-4">
          <span>हिंदी</span>
          <CompletionBadge percent={getCompletion("hindi")} />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="english" className="space-y-4 mt-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            Enter {entityLabel} in English
          </p>
        </div>
        {fields.map(({ key, label, type = "text", placeholder, rows = 3 }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`${key}-en`}>{label} (English)</Label>
            {type === "textarea" ? (
              <Textarea
                id={`${key}-en`}
                placeholder={placeholder}
                value={getValue("english", key)}
                onChange={(e) => updateField("english", key, e.target.value)}
                rows={rows}
              />
            ) : (
              <Input
                id={`${key}-en`}
                type={type}
                placeholder={placeholder}
                value={getValue("english", key)}
                onChange={(e) => updateField("english", key, e.target.value)}
              />
            )}
          </div>
        ))}
      </TabsContent>

      <TabsContent value="hindi" className="space-y-4 mt-4">
        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            {entityLabel} हिंदी में दर्ज करें
          </p>
        </div>
        {fields.map(({ key, labelHi, label, type = "text", placeholderHi, placeholder, rows = 3 }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`${key}-hi`}>{labelHi || label} (हिंदी)</Label>
            {type === "textarea" ? (
              <Textarea
                id={`${key}-hi`}
                placeholder={placeholderHi || placeholder}
                value={getValue("hindi", key)}
                onChange={(e) => updateField("hindi", key, e.target.value)}
                rows={rows}
                className="font-[inherit]"
              />
            ) : (
              <Input
                id={`${key}-hi`}
                type={type}
                placeholder={placeholderHi || placeholder}
                value={getValue("hindi", key)}
                onChange={(e) => updateField("hindi", key, e.target.value)}
                className="font-[inherit]"
              />
            )}
          </div>
        ))}
      </TabsContent>
    </Tabs>
  )
}

function CompletionBadge({ percent }) {
  const color = percent === 100 ? "bg-green-500" : percent > 0 ? "bg-amber-500" : "bg-muted"
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white ${color}`}>
      {percent}%
    </span>
  )
}

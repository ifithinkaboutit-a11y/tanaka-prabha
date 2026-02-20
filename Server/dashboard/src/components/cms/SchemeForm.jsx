"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { IconLoader2 } from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocalizedContentEditor } from "./LocalizedContentEditor"
import { CloudinaryImageUpload } from "./CloudinaryImageUpload"
import { uploadApi } from "@/lib/api"
import { toast } from "sonner"

const SCHEME_FIELDS = [
  { key: "title", label: "Title", type: "text", placeholder: "e.g., PM Kisan Samman Nidhi", placeholderHi: "उदा., पीएम किसान सम्मान निधि" },
  { key: "description", label: "Description", type: "textarea", rows: 3, placeholder: "Describe the scheme benefits...", placeholderHi: "योजना के लाभों का वर्णन करें..." },
  { key: "overview", label: "Overview", type: "textarea", rows: 4, placeholder: "Detailed overview of the scheme...", placeholderHi: "योजना का विस्तृत अवलोकन..." },
  { key: "process", label: "Application Process", type: "textarea", rows: 3, placeholder: "Step-by-step application process...", placeholderHi: "चरण-दर-चरण आवेदन प्रक्रिया..." },
  { key: "eligibility", label: "Eligibility", type: "textarea", rows: 2, placeholder: "Who can apply for this scheme...", placeholderHi: "इस योजना के लिए कौन आवेदन कर सकता है..." },
  { key: "key_objectives", label: "Key Objectives", type: "textarea", rows: 2, placeholder: "Main objectives of the scheme...", placeholderHi: "योजना के मुख्य उद्देश्य..." },
]

export function SchemeForm({ formData, setFormData, onSubmit, submitLabel = "Save" }) {
  const [saving, setSaving] = React.useState(false)

  async function handleImageUpload(file) {
    const response = await uploadApi.uploadSchemeImage(file)
    return response
  }

  async function handleSubmit() {
    if (!formData.title?.trim()) {
      toast.error("Please enter a scheme title")
      return
    }

    setSaving(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      throw error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={formData.category}
          onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agriculture">Agriculture</SelectItem>
            <SelectItem value="livestock">Livestock</SelectItem>
            <SelectItem value="financial">Financial Aid</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="training">Training / Program</SelectItem>
            <SelectItem value="subsidy">Subsidy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Internationalized Content - English & Hindi */}
      <LocalizedContentEditor
        entityLabel="scheme"
        value={formData}
        onChange={setFormData}
        fields={SCHEME_FIELDS}
      />

      {/* Image Upload via Cloudinary */}
      <CloudinaryImageUpload
        value={formData.image_url}
        onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url || "" }))}
        uploadFn={handleImageUpload}
        maxSizeMB={5}
        aspectRatio="aspect-video"
        placeholder="Drag & drop or click to upload scheme image"
        onUploadProgress={({ error }) => error && toast.error(error)}
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

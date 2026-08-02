"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { IconLoader2, IconPlus, IconX } from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { LocalizedContentEditor } from "./LocalizedContentEditor"
import { CloudinaryImageUpload } from "./CloudinaryImageUpload"
import { uploadApi } from "@/lib/api"
import { SCHEME_CATEGORIES } from "@/lib/constants"
import { toast } from "sonner"

const SCHEME_FIELDS = [
  { key: "title", label: "Title", type: "text", placeholder: "e.g., PM Kisan Samman Nidhi", placeholderHi: "उदा., पीएम किसान सम्मान निधि" },
  { key: "description", label: "Description", type: "textarea", rows: 3, placeholder: "Describe the scheme benefits...", placeholderHi: "योजना के लाभों का वर्णन करें..." },
  { key: "overview", label: "Overview", type: "textarea", rows: 4, placeholder: "Detailed overview of the scheme...", placeholderHi: "योजना का विस्तृत अवलोकन..." },
  { key: "process", label: "Application Process", type: "textarea", rows: 3, placeholder: "Step-by-step application process...", placeholderHi: "चरण-दर-चरण आवेदन प्रक्रिया..." },
  { key: "key_objectives", label: "Key Objectives", type: "textarea", rows: 4, placeholder: "One objective per line...", placeholderHi: "प्रति पंक्ति एक उद्देश्य..." },
]

// Eligibility category options
const ELIGIBILITY_CATEGORIES = [
  { value: "income", label: "Income Based", labelHi: "आय आधारित" },
  { value: "landholding", label: "Landholding Based", labelHi: "भूमि धारणा आधारित" },
  { value: "age", label: "Age Based", labelHi: "आयु आधारित" },
  { value: "occupation", label: "Occupation Based", labelHi: "व्यवसाय आधारित" },
  { value: "social_category", label: "Social Category", labelHi: "सामाजिक श्रेणी" },
  { value: "disability", label: "Disability Based", labelHi: "दिव्यांगता आधारित" },
  { value: "gender", label: "Gender Based", labelHi: "लिंग आधारित" },
  { value: "residency", label: "Residency Based", labelHi: "निवास आधारित" },
  { value: "other", label: "Other", labelHi: "अन्य" },
]

/**
 * EligibilityCriteriaEditor — structured multilingual eligibility input
 * Each criterion has: category (dropdown), text (English), text_hi (Hindi)
 */
function EligibilityCriteriaEditor({ value = [], onChange }) {
  function addCriterion() {
    onChange([...value, { category: "", text: "", text_hi: "" }])
  }

  function removeCriterion(index) {
    onChange(value.filter((_, i) => i !== index))
  }

  function updateCriterion(index, field, val) {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: val }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Eligibility Criteria</Label>
        <Button type="button" variant="outline" size="sm" onClick={addCriterion} className="gap-1.5">
          <IconPlus className="size-3.5" /> Add Criterion
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
          No eligibility criteria added. Click &quot;Add Criterion&quot; to start.
        </div>
      )}

      {value.map((criterion, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Criterion {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeCriterion(index)}
            >
              <IconX className="size-3.5" />
            </Button>
          </div>

          {/* Category dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select
              value={criterion.category}
              onValueChange={(v) => updateCriterion(index, "category", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select eligibility category" />
              </SelectTrigger>
              <SelectContent>
                {ELIGIBILITY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* English & Hindi text in tabs */}
          <Tabs defaultValue="english" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="english" className="text-xs">English</TabsTrigger>
              <TabsTrigger value="hindi" className="text-xs">हिंदी</TabsTrigger>
            </TabsList>
            <TabsContent value="english" className="mt-2">
              <Textarea
                placeholder="Describe this eligibility criterion in English..."
                value={criterion.text}
                onChange={(e) => updateCriterion(index, "text", e.target.value)}
                rows={2}
                className="text-sm"
              />
            </TabsContent>
            <TabsContent value="hindi" className="mt-2">
              <Textarea
                placeholder="इस पात्रता मानदंड का हिंदी में वर्णन करें..."
                value={criterion.text_hi}
                onChange={(e) => updateCriterion(index, "text_hi", e.target.value)}
                rows={2}
                className="text-sm font-[inherit]"
              />
            </TabsContent>
          </Tabs>
        </div>
      ))}
    </div>
  )
}

export function SchemeForm({ formData, setFormData, onSubmit, submitLabel = "Save" }) {
  const [saving, setSaving] = React.useState(false)

  // Parse eligibility_criteria from formData
  const eligibilityCriteria = React.useMemo(() => {
    if (Array.isArray(formData.eligibility_criteria)) {
      return formData.eligibility_criteria
    }
    // If it's a string (legacy), convert to single criterion
    if (typeof formData.eligibility_criteria === "string" && formData.eligibility_criteria.trim()) {
      return [{ category: "", text: formData.eligibility_criteria, text_hi: formData.eligibility_hi || "" }]
    }
    // If there's a plain eligibility field, convert
    if (formData.eligibility || formData.eligibility_hi) {
      return [{ category: "", text: formData.eligibility || "", text_hi: formData.eligibility_hi || "" }]
    }
    return []
  }, [formData.eligibility_criteria, formData.eligibility, formData.eligibility_hi])

  async function handleImageUpload(file) {
    const response = await uploadApi.uploadSchemeImage(file)
    return response
  }

  function handleEligibilityChange(criteria) {
    setFormData((prev) => ({ ...prev, eligibility_criteria: criteria }))
  }

  async function handleSubmit() {
    if (!formData.title?.trim()) {
      toast.error("Please enter a scheme title")
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        key_objectives: typeof formData.key_objectives === "string"
          ? formData.key_objectives.split("\n").map((s) => s.trim()).filter(Boolean)
          : formData.key_objectives,
        key_objectives_hi: typeof formData.key_objectives_hi === "string"
          ? formData.key_objectives_hi.split("\n").map((s) => s.trim()).filter(Boolean)
          : formData.key_objectives_hi,
      }
      await onSubmit(payload)
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
            {SCHEME_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                <span className="capitalize">{cat}</span>
              </SelectItem>
            ))}
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

      {/* Structured Eligibility Criteria with Hindi/English + Category */}
      <EligibilityCriteriaEditor
        value={eligibilityCriteria}
        onChange={handleEligibilityChange}
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

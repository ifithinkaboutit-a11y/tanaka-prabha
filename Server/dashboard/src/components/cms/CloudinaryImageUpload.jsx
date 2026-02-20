"use client"

import * as React from "react"
import { IconUpload, IconTrash, IconPhoto } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * CloudinaryImageUpload - Drag-and-drop image upload with progress
 * Uploads via backend API (which uses Cloudinary)
 * Supports: file drop, click to upload, URL fallback
 */
export function CloudinaryImageUpload({
  value,
  onChange,
  onUploadProgress,
  uploadFn,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSizeMB = 10,
  aspectRatio = "aspect-video",
  placeholder = "Click or drag image here",
}) {
  const [preview, setPreview] = React.useState(value || null)
  const [file, setFile] = React.useState(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    setPreview(value || null)
  }, [value])

  const validateFile = (file) => {
    const allowed = accept.split(",").map(t => t.trim())
    if (!allowed.some(t => file.type === t || file.type === t.replace("image/", ""))) {
      return { valid: false, error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `File too large. Max ${maxSizeMB}MB.` }
    }
    return { valid: true }
  }

  const handleFile = React.useCallback(
    async (selectedFile) => {
      const { valid, error } = validateFile(selectedFile)
      if (!valid) {
        onUploadProgress?.({ error })
        return
      }

      setFile(selectedFile)
      const objectUrl = URL.createObjectURL(selectedFile)
      setPreview(objectUrl)

      if (uploadFn) {
        setUploading(true)
        setUploadProgress(10)
        try {
          // Simulate progress for UX (backend doesn't stream progress)
          const progressInterval = setInterval(() => {
            setUploadProgress((p) => Math.min(p + 15, 90))
          }, 200)

          const result = await uploadFn(selectedFile)
          clearInterval(progressInterval)
          setUploadProgress(100)
          const url = result?.data?.url ?? result?.url ?? result
          if (url) {
            onChange?.(url)
          }
          onUploadProgress?.({ success: true })
        } catch (err) {
          onUploadProgress?.({ error: err.message })
          setPreview(null)
          setFile(null)
        } finally {
          setUploading(false)
          setUploadProgress(0)
        }
      } else {
        onChange?.(objectUrl)
      }
    },
    [uploadFn, onChange, onUploadProgress, maxSizeMB, accept]
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = ""
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    onChange?.("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const displayUrl = preview || value

  return (
    <div className="space-y-2">
      <Label>Image</Label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg overflow-hidden transition-colors",
          isDragging && "border-primary bg-primary/5",
          !displayUrl && "cursor-pointer hover:bg-muted/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {displayUrl ? (
          <div className="relative">
            <div className={cn("w-full bg-muted", aspectRatio)}>
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/800x400/e2e8f0/64748b?text=Image"
                }}
              />
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-background rounded-full px-4 py-2 text-sm font-medium">
                  Uploading... {uploadProgress}%
                </div>
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                <IconUpload className="size-4 mr-1" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
              >
                <IconTrash className="size-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="py-10 flex flex-col items-center justify-center text-muted-foreground"
            onClick={() => inputRef.current?.click()}
          >
            <IconPhoto className="size-12 mb-2 opacity-50" />
            <p className="text-sm font-medium">{placeholder}</p>
            <p className="text-xs mt-1">
              {accept.replace(/image\//g, "").toUpperCase()} (max {maxSizeMB}MB)
            </p>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or paste URL</span>
        </div>
      </div>
      <Input
        placeholder="https://example.com/image.jpg"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => {
          const v = e.target.value.trim()
          setPreview(v || null)
          onChange?.(v || "")
        }}
      />
    </div>
  )
}

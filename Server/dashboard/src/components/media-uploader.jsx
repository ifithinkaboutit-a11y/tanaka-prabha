"use client"

import * as React from "react"
import { ImageIcon, Video, Upload, X, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { uploadApi } from "@/lib/api"
import { toast } from "sonner"

const MAX_PHOTOS = 10
const MAX_VIDEOS = 2
const MAX_VIDEO_SIZE_MB = 200
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024

/**
 * Per-file state shape:
 * { id, file, name, type ("photo"|"video"), status ("pending"|"uploading"|"success"|"error"), progress, url, error }
 */

function createFileEntry(file, type) {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        type,
        status: "pending",
        progress: 0,
        url: null,
        error: null,
    }
}

function StatusIcon({ status }) {
    if (status === "uploading") return <Loader2 className="size-4 animate-spin text-blue-500" />
    if (status === "success") return <CheckCircle2 className="size-4 text-green-500" />
    if (status === "error") return <AlertCircle className="size-4 text-red-500" />
    return <Upload className="size-4 text-muted-foreground" />
}

/**
 * MediaUploader
 *
 * Props:
 *   mediaUrls: string[]          — current saved URLs (from editData.media_urls)
 *   onChange: (urls: string[]) => void  — called whenever the committed URL list changes
 */
export function MediaUploader({ mediaUrls = [], onChange }) {
    const [files, setFiles] = React.useState([])
    const photoInputRef = React.useRef(null)
    const videoInputRef = React.useRef(null)

    // Count current photos/videos (pending + uploading + success)
    const photoCount = files.filter(f => f.type === "photo" && f.status !== "error").length
    const videoCount = files.filter(f => f.type === "video" && f.status !== "error").length

    function handlePhotoSelect(e) {
        const selected = Array.from(e.target.files || [])
        e.target.value = ""
        if (!selected.length) return

        const remaining = MAX_PHOTOS - photoCount
        if (remaining <= 0) {
            toast.error(`Maximum ${MAX_PHOTOS} photos allowed`)
            return
        }
        const toAdd = selected.slice(0, remaining)
        if (toAdd.length < selected.length) {
            toast.warning(`Only ${remaining} more photo(s) can be added (max ${MAX_PHOTOS})`)
        }
        const entries = toAdd.map(f => createFileEntry(f, "photo"))
        setFiles(prev => [...prev, ...entries])
        entries.forEach(entry => uploadFile(entry))
    }

    function handleVideoSelect(e) {
        const selected = Array.from(e.target.files || [])
        e.target.value = ""
        if (!selected.length) return

        const remaining = MAX_VIDEOS - videoCount
        if (remaining <= 0) {
            toast.error(`Maximum ${MAX_VIDEOS} videos allowed`)
            return
        }

        const oversized = selected.filter(f => f.size > MAX_VIDEO_SIZE_BYTES)
        if (oversized.length) {
            toast.error(`${oversized.map(f => f.name).join(", ")} exceed${oversized.length === 1 ? "s" : ""} the ${MAX_VIDEO_SIZE_MB}MB limit`)
            return
        }

        const toAdd = selected.slice(0, remaining)
        if (toAdd.length < selected.length) {
            toast.warning(`Only ${remaining} more video(s) can be added (max ${MAX_VIDEOS})`)
        }
        const entries = toAdd.map(f => createFileEntry(f, "video"))
        setFiles(prev => [...prev, ...entries])
        entries.forEach(entry => uploadFile(entry))
    }

    async function uploadFile(entry) {
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "uploading", progress: 0 } : f))

        try {
            // Simulate progress via XHR so we can track it
            const url = await uploadWithProgress(entry.file, (pct) => {
                setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, progress: pct } : f))
            })

            setFiles(prev => {
                const next = prev.map(f => f.id === entry.id ? { ...f, status: "success", progress: 100, url } : f)
                // Notify parent: existing DB URLs + all newly uploaded URLs
                const newlyUploaded = next.filter(f => f.status === "success" && f.url).map(f => f.url)
                // Use a Set to avoid duplicates when mediaUrls already contains some of these
                const allUrls = Array.from(new Set([...mediaUrls, ...newlyUploaded]))
                onChange(allUrls)
                return next
            })
        } catch (err) {
            setFiles(prev => prev.map(f =>
                f.id === entry.id ? { ...f, status: "error", progress: 0, error: err.message || "Upload failed" } : f
            ))
        }
    }

    function handleRetry(entry) {
        uploadFile({ ...entry, status: "pending", progress: 0, error: null })
    }

    function handleRemove(id) {
        setFiles(prev => {
            const removed = prev.find(f => f.id === id)
            const next = prev.filter(f => f.id !== id)
            const remainingNewUrls = next.filter(f => f.status === "success" && f.url).map(f => f.url)
            // Keep existing DB URLs, minus the one being removed (if it was already saved)
            const updatedUrls = mediaUrls.filter(u => u !== removed?.url)
            onChange(Array.from(new Set([...updatedUrls, ...remainingNewUrls])))
            return next
        })
    }

    // Recompute committed URLs whenever files change (for parent sync)
    // (already done inside uploadFile and handleRemove)

    return (
        <div className="space-y-4">
            {/* ── Photo Picker ── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                        <ImageIcon className="size-4" /> Photos
                        <span className="text-xs text-muted-foreground font-normal">({photoCount}/{MAX_PHOTOS})</span>
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={photoCount >= MAX_PHOTOS}
                        onClick={() => photoInputRef.current?.click()}
                    >
                        <ImageIcon className="size-3.5 mr-1.5" /> Add Photos
                    </Button>
                </div>
                <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoSelect}
                />
            </div>

            {/* ── Video Picker ── */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                        <Video className="size-4" /> Videos
                        <span className="text-xs text-muted-foreground font-normal">({videoCount}/{MAX_VIDEOS}, max {MAX_VIDEO_SIZE_MB}MB each)</span>
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={videoCount >= MAX_VIDEOS}
                        onClick={() => videoInputRef.current?.click()}
                    >
                        <Video className="size-3.5 mr-1.5" /> Add Videos
                    </Button>
                </div>
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={handleVideoSelect}
                />
            </div>

            {/* ── File List ── */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map(f => (
                        <FileRow key={f.id} entry={f} onRetry={handleRetry} onRemove={handleRemove} />
                    ))}
                </div>
            )}

            {/* ── Existing saved URLs (from DB) ── */}
            {mediaUrls.length > 0 && files.length === 0 && (
                <p className="text-xs text-muted-foreground">{mediaUrls.length} media file(s) already saved.</p>
            )}
        </div>
    )
}

function FileRow({ entry, onRetry, onRemove }) {
    const isImage = entry.type === "photo"
    const Icon = isImage ? ImageIcon : Video

    return (
        <div className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                {entry.status === "uploading" && (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-200"
                            style={{ width: `${entry.progress}%` }}
                        />
                    </div>
                )}
                {entry.status === "error" && (
                    <p className="text-xs text-red-500 mt-0.5">{entry.error}</p>
                )}
                {entry.status === "success" && (
                    <p className="text-xs text-green-600 mt-0.5">Uploaded</p>
                )}
                {entry.status === "pending" && (
                    <p className="text-xs text-muted-foreground mt-0.5">Pending…</p>
                )}
            </div>
            <StatusIcon status={entry.status} />
            {entry.status === "error" && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-blue-600"
                    onClick={() => onRetry(entry)}
                    title="Retry upload"
                >
                    <RefreshCw className="size-3.5" />
                </Button>
            )}
            {entry.status !== "uploading" && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-red-600"
                    onClick={() => onRemove(entry.id)}
                    title="Remove"
                >
                    <X className="size-3.5" />
                </Button>
            )}
        </div>
    )
}

/**
 * Upload a file using XHR so we can track progress.
 * Falls back to uploadApi.uploadGeneral for simplicity.
 */
async function uploadWithProgress(file, onProgress) {
    return new Promise((resolve, reject) => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
        const DASHBOARD_API_KEY = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

        const xhr = new XMLHttpRequest()
        const formData = new FormData()
        formData.append("file", file)

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100))
            }
        })

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText)
                    const url = data?.data?.url || data?.url
                    if (!url) reject(new Error("No URL in response"))
                    else resolve(url)
                } catch {
                    reject(new Error("Invalid response from server"))
                }
            } else {
                let msg = "Upload failed"
                try {
                    const data = JSON.parse(xhr.responseText)
                    msg = data?.message || data?.error || msg
                } catch { /* ignore */ }
                reject(new Error(msg))
            }
        })

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")))
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")))

        xhr.open("POST", `${API_BASE_URL}/upload/general`)
        xhr.setRequestHeader("X-Dashboard-Api-Key", DASHBOARD_API_KEY || "")
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        xhr.send(formData)
    })
}

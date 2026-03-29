"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X, ImageOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"]
const VIDEO_EXTENSIONS = ["mp4", "mov", "webm"]

function getExtension(url) {
  try {
    const pathname = new URL(url).pathname
    return pathname.split(".").pop().toLowerCase()
  } catch {
    return url.split(".").pop().toLowerCase()
  }
}

function isImage(url) {
  return IMAGE_EXTENSIONS.includes(getExtension(url))
}

function isVideo(url) {
  return VIDEO_EXTENSIONS.includes(getExtension(url))
}

function Lightbox({ urls, initialIndex, onClose }) {
  const [index, setIndex] = React.useState(initialIndex)

  const prev = React.useCallback(() => {
    setIndex((i) => (i - 1 + urls.length) % urls.length)
  }, [urls.length])

  const next = React.useCallback(() => {
    setIndex((i) => (i + 1) % urls.length)
  }, [urls.length])

  React.useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
      else if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [prev, next, onClose])

  const url = urls[index]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="size-6" />
      </button>

      {/* Prev */}
      {urls.length > 1 && (
        <button
          className="absolute left-4 text-white/80 hover:text-white p-2"
          onClick={(e) => { e.stopPropagation(); prev() }}
          aria-label="Previous image"
        >
          <ChevronLeft className="size-8" />
        </button>
      )}

      {/* Image */}
      <img
        src={url}
        alt={`Media ${index + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {urls.length > 1 && (
        <button
          className="absolute right-4 text-white/80 hover:text-white p-2"
          onClick={(e) => { e.stopPropagation(); next() }}
          aria-label="Next image"
        >
          <ChevronRight className="size-8" />
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 text-white/70 text-sm">
        {index + 1} / {urls.length}
      </div>
    </div>
  )
}

export function ProgrammeGallery({ eventId: _eventId, mediaUrls = [], open, onClose }) {
  const [lightboxIndex, setLightboxIndex] = React.useState(null)

  // Only image URLs are eligible for lightbox
  const imageUrls = mediaUrls.filter(isImage)

  function openLightbox(url) {
    const idx = imageUrls.indexOf(url)
    if (idx !== -1) setLightboxIndex(idx)
  }

  function closeLightbox() {
    setLightboxIndex(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Programme Gallery</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {mediaUrls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <ImageOff className="size-10 opacity-40" />
                <p className="text-sm">No media uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
                {mediaUrls.map((url, i) => {
                  if (isVideo(url)) {
                    return (
                      <div key={i} className="rounded-md overflow-hidden bg-black aspect-video">
                        <video
                          src={url}
                          controls
                          className="w-full h-full object-contain"
                          preload="metadata"
                        />
                      </div>
                    )
                  }

                  if (isImage(url)) {
                    return (
                      <button
                        key={i}
                        className="rounded-md overflow-hidden aspect-square bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                        onClick={() => openLightbox(url)}
                        aria-label={`Open image ${i + 1}`}
                      >
                        <img
                          src={url}
                          alt={`Media ${i + 1}`}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          loading="lazy"
                        />
                      </button>
                    )
                  }

                  // Unknown type — render as link
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border p-3 text-xs text-muted-foreground truncate hover:underline"
                    >
                      {url.split("/").pop()}
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {lightboxIndex !== null && (
        <Lightbox
          urls={imageUrls}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  )
}

export default ProgrammeGallery

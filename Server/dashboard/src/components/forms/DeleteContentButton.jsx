"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { schemesApi, bannersApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DeleteContentButton({ contentId, contentType, contentTitle }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        setDeleting(true)
        try {
            if (contentType === "scheme") {
                await schemesApi.delete(contentId)
            } else {
                await bannersApi.delete(contentId)
            }
            toast.success(`${contentType === "scheme" ? "Scheme" : "Banner"} deleted successfully`)
            router.push("/content")
            router.refresh()
        } catch {
            toast.error("Failed to delete content")
            setDeleting(false)
            setOpen(false)
        }
    }

    return (
        <>
            <Button variant="destructive" onClick={() => setOpen(true)} className="w-full gap-2">
                <Trash2 className="size-4" /> Delete
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {contentType === "scheme" ? "Scheme" : "Banner"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{contentTitle || "this content"}</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

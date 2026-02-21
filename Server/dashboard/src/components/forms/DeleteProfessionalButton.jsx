"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { professionalsApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DeleteProfessionalButton({ professionalId, professionalName }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        setDeleting(true)
        try {
            await professionalsApi.delete(professionalId)
            toast.success("Professional removed successfully")
            router.push("/professionals")
            router.refresh()
        } catch {
            toast.error("Failed to remove professional")
            setDeleting(false)
            setOpen(false)
        }
    }

    return (
        <>
            <Button variant="destructive" size="sm" onClick={() => setOpen(true)} className="flex-1 gap-2">
                <Trash2 className="size-3.5" /> Remove
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Professional</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <strong>{professionalName || "this professional"}</strong>?
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
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

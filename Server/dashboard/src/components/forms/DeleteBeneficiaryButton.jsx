"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { usersApi } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DeleteBeneficiaryButton({ userId, userName }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        setDeleting(true)
        try {
            await usersApi.delete(userId)
            toast.success("Beneficiary deleted successfully")
            router.push("/beneficiaries")
            router.refresh()
        } catch (err) {
            toast.error("Failed to delete beneficiary")
            setDeleting(false)
            setOpen(false)
        }
    }

    return (
        <>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setOpen(true)}
                className="flex-1 gap-2"
            >
                <Trash2 className="size-3.5" /> Delete
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Beneficiary</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{userName || "this beneficiary"}</strong>?
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

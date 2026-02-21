"use client"

import { useState } from "react"
import { Pencil, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet, SheetContent, SheetDescription,
    SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { usersApi } from "@/lib/api"
import { ASSAM_DISTRICTS, INDIA_STATES } from "@/lib/constants"
import { toast } from "sonner"

export function BeneficiarySheet({ user, mode = "add", onSuccess }) {
    const isEdit = mode === "edit"
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        name: user?.name || "",
        mobile_number: user?.mobile_number || "",
        age: user?.age || "",
        gender: user?.gender || "",
        village: user?.village || "",
        block: user?.block || "",
        district: user?.district || "",
        state: user?.state || "Assam",
        fathers_name: user?.fathers_name || "",
        educational_qualification: user?.educational_qualification || "",
    })
    const [errors, setErrors] = useState({})

    function set(key, val) {
        setForm(p => ({ ...p, [key]: val }))
        setErrors(p => ({ ...p, [key]: "" }))
    }

    function validate() {
        const errs = {}
        if (!form.name.trim()) errs.name = "Name is required"
        if (!form.mobile_number.trim()) errs.mobile_number = "Mobile number is required"
        else if (form.mobile_number.replace(/\D/g, "").length < 10) errs.mobile_number = "Enter a valid 10-digit number"
        return errs
    }

    async function handleSubmit() {
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setSaving(true)
        try {
            if (isEdit) {
                await usersApi.update(user.id, form)
                toast.success("Beneficiary updated successfully")
            } else {
                await usersApi.create(form)
                toast.success("Beneficiary added successfully")
            }
            setOpen(false)
            onSuccess?.()
        } catch (err) {
            toast.error(err.message || `Failed to ${isEdit ? "update" : "add"} beneficiary`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {isEdit ? (
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Pencil className="size-3.5" /> Edit
                    </Button>
                ) : (
                    <Button size="sm" className="gap-2">
                        <UserPlus className="size-4" /> Add Beneficiary
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "Edit Beneficiary" : "Add New Beneficiary"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? "Update farmer details." : "Register a new farmer beneficiary."}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                    {[
                        { key: "name", label: "Full Name *", placeholder: "Enter full name" },
                        { key: "mobile_number", label: "Mobile Number *", placeholder: "10-digit mobile number" },
                        { key: "age", label: "Age", placeholder: "Age (years)", type: "number" },
                        { key: "fathers_name", label: "Father's Name", placeholder: "Enter father's name" },
                        { key: "educational_qualification", label: "Education", placeholder: "e.g., 10th Pass, Graduate" },
                        { key: "village", label: "Village", placeholder: "Village name" },
                        { key: "block", label: "Block", placeholder: "Block name" },
                    ].map(({ key, label, placeholder, type }) => (
                        <div key={key} className="space-y-1.5">
                            <Label htmlFor={key}>{label}</Label>
                            <Input
                                id={key}
                                type={type || "text"}
                                placeholder={placeholder}
                                value={form[key]}
                                onChange={e => set(key, e.target.value)}
                                className={errors[key] ? "border-destructive" : ""}
                            />
                            {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
                        </div>
                    ))}
                    <div className="space-y-1.5">
                        <Label>Gender</Label>
                        <Select value={form.gender} onValueChange={v => set("gender", v)}>
                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>District</Label>
                        <Select value={form.district} onValueChange={v => set("district", v)}>
                            <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                            <SelectContent>
                                {ASSAM_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>State</Label>
                        <Select value={form.state} onValueChange={v => set("state", v)}>
                            <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                            <SelectContent>
                                {INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <SheetFooter className="mt-6">
                    <Button onClick={handleSubmit} className="w-full" disabled={saving}>
                        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {isEdit ? "Save Changes" : "Add Beneficiary"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

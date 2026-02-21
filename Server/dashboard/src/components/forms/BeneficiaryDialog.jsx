"use client"

import { useState } from "react"
import { Pencil, Loader2, UserPlus, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { usersApi } from "@/lib/api"
import { ASSAM_DISTRICTS, INDIA_STATES } from "@/lib/constants"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function BeneficiaryDialog({ user, mode = "add", onSuccess, customTrigger }) {
    const isEdit = mode === "edit"
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(1)
    const totalSteps = 2

    const [form, setForm] = useState({
        name: user?.name || "",
        mobile_number: user?.mobile_number || "",
        age: user?.age || "",
        gender: user?.gender || "",
        fathers_name: user?.fathers_name || "",
        educational_qualification: user?.educational_qualification || "",
        village: user?.village || "",
        block: user?.block || "",
        district: user?.district || "",
        state: user?.state || "Assam",
    })
    const [errors, setErrors] = useState({})

    function set(key, val) {
        setForm(p => ({ ...p, [key]: val }))
        setErrors(p => ({ ...p, [key]: "" }))
    }

    function validateStep1() {
        const errs = {}
        if (!form.name.trim()) errs.name = "Name is required"
        if (!form.mobile_number.trim()) errs.mobile_number = "Mobile is required"
        else if (form.mobile_number.replace(/\D/g, "").length < 10) errs.mobile_number = "10-digit number required"
        return errs
    }

    function validateStep2() {
        const errs = {}
        return errs
    }

    function handleNext() {
        if (step === 1) {
            const errs = validateStep1()
            if (Object.keys(errs).length > 0) { setErrors(errs); return }
            setStep(2)
        }
    }

    function handleBack() {
        if (step > 1) setStep(step - 1)
    }

    async function handleSubmit() {
        const errs = validateStep2()
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
            setStep(1)
            onSuccess?.()
        } catch (err) {
            toast.error(err.message || `Failed to ${isEdit ? "update" : "add"} beneficiary`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setStep(1); }}>
            <DialogTrigger asChild>
                {customTrigger ? customTrigger : (
                    isEdit ? (
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                            <Pencil className="size-3.5" /> Edit
                        </Button>
                    ) : (
                        <Button size="sm" className="gap-2">
                            <UserPlus className="size-4" /> Add Beneficiary
                        </Button>
                    )
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background">
                <div className="px-6 pt-6 pb-4 border-b bg-muted/30">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit Beneficiary" : "Add New Beneficiary"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Update farmer details." : "Register a new farmer beneficiary."}
                        </DialogDescription>
                    </DialogHeader>
                    {/* Stepper Progress */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                                <div className={cn("h-full bg-primary transition-all duration-300", step >= s ? "w-full" : "w-0")} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                            {[
                                { key: "name", label: "Full Name *", placeholder: "Enter full name" },
                                { key: "mobile_number", label: "Mobile Number *", placeholder: "10-digit mobile number" },
                                { key: "age", label: "Age", placeholder: "Age (years)", type: "number" },
                                { key: "fathers_name", label: "Father's Name", placeholder: "Enter father's name" },
                                { key: "educational_qualification", label: "Education", placeholder: "e.g., 10th Pass, Graduate" },
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
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-left-2 duration-300">
                            {[
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
                                    />
                                </div>
                            ))}
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
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-muted/30 flex gap-3">
                    {step > 1 ? (
                        <Button variant="outline" onClick={handleBack} className="flex-1">
                            <ChevronLeft className="size-4 mr-1" /> Back
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                    )}

                    {step < totalSteps ? (
                        <Button onClick={handleNext} className="flex-1">
                            Continue <ChevronRight className="size-4 ml-1" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} className="flex-1" disabled={saving}>
                            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                            {isEdit ? "Save Changes" : "Complete Registration"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

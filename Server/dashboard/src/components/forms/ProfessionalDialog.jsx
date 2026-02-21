"use client"

import { useState } from "react"
import { Pencil, Loader2, UserPlus, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { professionalsApi } from "@/lib/api"
import { ASSAM_DISTRICTS } from "@/lib/constants"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ProfessionalDialog({ professional, mode = "add", onSuccess, customTrigger }) {
    const isEdit = mode === "edit"
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(1)
    const totalSteps = 2

    const [form, setForm] = useState({
        name: professional?.name || "",
        role: professional?.role || "",
        department: professional?.department || "",
        category: professional?.category || professional?.type || "",
        phone_number: professional?.phone_number || professional?.phone || "",
        district: professional?.district || "",
        service_area: professional?.service_area || "",
        specializations: Array.isArray(professional?.specializations)
            ? professional.specializations.join(", ")
            : professional?.specializations || professional?.specialization || "",
        is_available: professional?.is_available !== false,
    })

    function set(key, val) { setForm(p => ({ ...p, [key]: val })) }

    function validateStep1() {
        if (!form.name.trim()) return "Name is required"
        if (!form.category) return "Category is required"
        if (form.phone_number && !/^\d{10}$/.test(form.phone_number.replace(/\s/g, "")))
            return "Phone number must be 10 digits"
        return null
    }

    function handleNext() {
        if (step === 1) {
            const err = validateStep1()
            if (err) { toast.error(err); return }
            setStep(2)
        }
    }

    function handleBack() {
        if (step > 1) setStep(step - 1)
    }

    async function handleSubmit() {
        setSaving(true)
        try {
            const payload = { ...form }
            // Convert specializations from comma-separated string to JSON array for DB
            if (typeof payload.specializations === "string" && payload.specializations.trim()) {
                payload.specializations = payload.specializations.split(",").map(s => s.trim()).filter(Boolean)
            } else {
                payload.specializations = []
            }

            // Convert service_area string to a JSON object for the JSONB column
            if (typeof payload.service_area === "string" && payload.service_area.trim()) {
                payload.service_area = { area: payload.service_area.trim() }
            } else {
                payload.service_area = null
            }

            if (isEdit) {
                await professionalsApi.update(professional.id, payload)
                toast.success("Professional updated successfully")
            } else {
                await professionalsApi.create(payload)
                toast.success("Professional added successfully")
            }
            setOpen(false)
            setStep(1)
            onSuccess?.()
        } catch (err) {
            toast.error(err.message || `Failed to ${isEdit ? "update" : "add"} professional`)
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
                            <UserPlus className="size-4" /> Add Professional
                        </Button>
                    )
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background">
                <div className="px-6 pt-6 pb-4 border-b bg-muted/30">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit Professional" : "Add Professional"}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? "Update professional details." : "Register a new doctor, vet, or expert."}
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
                                { key: "name", label: "Full Name *", placeholder: "e.g., Dr. Rajesh Kumar" },
                                { key: "role", label: "Role", placeholder: "e.g., Senior Veterinarian" },
                                { key: "phone_number", label: "Phone Number", placeholder: "10-digit number" },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key} className="space-y-1.5">
                                    <Label htmlFor={key}>{label}</Label>
                                    <Input id={key} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} />
                                </div>
                            ))}
                            <div className="space-y-1.5">
                                <Label>Category *</Label>
                                <Select value={form.category} onValueChange={v => set("category", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="doctor">Doctor</SelectItem>
                                        <SelectItem value="veterinary">Veterinary</SelectItem>
                                        <SelectItem value="agricultural">Agricultural Expert</SelectItem>
                                        <SelectItem value="legal">Legal Advisor</SelectItem>
                                        <SelectItem value="financial">Financial Advisor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-left-2 duration-300">
                            {[
                                { key: "department", label: "Department", placeholder: "e.g., Animal Husbandry" },
                                { key: "service_area", label: "Service Area", placeholder: "e.g., North Assam" },
                                { key: "specializations", label: "Specializations", placeholder: "Comma separated, e.g. Dairy, Poultry" },
                            ].map(({ key, label, placeholder }) => (
                                <div key={key} className="space-y-1.5">
                                    <Label htmlFor={key}>{label}</Label>
                                    <Input id={key} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} />
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
                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <Switch
                                    id="is_available"
                                    checked={form.is_available}
                                    onCheckedChange={v => set("is_available", v)}
                                />
                                <Label htmlFor="is_available" className="cursor-pointer">
                                    {form.is_available ? "Available for appointments" : "Currently unavailable"}
                                </Label>
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
                            {isEdit ? "Save Changes" : "Add Professional"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

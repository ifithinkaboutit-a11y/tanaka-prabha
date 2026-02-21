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
import { Switch } from "@/components/ui/switch"
import { professionalsApi } from "@/lib/api"
import { ASSAM_DISTRICTS } from "@/lib/constants"
import { toast } from "sonner"

export function ProfessionalSheet({ professional, mode = "add", onSuccess }) {
    const isEdit = mode === "edit"
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
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

    async function handleSubmit() {
        if (!form.name.trim()) { toast.error("Name is required"); return }
        if (!form.category) { toast.error("Category is required"); return }
        setSaving(true)
        try {
            const payload = { ...form }
            if (isEdit) {
                await professionalsApi.update(professional.id, payload)
                toast.success("Professional updated successfully")
            } else {
                await professionalsApi.create(payload)
                toast.success("Professional added successfully")
            }
            setOpen(false)
            onSuccess?.()
        } catch (err) {
            toast.error(err.message || `Failed to ${isEdit ? "update" : "add"} professional`)
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
                        <UserPlus className="size-4" /> Add Professional
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "Edit Professional" : "Add Professional"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? "Update professional details." : "Register a new doctor, vet, or expert."}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                    {[
                        { key: "name", label: "Full Name *", placeholder: "e.g., Dr. Rajesh Kumar" },
                        { key: "role", label: "Role *", placeholder: "e.g., Senior Veterinarian" },
                        { key: "department", label: "Department", placeholder: "e.g., Animal Husbandry" },
                        { key: "phone_number", label: "Phone Number", placeholder: "10-digit number" },
                        { key: "service_area", label: "Service Area", placeholder: "e.g., North Assam" },
                        { key: "specializations", label: "Specializations", placeholder: "Comma separated, e.g. Dairy, Poultry" },
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
                <SheetFooter className="mt-6">
                    <Button onClick={handleSubmit} className="w-full" disabled={saving}>
                        {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {isEdit ? "Save Changes" : "Add Professional"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

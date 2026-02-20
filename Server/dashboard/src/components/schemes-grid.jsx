"use client"

import * as React from "react"
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconPhoto,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { schemesApi } from "@/lib/api"
import { toast } from "sonner"
import { SchemeForm } from "@/components/cms/SchemeForm"

export function SchemesGrid() {
  const [schemes, setSchemes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingScheme, setEditingScheme] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState(null)
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    overview: "",
    process: "",
    eligibility: "",
    key_objectives: "",
    title_hi: "",
    description_hi: "",
    overview_hi: "",
    process_hi: "",
    eligibility_hi: "",
    key_objectives_hi: "",
    category: "",
    image_url: "",
    is_active: true,
  })

  React.useEffect(() => {
    fetchSchemes()
  }, [])

  async function fetchSchemes() {
    try {
      const response = await schemesApi.getAll()
      const schemes = response.data?.schemes || response.data || []
      
      if (!Array.isArray(schemes)) {
        console.warn("Unexpected response format:", response)
        setSchemes([])
        return
      }
      
      setSchemes(schemes)
    } catch (error) {
      console.error("Error fetching schemes:", error)
      toast.error(error.message || "Failed to load schemes. Please check your connection.")
      setSchemes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddScheme(data) {
    const schemeData = { ...data, is_active: true }
    const response = await schemesApi.create(schemeData)
    const newScheme = response.data?.scheme || response.data
    setSchemes(prev => [newScheme, ...prev])
    setIsAddOpen(false)
    resetForm()
    toast.success("Scheme added successfully")
  }

  function openEditSheet(scheme) {
    setEditingScheme(scheme)
    setFormData({
      title: scheme.title || "",
      description: scheme.description || "",
      overview: scheme.overview || "",
      process: scheme.process || "",
      eligibility: scheme.eligibility || "",
      key_objectives: scheme.key_objectives || "",
      title_hi: scheme.title_hi || "",
      description_hi: scheme.description_hi || "",
      overview_hi: scheme.overview_hi || "",
      process_hi: scheme.process_hi || "",
      eligibility_hi: scheme.eligibility_hi || "",
      key_objectives_hi: scheme.key_objectives_hi || "",
      category: scheme.category || "",
      image_url: scheme.image_url || "",
      is_active: scheme.is_active ?? true,
    })
    setIsEditOpen(true)
  }

  async function handleUpdateScheme(data) {
    if (!editingScheme) return
    const response = await schemesApi.update(editingScheme.id, data)
    const updated = response.data?.scheme || response.data
    setSchemes(prev => prev.map(s => (s.id === editingScheme.id ? { ...s, ...updated } : s)))
    setIsEditOpen(false)
    setEditingScheme(null)
    resetForm()
    toast.success("Scheme updated successfully")
  }

  async function handleDeleteScheme() {
    if (!deleteId) return

    try {
      await schemesApi.delete(deleteId)
      setSchemes(prev => prev.filter(s => s.id !== deleteId))
      toast.success("Scheme deleted successfully")
    } catch (error) {
      console.error("Error deleting scheme:", error)
      toast.error("Failed to delete scheme")
    } finally {
      setDeleteId(null)
    }
  }

  async function toggleSchemeStatus(id) {
    try {
      const response = await schemesApi.toggleStatus(id)
      setSchemes(prev => prev.map(s => 
        s.id === id ? { ...s, is_active: response.data?.scheme?.is_active ?? response.data.is_active } : s
      ))
      toast.success(`Scheme ${response.data?.scheme?.is_active ?? response.data.is_active ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Error updating scheme:", error)
      toast.error("Failed to update scheme")
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      description: "",
      overview: "",
      process: "",
      eligibility: "",
      key_objectives: "",
      title_hi: "",
      description_hi: "",
      overview_hi: "",
      process_hi: "",
      eligibility_hi: "",
      key_objectives_hi: "",
      category: "",
      image_url: "",
      is_active: true,
    })
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-40 w-full rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Government Schemes & Programs</h2>
          <p className="text-sm text-muted-foreground">
            Manage schemes and programs. Add content in English and हिंदी.
          </p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button onClick={resetForm}>
              <IconPlus className="size-4 mr-2" />
              Add Scheme
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Scheme / Program</SheetTitle>
              <SheetDescription>
                Create a scheme or program. Add content in English and Hindi.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <SchemeForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddScheme}
                submitLabel="Add Scheme"
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Edit Scheme Sheet */}
        <Sheet open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingScheme(null); resetForm(); } }}>
          <SheetContent className="sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Scheme / Program</SheetTitle>
              <SheetDescription>
                Update scheme or program details. Edit content in English and Hindi.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <SchemeForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateScheme}
                submitLabel="Update Scheme"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {schemes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconPhoto className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No schemes yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first government scheme
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <IconPlus className="size-4 mr-2" />
              Add Scheme
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <Card key={scheme.id} className={!scheme.is_active ? "opacity-60" : ""}>
              <CardHeader className="p-0 relative">
                {scheme.image_url ? (
                  <img 
                    src={scheme.image_url} 
                    alt={scheme.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x200/e2e8f0/64748b?text=Scheme"
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                    <IconPhoto className="size-10 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {scheme.category && (
                    <Badge variant="secondary" className="capitalize">
                      {scheme.category}
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={scheme.is_active 
                      ? "bg-green-500/90 text-white border-green-600" 
                      : "bg-gray-500/90 text-white border-gray-600"
                    }
                  >
                    {scheme.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{scheme.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {scheme.description || "No description available"}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <IconDotsVertical className="size-4 mr-2" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem>
                      <IconEye className="size-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditSheet(scheme)}>
                      <IconEdit className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSchemeStatus(scheme.id)}>
                      {scheme.is_active ? (
                        <>
                          <IconEyeOff className="size-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <IconEye className="size-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => setDeleteId(scheme.id)}
                    >
                      <IconTrash className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scheme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scheme? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteScheme}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { schemesApi } from "@/lib/api"
import { SCHEME_CATEGORIES } from "@/lib/constants"
import { toast } from "sonner"
import { SchemeForm } from "@/components/cms/SchemeForm"

const CATEGORY_LABELS = Object.fromEntries(SCHEME_CATEGORIES.map((c) => [c.value, c.label]))

export function SchemesGrid() {
  const router = useRouter()
  const [schemes, setSchemes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
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
    eligibility_criteria: [],
  })

  React.useEffect(() => {
    fetchSchemes()
  }, [])

  async function fetchSchemes() {
    try {
      // No `active_only` — unpublished schemes must stay visible so they can be republished.
      const response = await schemesApi.getAll({ limit: 200 })
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
    toast.success("Scheme published successfully")
  }

  function openEditSheet(scheme) {
    setEditingScheme(scheme)
    setFormData({
      title: scheme.title || "",
      description: scheme.description || "",
      overview: scheme.overview || "",
      process: scheme.process || "",
      eligibility: scheme.eligibility || "",
      key_objectives: Array.isArray(scheme.key_objectives) ? scheme.key_objectives.join("\n") : (scheme.key_objectives || ""),
      title_hi: scheme.title_hi || "",
      description_hi: scheme.description_hi || "",
      overview_hi: scheme.overview_hi || "",
      process_hi: scheme.process_hi || "",
      eligibility_hi: scheme.eligibility_hi || "",
      key_objectives_hi: Array.isArray(scheme.key_objectives_hi) ? scheme.key_objectives_hi.join("\n") : (scheme.key_objectives_hi || ""),
      category: scheme.category || "",
      image_url: scheme.image_url || "",
      is_active: scheme.is_active ?? true,
      eligibility_criteria: scheme.eligibility_criteria || [],
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

  async function toggleSchemeStatus(scheme) {
    // Fall back to flipping the local value if the response shape is unexpected,
    // so publishing/republishing never leaves the card showing a stale state.
    try {
      const response = await schemesApi.toggleStatus(scheme.id)
      const updated = response?.data?.scheme ?? response?.data ?? {}
      const nextActive = typeof updated.is_active === "boolean" ? updated.is_active : !scheme.is_active
      setSchemes(prev => prev.map(s => (s.id === scheme.id ? { ...s, is_active: nextActive } : s)))
      toast.success(nextActive ? "Scheme published" : "Scheme unpublished")
    } catch (error) {
      console.error("Error updating scheme:", error)
      toast.error(error.message || "Failed to update scheme")
    }
  }

  async function toggleFeatured(id, currentFeatured) {
    try {
      await schemesApi.update(id, { is_featured: !currentFeatured })
      setSchemes(prev => prev.map(s => s.id === id ? { ...s, is_featured: !currentFeatured } : s))
      toast.success(!currentFeatured ? "Marked as Recommended" : "Removed from Recommended")
    } catch (error) {
      toast.error("Failed to update")
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
      eligibility_criteria: [],
    })
  }

  const visibleSchemes = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return schemes.filter((s) => {
      if (statusFilter === "published" && !s.is_active) return false
      if (statusFilter === "unpublished" && s.is_active) return false
      if (categoryFilter !== "all" && s.category !== categoryFilter) return false
      if (q && !`${s.title ?? ""} ${s.title_hi ?? ""} ${s.description ?? ""}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [schemes, search, statusFilter, categoryFilter])

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
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <IconPlus className="size-4 mr-2" />
              Add Scheme
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Scheme / Program</DialogTitle>
              <DialogDescription>
                Create a scheme or program. English and Hindi are edited side by side.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <SchemeForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddScheme}
                submitLabel="Add Scheme"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Scheme Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingScheme(null); resetForm(); } }}>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Scheme / Program</DialogTitle>
              <DialogDescription>
                Update scheme or program details. English and Hindi are edited side by side.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <SchemeForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateScheme}
                submitLabel="Update Scheme"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar — status filter makes unpublished schemes findable for republishing */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card p-3">
        <Input
          placeholder="Search schemes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {SCHEME_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">
          {visibleSchemes.length} of {schemes.length}
        </span>
      </div>

      {visibleSchemes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconPhoto className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {schemes.length === 0 ? "No schemes yet" : "No schemes match these filters"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {schemes.length === 0
                ? "Create your first government scheme"
                : "Try clearing the status, category or search filters"}
            </p>
            {schemes.length === 0 && (
              <Button onClick={() => setIsAddOpen(true)}>
                <IconPlus className="size-4 mr-2" />
                Add Scheme
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleSchemes.map((scheme) => (
            <Card key={scheme.id} className={!scheme.is_active ? "opacity-60" : ""}>
              <CardHeader className="p-0 relative">
                {scheme.image_url ? (
                  <img
                    src={scheme.image_url}
                    alt={scheme.title}
                    className="top-0 left-0 object-cover h-full w-full p-4"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/600x200/e2e8f0/64748b?text=Scheme"
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-linear-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
                    <IconPhoto className="size-10 text-primary/40" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {scheme.category && (
                    <Badge variant="secondary">
                      {CATEGORY_LABELS[scheme.category] || scheme.category}
                    </Badge>
                  )}
                  {scheme.is_featured && (
                    <Badge className="bg-amber-500/90 text-white border-amber-600">
                      ⭐ Recommended
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={scheme.is_active
                      ? "bg-zinc-500/90 text-white border-zinc-600"
                      : "bg-gray-500/90 text-white border-gray-600"
                    }
                  >
                    {scheme.is_active ? "Published" : "Unpublished"}
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
                    <DropdownMenuItem onClick={() => router.push(`/content/scheme-${scheme.id}`)}>
                      <IconEye className="size-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditSheet(scheme)}>
                      <IconEdit className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleSchemeStatus(scheme)}>
                      {scheme.is_active ? (
                        <>
                          <IconEyeOff className="size-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <IconEye className="size-4 mr-2" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleFeatured(scheme.id, scheme.is_featured)}>
                      {scheme.is_featured ? "★ Remove Recommended" : "☆ Mark Recommended"}
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

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
  IconLoader2,
  IconGripVertical,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { bannersApi, uploadApi } from "@/lib/api"
import { toast } from "sonner"
import { LocalizedContentEditor } from "@/components/cms/LocalizedContentEditor"
import { CloudinaryImageUpload } from "@/components/cms/CloudinaryImageUpload"

export function BannersManager() {
  const [banners, setBanners] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState(null)
  const [editingBanner, setEditingBanner] = React.useState(null)
  const [formData, setFormData] = React.useState({
    // English fields
    title: "",
    subtitle: "",
    // Hindi fields
    title_hi: "",
    subtitle_hi: "",
    // Shared fields
    image_url: "",
    redirect_url: "",
    sort_order: 0,
    is_active: true,
  })
  const [activeLanguageTab, setActiveLanguageTab] = React.useState("english")

  React.useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    try {
      const response = await bannersApi.getAll()
      const banners = response.data?.banners || response.data || []
      
      if (!Array.isArray(banners)) {
        console.warn("Unexpected response format:", response)
        setBanners([])
        return
      }
      
      setBanners(banners)
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast.error(error.message || "Failed to load banners. Please check your connection.")
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddBanner() {
    if (!formData.title) {
      toast.error("Please enter a banner title")
      return
    }

    if (!formData.image_url) {
      toast.error("Please upload an image or provide an image URL")
      return
    }

    setSaving(true)
    try {
      const response = await bannersApi.create(formData)
      const newBanner = response.data?.banner || response.data || response
      setBanners(prev => [newBanner, ...prev])
      setIsAddOpen(false)
      resetForm()
      toast.success("Banner created successfully")
    } catch (error) {
      console.error("Error adding banner:", error)
      toast.error(error.message || "Failed to create banner")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateBanner() {
    if (!editingBanner) return

    if (!formData.title) {
      toast.error("Please enter a banner title")
      return
    }

    if (!formData.image_url) {
      toast.error("Please upload an image or provide an image URL")
      return
    }

    setSaving(true)
    try {
      const response = await bannersApi.update(editingBanner.id, formData)
      const updated = response.data?.banner || response.data || response
      setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...updated } : b))
      setIsEditOpen(false)
      setEditingBanner(null)
      resetForm()
      toast.success("Banner updated successfully")
    } catch (error) {
      console.error("Error updating banner:", error)
      toast.error(error.message || "Failed to update banner")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBanner() {
    if (!deleteId) return

    try {
      await bannersApi.delete(deleteId)
      setBanners(prev => prev.filter(b => b.id !== deleteId))
      toast.success("Banner deleted successfully")
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast.error("Failed to delete banner")
    } finally {
      setDeleteId(null)
    }
  }

  async function toggleBannerStatus(id) {
    try {
      const response = await bannersApi.toggleStatus(id)
      setBanners(prev => prev.map(b => 
        b.id === id ? { ...b, is_active: response.data.banner?.is_active ?? !b.is_active } : b
      ))
      toast.success("Banner status updated")
    } catch (error) {
      console.error("Error updating banner:", error)
      toast.error("Failed to update banner")
    }
  }

  function openEditSheet(banner) {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      title_hi: banner.title_hi || "",
      subtitle_hi: banner.subtitle_hi || "",
      image_url: banner.image_url || "",
      redirect_url: banner.redirect_url || "",
      sort_order: banner.sort_order || 0,
      is_active: banner.is_active ?? true,
    })
    setActiveLanguageTab("english")
    setIsEditOpen(true)
  }

  function resetForm() {
    setFormData({
      title: "",
      subtitle: "",
      title_hi: "",
      subtitle_hi: "",
      image_url: "",
      redirect_url: "",
      sort_order: 0,
      is_active: true,
    })
    setActiveLanguageTab("english")
  }

  async function handleImageUpload(file) {
    const response = await uploadApi.uploadBanner(file)
    return response
  }

  function renderFormFields() {
    return (
      <div className="mt-6 space-y-4 px-4">
        {/* Internationalized Content - English & Hindi */}
        <LocalizedContentEditor
          entityLabel="banner content"
          value={formData}
          onChange={setFormData}
          fields={[
            { key: "title", label: "Banner Title", placeholder: "e.g., PM Kisan Awareness Drive", placeholderHi: "उदा., पीएम किसान जागरूकता अभियान" },
            { key: "subtitle", label: "Subtitle", placeholder: "e.g., NOV 2025", placeholderHi: "उदा., नवंबर 2025" },
          ]}
        />

        {/* Cloudinary Image Upload - Drag & Drop */}
        <CloudinaryImageUpload
          value={formData.image_url}
          onChange={(url) => setFormData(prev => ({ ...prev, image_url: url || "" }))}
          uploadFn={handleImageUpload}
          maxSizeMB={10}
          aspectRatio="aspect-video"
          placeholder="Drag & drop or click to upload banner image"
          onUploadProgress={({ error }) => error && toast.error(error)}
        />

        <div className="space-y-2">
          <Label htmlFor="banner-redirect">Redirect URL</Label>
          <Input
            id="banner-redirect"
            placeholder="https://pmkisan.gov.in"
            value={formData.redirect_url}
            onChange={(e) => setFormData(prev => ({ ...prev, redirect_url: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner-order">Sort Order</Label>
          <Input
            id="banner-order"
            type="number"
            min="0"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          />
          <p className="text-xs text-muted-foreground">
            Lower numbers appear first
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="p-0">
              <Skeleton className="h-40 w-full rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
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
          <h2 className="text-lg font-semibold">Home Screen Banners</h2>
          <p className="text-sm text-muted-foreground">
            Manage promotional banners displayed on the home screen
          </p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button onClick={resetForm}>
              <IconPlus className="size-4 mr-2" />
              Add Banner
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Banner</SheetTitle>
              <SheetDescription>
                Create a new promotional banner for the home screen.
              </SheetDescription>
            </SheetHeader>
            {renderFormFields()}
            <SheetFooter className="mt-6">
              <Button 
                onClick={handleAddBanner} 
                className="w-full" 
                disabled={saving}
              >
                {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                {saving ? "Creating..." : "Create Banner"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open)
        if (!open) {
          setEditingBanner(null)
          resetForm()
        }
      }}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Banner</SheetTitle>
            <SheetDescription>
              Update the banner details.
            </SheetDescription>
          </SheetHeader>
          {renderFormFields()}
          <SheetFooter className="mt-6">
            <Button 
              onClick={handleUpdateBanner} 
              className="w-full" 
              disabled={saving}
            >
                {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {banners.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconPhoto className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No banners yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first promotional banner
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <IconPlus className="size-4 mr-2" />
              Add Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner, index) => (
            <Card key={banner.id} className={!banner.is_active ? "opacity-60" : ""}>
              <CardHeader className="p-0 relative">
                <img 
                  src={banner.image_url} 
                  alt={banner.title}
                  className="w-full h-40 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/1200x600/e2e8f0/64748b?text=Banner"
                  }}
                />
                <div className="absolute top-2 left-2">
                  <div className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <IconGripVertical className="size-3" />
                    #{banner.sort_order ?? index + 1}
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant="outline" 
                    className={banner.is_active 
                      ? "bg-green-500/90 text-white border-green-600" 
                      : "bg-gray-500/90 text-white border-gray-600"
                    }
                  >
                    {banner.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {banner.subtitle}
                  </p>
                )}
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
                    <DropdownMenuItem onClick={() => openEditSheet(banner)}>
                      <IconEdit className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleBannerStatus(banner.id)}>
                      {banner.is_active ? (
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
                      onClick={() => setDeleteId(banner.id)}
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
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this banner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBanner}
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

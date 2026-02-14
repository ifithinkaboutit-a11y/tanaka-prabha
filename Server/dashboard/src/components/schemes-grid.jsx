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
  IconUpload,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { schemesApi, uploadApi } from "@/lib/api"
import { toast } from "sonner"

export function SchemesGrid() {
  const [schemes, setSchemes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingScheme, setEditingScheme] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState(null)
  const [formData, setFormData] = React.useState({
    // English fields
    title: "",
    description: "",
    overview: "",
    process: "",
    eligibility: "",
    // Hindi fields
    title_hi: "",
    description_hi: "",
    overview_hi: "",
    process_hi: "",
    eligibility_hi: "",
    // Shared fields
    category: "",
    image_url: "",
    is_active: true,
  })
  const [activeLanguageTab, setActiveLanguageTab] = React.useState("english")
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [previewUrl, setPreviewUrl] = React.useState(null)
  const fileInputRef = React.useRef(null)

  React.useEffect(() => {
    fetchSchemes()
  }, [])

  async function fetchSchemes() {
    try {
      const response = await schemesApi.getAll()
      setSchemes(response.data?.schemes || response.data || [])
    } catch (error) {
      console.error("Error fetching schemes:", error)
      toast.error("Failed to load schemes")
    } finally {
      setLoading(false)
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.")
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 5MB.")
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFormData(prev => ({ ...prev, image_url: "" }))
    }
  }

  async function uploadImage() {
    if (!selectedFile) return null

    setUploading(true)
    try {
      const response = await uploadApi.uploadSchemeImage(selectedFile)
      return response.data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
      throw error
    } finally {
      setUploading(false)
    }
  }

  async function handleAddScheme() {
    if (!formData.title) {
      toast.error("Please enter a scheme title")
      return
    }

    setSaving(true)
    try {
      let imageUrl = formData.image_url

      // Upload image if a file was selected
      if (selectedFile) {
        imageUrl = await uploadImage()
      }

      const schemeData = {
        ...formData,
        image_url: imageUrl,
      }

      const response = await schemesApi.create(schemeData)
      setSchemes(prev => [response.data?.scheme || response.data, ...prev])
      setIsAddOpen(false)
      resetForm()
      toast.success("Scheme added successfully")
    } catch (error) {
      console.error("Error adding scheme:", error)
      toast.error("Failed to add scheme")
    } finally {
      setSaving(false)
    }
  }

  function openEditSheet(scheme) {
    setEditingScheme(scheme)
    setFormData({
      title: scheme.title || "",
      description: scheme.description || "",
      overview: scheme.overview || "",
      process: scheme.process || "",
      eligibility: scheme.eligibility || "",
      title_hi: scheme.title_hi || "",
      description_hi: scheme.description_hi || "",
      overview_hi: scheme.overview_hi || "",
      process_hi: scheme.process_hi || "",
      eligibility_hi: scheme.eligibility_hi || "",
      category: scheme.category || "",
      image_url: scheme.image_url || "",
      is_active: scheme.is_active ?? true,
    })
    if (scheme.image_url) {
      setPreviewUrl(scheme.image_url)
    }
    setActiveLanguageTab("english")
    setIsEditOpen(true)
  }

  async function handleUpdateScheme() {
    if (!editingScheme || !formData.title) {
      toast.error("Please enter a scheme title")
      return
    }

    setSaving(true)
    try {
      let imageUrl = formData.image_url

      // Upload image if a file was selected
      if (selectedFile) {
        imageUrl = await uploadImage()
      }

      const schemeData = {
        ...formData,
        image_url: imageUrl,
      }

      const response = await schemesApi.update(editingScheme.id, schemeData)
      setSchemes(prev => prev.map(s => 
        s.id === editingScheme.id ? { ...s, ...response.data?.scheme || response.data } : s
      ))
      setIsEditOpen(false)
      setEditingScheme(null)
      resetForm()
      toast.success("Scheme updated successfully")
    } catch (error) {
      console.error("Error updating scheme:", error)
      toast.error("Failed to update scheme")
    } finally {
      setSaving(false)
    }
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
      // English fields
      title: "",
      description: "",
      overview: "",
      process: "",
      eligibility: "",
      // Hindi fields
      title_hi: "",
      description_hi: "",
      overview_hi: "",
      process_hi: "",
      eligibility_hi: "",
      // Shared fields
      category: "",
      image_url: "",
      is_active: true,
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setActiveLanguageTab("english")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
          <h2 className="text-lg font-semibold">Government Schemes</h2>
          <p className="text-sm text-muted-foreground">
            Manage schemes available for beneficiaries
          </p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button onClick={resetForm}>
              <IconPlus className="size-4 mr-2" />
              Add Scheme
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full px-4 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Scheme</SheetTitle>
              <SheetDescription>
                Create a new government scheme for beneficiaries. Add content in both English and Hindi.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {/* Category Selection (shared) */}
              <div className="space-y-2">
                <Label htmlFor="scheme-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="scheme-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="financial">Financial Aid</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="subsidy">Subsidy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Language Tabs */}
              <Tabs value={activeLanguageTab} onValueChange={setActiveLanguageTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english" className="gap-2 px-4">
                    🇬🇧 English
                  </TabsTrigger>
                  <TabsTrigger value="hindi" className="gap-2 px-4">
                    🇮🇳 हिंदी
                  </TabsTrigger>
                </TabsList>
                
                {/* English Content Tab */}
                <TabsContent value="english" className="space-y-4 mt-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Enter the scheme details in English below
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-title-en">Scheme Title (English)</Label>
                    <Input
                      id="scheme-title-en"
                      placeholder="e.g., PM Kisan Samman Nidhi"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-description-en">Description (English)</Label>
                    <Textarea
                      id="scheme-description-en"
                      placeholder="Describe the scheme benefits..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-overview-en">Overview (English)</Label>
                    <Textarea
                      id="scheme-overview-en"
                      placeholder="Detailed overview of the scheme..."
                      value={formData.overview}
                      onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-process-en">Application Process (English)</Label>
                    <Textarea
                      id="scheme-process-en"
                      placeholder="Step-by-step application process..."
                      value={formData.process}
                      onChange={(e) => setFormData(prev => ({ ...prev, process: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-eligibility-en">Eligibility (English)</Label>
                    <Textarea
                      id="scheme-eligibility-en"
                      placeholder="Who can apply for this scheme..."
                      value={formData.eligibility}
                      onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </TabsContent>
                
                {/* Hindi Content Tab */}
                <TabsContent value="hindi" className="space-y-4 mt-4">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                      योजना का विवरण हिंदी में दर्ज करें
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-title-hi">योजना का शीर्षक (Hindi Title)</Label>
                    <Input
                      id="scheme-title-hi"
                      placeholder="उदा., पीएम किसान सम्मान निधि"
                      value={formData.title_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_hi: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-description-hi">विवरण (Hindi Description)</Label>
                    <Textarea
                      id="scheme-description-hi"
                      placeholder="योजना के लाभों का वर्णन करें..."
                      value={formData.description_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_hi: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-overview-hi">अवलोकन (Hindi Overview)</Label>
                    <Textarea
                      id="scheme-overview-hi"
                      placeholder="योजना का विस्तृत अवलोकन..."
                      value={formData.overview_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, overview_hi: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-process-hi">आवेदन प्रक्रिया (Hindi Process)</Label>
                    <Textarea
                      id="scheme-process-hi"
                      placeholder="चरण-दर-चरण आवेदन प्रक्रिया..."
                      value={formData.process_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, process_hi: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheme-eligibility-hi">पात्रता (Hindi Eligibility)</Label>
                    <Textarea
                      id="scheme-eligibility-hi"
                      placeholder="इस योजना के लिए कौन आवेदन कर सकता है..."
                      value={formData.eligibility_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, eligibility_hi: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Scheme Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/800x400/e2e8f0/64748b?text=Image+Error"
                        }}
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <IconUpload className="size-4 mr-2" />
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl(null)
                            setFormData(prev => ({ ...prev, image_url: "" }))
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                        >
                          <IconTrash className="size-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="py-6 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <IconUpload className="size-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, WebP, GIF (max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Alternative: URL input */}
                {!selectedFile && (
                  <div className="space-y-2 pt-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or enter URL
                        </span>
                      </div>
                    </div>
                    <Input
                      placeholder="https://example.com/scheme-image.jpg"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, image_url: e.target.value }))
                        setPreviewUrl(e.target.value || null)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button onClick={handleAddScheme} className="w-full" disabled={saving || uploading}>
                {(saving || uploading) && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                {uploading ? "Uploading..." : saving ? "Creating..." : "Add Scheme"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Scheme Sheet */}
        <Sheet open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingScheme(null); resetForm(); } }}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Scheme</SheetTitle>
              <SheetDescription>
                Update scheme details. Make sure to update content in both languages.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {/* Category Selection (shared) */}
              <div className="space-y-2">
                <Label htmlFor="edit-scheme-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="edit-scheme-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="financial">Financial Aid</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="subsidy">Subsidy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Language Tabs */}
              <Tabs value={activeLanguageTab} onValueChange={setActiveLanguageTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english" className="gap-2 px-4">
                    🇬🇧 English
                  </TabsTrigger>
                  <TabsTrigger value="hindi" className="gap-2 px-4">
                    🇮🇳 हिंदी
                  </TabsTrigger>
                </TabsList>
                
                {/* English Content Tab */}
                <TabsContent value="english" className="space-y-4 mt-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Enter the scheme details in English below
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-title-en">Scheme Title (English)</Label>
                    <Input
                      id="edit-scheme-title-en"
                      placeholder="e.g., PM Kisan Samman Nidhi"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-description-en">Description (English)</Label>
                    <Textarea
                      id="edit-scheme-description-en"
                      placeholder="Describe the scheme benefits..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-overview-en">Overview (English)</Label>
                    <Textarea
                      id="edit-scheme-overview-en"
                      placeholder="Detailed overview of the scheme..."
                      value={formData.overview}
                      onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-process-en">Application Process (English)</Label>
                    <Textarea
                      id="edit-scheme-process-en"
                      placeholder="Step-by-step application process..."
                      value={formData.process}
                      onChange={(e) => setFormData(prev => ({ ...prev, process: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-eligibility-en">Eligibility (English)</Label>
                    <Textarea
                      id="edit-scheme-eligibility-en"
                      placeholder="Who can apply for this scheme..."
                      value={formData.eligibility}
                      onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </TabsContent>
                
                {/* Hindi Content Tab */}
                <TabsContent value="hindi" className="space-y-4 mt-4">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                      योजना का विवरण हिंदी में दर्ज करें
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-title-hi">योजना का शीर्षक (Hindi Title)</Label>
                    <Input
                      id="edit-scheme-title-hi"
                      placeholder="उदा., पीएम किसान सम्मान निधि"
                      value={formData.title_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_hi: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-description-hi">विवरण (Hindi Description)</Label>
                    <Textarea
                      id="edit-scheme-description-hi"
                      placeholder="योजना के लाभों का वर्णन करें..."
                      value={formData.description_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_hi: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-overview-hi">अवलोकन (Hindi Overview)</Label>
                    <Textarea
                      id="edit-scheme-overview-hi"
                      placeholder="योजना का विस्तृत अवलोकन..."
                      value={formData.overview_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, overview_hi: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-process-hi">आवेदन प्रक्रिया (Hindi Process)</Label>
                    <Textarea
                      id="edit-scheme-process-hi"
                      placeholder="चरण-दर-चरण आवेदन प्रक्रिया..."
                      value={formData.process_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, process_hi: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-scheme-eligibility-hi">पात्रता (Hindi Eligibility)</Label>
                    <Textarea
                      id="edit-scheme-eligibility-hi"
                      placeholder="इस योजना के लिए कौन आवेदन कर सकता है..."
                      value={formData.eligibility_hi}
                      onChange={(e) => setFormData(prev => ({ ...prev, eligibility_hi: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Scheme Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/800x400/e2e8f0/64748b?text=Image+Error"
                        }}
                      />
                      <div className="flex gap-2 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <IconUpload className="size-4 mr-2" />
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl(null)
                            setFormData(prev => ({ ...prev, image_url: "" }))
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                        >
                          <IconTrash className="size-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="py-6 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <IconUpload className="size-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, WebP, GIF (max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Alternative: URL input */}
                {!selectedFile && (
                  <div className="space-y-2 pt-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or enter URL
                        </span>
                      </div>
                    </div>
                    <Input
                      placeholder="https://example.com/scheme-image.jpg"
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, image_url: e.target.value }))
                        setPreviewUrl(e.target.value || null)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button onClick={handleUpdateScheme} className="w-full" disabled={saving || uploading}>
                {(saving || uploading) && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                {uploading ? "Uploading..." : saving ? "Saving..." : "Update Scheme"}
              </Button>
            </SheetFooter>
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

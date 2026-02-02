"use client"

import * as React from "react"
import {
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
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
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function SchemesGrid() {
  const [schemes, setSchemes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    category: "",
    image_url: "",
    is_active: true,
  })

  React.useEffect(() => {
    fetchSchemes()
  }, [])

  async function fetchSchemes() {
    try {
      const { data, error } = await supabase
        .from("schemes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSchemes(data || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching schemes:", error)
      setLoading(false)
    }
  }

  async function handleAddScheme() {
    if (!formData.title) {
      toast.error("Please enter a scheme title")
      return
    }

    try {
      const { data, error } = await supabase
        .from("schemes")
        .insert([formData])
        .select()

      if (error) throw error

      setSchemes(prev => [data[0], ...prev])
      setIsAddOpen(false)
      setFormData({
        title: "",
        description: "",
        category: "",
        image_url: "",
        is_active: true,
      })
      toast.success("Scheme added successfully")
    } catch (error) {
      console.error("Error adding scheme:", error)
      toast.error("Failed to add scheme")
    }
  }

  async function handleDeleteScheme(id) {
    try {
      const { error } = await supabase
        .from("schemes")
        .delete()
        .eq("id", id)

      if (error) throw error

      setSchemes(prev => prev.filter(s => s.id !== id))
      toast.success("Scheme deleted successfully")
    } catch (error) {
      console.error("Error deleting scheme:", error)
      toast.error("Failed to delete scheme")
    }
  }

  async function toggleSchemeStatus(id, currentStatus) {
    try {
      const { error } = await supabase
        .from("schemes")
        .update({ is_active: !currentStatus })
        .eq("id", id)

      if (error) throw error

      setSchemes(prev => prev.map(s => 
        s.id === id ? { ...s, is_active: !currentStatus } : s
      ))
      toast.success(`Scheme ${!currentStatus ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Error updating scheme:", error)
      toast.error("Failed to update scheme")
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
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Government Schemes</h2>
          <p className="text-sm text-muted-foreground">
            Manage schemes available for beneficiaries
          </p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button>
              <IconPlus className="size-4 mr-2" />
              Add Scheme
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Add New Scheme</SheetTitle>
              <SheetDescription>
                Create a new government scheme for beneficiaries.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheme-title">Scheme Title</Label>
                <Input
                  id="scheme-title"
                  placeholder="e.g., PM Kisan Samman Nidhi"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
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
                    <SelectItem value="subsidy">Subsidy</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheme-description">Description</Label>
                <Input
                  id="scheme-description"
                  placeholder="Brief description of the scheme"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheme-image">Image URL</Label>
                <Input
                  id="scheme-image"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddScheme}>
                Save Scheme
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Schemes Grid */}
      {schemes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <IconPhoto className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Schemes Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first government scheme.
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <IconPlus className="size-4 mr-2" />
            Add Scheme
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <Card key={scheme.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {scheme.image_url ? (
                  <img
                    src={scheme.image_url}
                    alt={scheme.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <IconPhoto className="size-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="size-8">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <IconEye className="size-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <IconEdit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => toggleSchemeStatus(scheme.id, scheme.is_active)}
                      >
                        {scheme.is_active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteScheme(scheme.id)}
                      >
                        <IconTrash className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-1">
                    {scheme.title}
                  </CardTitle>
                </div>
                {scheme.category && (
                  <Badge variant="outline" className="w-fit text-xs capitalize">
                    {scheme.category}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2">
                  {scheme.description || "No description available"}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-0">
                <Badge 
                  variant="outline"
                  className={scheme.is_active 
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400"
                  }
                >
                  {scheme.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

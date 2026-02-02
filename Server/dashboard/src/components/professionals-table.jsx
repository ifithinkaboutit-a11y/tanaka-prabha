"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconPlus,
  IconSearch,
  IconPhone,
  IconMail,
  IconStethoscope,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

const columns = [
  {
    accessorKey: "name",
    header: "Professional",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.original.avatar} />
          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {getInitials(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{row.original.name || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">{row.original.qualification || ""}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.specialization || "General"}
      </Badge>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type || "doctor"
      const colors = {
        doctor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
        veterinary: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
        agricultural: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
      }
      return (
        <Badge variant="outline" className={`capitalize ${colors[type] || ""}`}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.phone && (
          <a 
            href={`tel:${row.original.phone}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <IconPhone className="size-3.5" />
            {row.original.phone}
          </a>
        )}
        {row.original.email && (
          <a 
            href={`mailto:${row.original.email}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <IconMail className="size-3" />
            {row.original.email}
          </a>
        )}
      </div>
    ),
  },
  {
    accessorKey: "district",
    header: "Location",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.district || "—"}
      </div>
    ),
  },
  {
    accessorKey: "is_available",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.original.is_available !== false
      return (
        <Badge 
          variant="outline"
          className={isAvailable 
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
            : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400"
          }
        >
          {isAvailable ? "Available" : "Unavailable"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem>View Profile</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Schedule</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function ProfessionalsTable() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [formData, setFormData] = React.useState({
    name: "",
    type: "",
    specialization: "",
    qualification: "",
    phone: "",
    email: "",
    district: "",
  })

  React.useEffect(() => {
    async function fetchProfessionals() {
      try {
        const { data: professionals, error } = await supabase
          .from("professionals")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setData(professionals || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching professionals:", error)
        setLoading(false)
      }
    }

    fetchProfessionals()
  }, [])

  async function handleAddProfessional() {
    if (!formData.name) {
      toast.error("Please enter a name")
      return
    }

    try {
      const { data: newProfessional, error } = await supabase
        .from("professionals")
        .insert([{ ...formData, is_available: true }])
        .select()

      if (error) throw error

      setData(prev => [newProfessional[0], ...prev])
      setIsAddOpen(false)
      setFormData({
        name: "",
        type: "",
        specialization: "",
        qualification: "",
        phone: "",
        email: "",
        district: "",
      })
      toast.success("Professional added successfully")
    } catch (error) {
      console.error("Error adding professional:", error)
      toast.error("Failed to add professional")
    }
  }

  // Apply type filter
  const filteredData = React.useMemo(() => {
    if (typeFilter === "all") return data
    return data.filter(item => item.type === typeFilter)
  }, [data, typeFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="rounded-lg border">
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search professionals..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="doctor">Doctors</SelectItem>
            <SelectItem value="veterinary">Veterinary</SelectItem>
            <SelectItem value="agricultural">Agricultural</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button>
                <IconPlus className="size-4 mr-2" />
                Add Professional
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Add New Professional</SheetTitle>
                <SheetDescription>
                  Register a new doctor or expert in the system.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-name">Full Name</Label>
                  <Input
                    id="prof-name"
                    placeholder="Dr. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="prof-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="veterinary">Veterinary</SelectItem>
                      <SelectItem value="agricultural">Agricultural Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-specialization">Specialization</Label>
                  <Input
                    id="prof-specialization"
                    placeholder="e.g., Cardiologist, Dairy Farming"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-qualification">Qualification</Label>
                  <Input
                    id="prof-qualification"
                    placeholder="e.g., MBBS, BVSc"
                    value={formData.qualification}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-phone">Phone Number</Label>
                  <Input
                    id="prof-phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-email">Email</Label>
                  <Input
                    id="prof-email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prof-district">District</Label>
                  <Input
                    id="prof-district"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProfessional}>
                  Save Professional
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <IconStethoscope className="size-8 text-muted-foreground" />
                    <p>No professionals found.</p>
                    <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
                      Add Professional
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} professionals
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

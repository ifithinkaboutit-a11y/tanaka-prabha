"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
  IconLoader2,
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
import { ProfessionalDialog } from "@/components/forms/ProfessionalDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { professionalsApi } from "@/lib/api"
import { toast } from "sonner"

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function ProfessionalsTable() {
  const router = useRouter()
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editProfessional, setEditProfessional] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState(null)
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [formData, setFormData] = React.useState({
    name: "",
    type: "",
    specialization: "",
    qualification: "",
    phone: "",
    email: "",
    district: "",
  })

  async function handleToggleAvailability(id, currentStatus) {
    try {
      await professionalsApi.toggleAvailability(id)
      setData(prev => prev.map(p =>
        p.id === id ? { ...p, is_available: !currentStatus } : p
      ))
      toast.success(`Professional marked as ${!currentStatus ? "available" : "unavailable"}`)
    } catch (error) {
      console.error("Error updating professional:", error)
      toast.error("Failed to update availability")
    }
  }

  const columns = React.useMemo(() => [
    {
      accessorKey: "name",
      header: "Professional",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.avatar} />
            <AvatarFallback className="bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
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
          doctor: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400",
          veterinary: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400",
          agricultural: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400",
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
              ? "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400"
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
            <DropdownMenuItem onClick={() => router.push(`/professionals/${row.original.id}`)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditProfessional(row.original); setIsEditOpen(true) }}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleAvailability(row.original.id, row.original.is_available)}
            >
              {row.original.is_available ? "Set Unavailable" : "Set Available"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  React.useEffect(() => {
    fetchProfessionals()
  }, [])

  async function fetchProfessionals() {
    try {
      const response = await professionalsApi.getAll()
      // Handle response structure: response.data can be { professionals: [] } or array directly
      const professionals = response.data?.professionals || response.data || []

      if (!Array.isArray(professionals)) {
        console.warn("Unexpected response format:", response)
        setData([])
        return
      }

      setData(professionals)
    } catch (error) {
      console.error("Error fetching professionals:", error)
      toast.error(error.message || "Failed to load professionals. Please check your connection.")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddProfessional() {
    if (!formData.name) {
      toast.error("Please enter a name")
      return
    }

    setSaving(true)
    try {
      const response = await professionalsApi.create({ ...formData, is_available: true })
      // Handle response structure: response.data can be { professional: {} } or professional directly
      const newProfessional = response.data?.professional || response.data
      setData(prev => [newProfessional, ...prev])
      setIsAddOpen(false)
      resetForm()
      toast.success("Professional added successfully")
    } catch (error) {
      console.error("Error adding professional:", error)
      toast.error(error.message || "Failed to add professional")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteProfessional() {
    if (!deleteId) return

    try {
      await professionalsApi.delete(deleteId)
      setData(prev => prev.filter(p => p.id !== deleteId))
      toast.success("Professional removed successfully")
    } catch (error) {
      console.error("Error deleting professional:", error)
      toast.error("Failed to remove professional")
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      type: "",
      specialization: "",
      qualification: "",
      phone: "",
      email: "",
      district: "",
    })
  }

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
          <ProfessionalDialog onSuccess={fetchProfessionals} mode="add" />
        </div>
      </div>

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
                  No professionals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Professional</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this professional? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfessional}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

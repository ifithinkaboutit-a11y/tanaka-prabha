"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconFilter,
  IconPlus,
  IconSearch,
  IconPhone,
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
import { BeneficiaryDialog } from "@/components/forms/BeneficiaryDialog"
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
import { usersApi } from "@/lib/api"
import { toast } from "sonner"

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function BeneficiariesTable() {
  const router = useRouter()
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [districtFilter, setDistrictFilter] = React.useState("all")
  const [cropFilter, setCropFilter] = React.useState("all")
  const [districts, setDistricts] = React.useState([])
  const [crops, setCrops] = React.useState([])
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editUser, setEditUser] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState(null)
  const [formData, setFormData] = React.useState({
    name: "",
    mobile_number: "",
    village: "",
    block: "",
    district: "",
  })

  async function handleToggleVerification(id, currentStatus) {
    try {
      await usersApi.update(id, { is_verified: !currentStatus })
      setData(prev => prev.map(u =>
        u.id === id ? { ...u, is_verified: !currentStatus } : u
      ))
      toast.success(`Farmer ${!currentStatus ? "verified" : "unverified"}`)
    } catch (error) {
      console.error("Error updating farmer:", error)
      toast.error("Failed to update farmer status")
    }
  }

  const columns = React.useMemo(() => [
    {
      accessorKey: "name",
      header: "Farmer Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.photo_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.name || "Unknown"}</div>
            <div className="text-xs text-muted-foreground">{row.original.village || ""}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "district",
      header: "District/Village",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.district || "—"}</div>
          <div className="text-xs text-muted-foreground">{row.original.block || ""}</div>
        </div>
      ),
    },
    {
      accessorKey: "mobile_number",
      header: "Mobile Number",
      cell: ({ row }) => (
        <a
          href={`tel:${row.original.mobile_number}`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <IconPhone className="size-3.5" />
          {row.original.mobile_number || "—"}
        </a>
      ),
    },
    {
      accessorKey: "total_land_area",
      header: () => <div className="text-right">Land Area</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.total_land_area
            ? `${row.original.total_land_area} Acres`
            : "—"
          }
        </div>
      ),
    },
    {
      accessorKey: "main_crop",
      header: "Main Crop",
      cell: ({ row }) => {
        const crop = row.original.main_crop
        if (!crop) return "—"
        return (
          <Badge variant="outline" className="text-xs">
            {crop}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isVerified = row.original.is_verified
        return (
          <Badge
            className={isVerified
              ? "bg-zinc-500/10 text-zinc-600 border border-zinc-500/20 dark:text-zinc-400 font-medium"
              : "bg-zinc-500/10 text-zinc-600 border border-zinc-500/20 dark:text-zinc-400 font-medium"
            }
          >
            <span className={`mr-1.5 inline-block size-1.5 rounded-full ${isVerified ? 'bg-zinc-500' : 'bg-zinc-500'}`} />
            {isVerified ? 'Verified' : 'Pending'}
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
            <DropdownMenuItem onClick={() => router.push(`/beneficiaries/${row.original.id}`)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setEditUser(row.original); setIsEditOpen(true) }}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleVerification(row.original.id, row.original.is_verified)}
            >
              {row.original.is_verified ? "Unverify" : "Verify"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  React.useEffect(() => {
    fetchFarmers()
  }, [])

  async function fetchFarmers() {
    try {
      const response = await usersApi.getAll()
      // Handle response structure: response.data can be { users: [] } or array directly
      const users = response.data?.users || response.data || []

      if (!Array.isArray(users)) {
        console.warn("Unexpected response format:", response)
        setData([])
        return
      }

      const uniqueDistricts = [...new Set(users.map(u => u.district).filter(Boolean))]
      const uniqueCrops = [...new Set(users.map(u => u.main_crop).filter(Boolean))]

      setData(users)
      setDistricts(uniqueDistricts)
      setCrops(uniqueCrops)
    } catch (error) {
      console.error("Error fetching farmers:", error)
      toast.error(error.message || "Failed to load farmers. Please check your connection.")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFarmer() {
    if (!formData.name || !formData.mobile_number) {
      toast.error("Please enter name and mobile number")
      return
    }

    setSaving(true)
    try {
      const response = await usersApi.create(formData)
      // Handle response structure: response.data can be { user: {} } or user directly
      const newUser = response.data?.user || response.data
      setData(prev => [newUser, ...prev])
      setIsAddOpen(false)
      resetForm()
      toast.success("Farmer added successfully")
    } catch (error) {
      console.error("Error adding farmer:", error)
      toast.error(error.message || "Failed to add farmer")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteFarmer() {
    if (!deleteId) return

    try {
      await usersApi.delete(deleteId)
      setData(prev => prev.filter(u => u.id !== deleteId))
      toast.success("Farmer deleted successfully")
    } catch (error) {
      console.error("Error deleting farmer:", error)
      toast.error("Failed to delete farmer")
    } finally {
      setDeleteId(null)
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      mobile_number: "",
      village: "",
      block: "",
      district: "",
    })
  }

  const filteredData = React.useMemo(() => {
    let result = data

    if (districtFilter !== "all") {
      result = result.filter(item => item.district === districtFilter)
    }

    if (cropFilter !== "all") {
      result = result.filter(item => item.main_crop === cropFilter)
    }

    return result
  }, [data, districtFilter, cropFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 flex-1 max-w-xs rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
          <Skeleton className="h-10 w-32 ml-auto rounded-xl" />
        </div>
        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
          <div className="p-1">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-16 w-full mb-1 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search farmers..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-muted/50 border-transparent focus:border-border h-9"
          />
        </div>

        <Select value={districtFilter} onValueChange={setDistrictFilter}>
          <SelectTrigger className="w-[160px] h-9 bg-muted/50 border-transparent">
            <IconFilter className="size-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map(district => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cropFilter} onValueChange={setCropFilter}>
          <SelectTrigger className="w-[152px] h-9 bg-muted/50 border-transparent">
            <IconFilter className="size-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="All Crops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            {crops.map(crop => (
              <SelectItem key={crop} value={crop}>{crop}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <BeneficiaryDialog onSuccess={fetchFarmers} />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">
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
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-primary/5"
                  onClick={() => router.push(`/beneficiaries/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3" onClick={e => e.stopPropagation()}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <IconSearch className="size-8 opacity-30" />
                    <span className="text-sm">No farmers found</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–{Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </span>{" "}
          of <span className="font-medium text-foreground">{table.getFilteredRowModel().rows.length}</span> farmers
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <IconChevronsLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <IconChevronLeft className="size-4" />
          </Button>
          <div className="px-3 py-1 rounded-lg bg-muted text-xs font-medium">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </div>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <IconChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
            <IconChevronsRight className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Farmer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this farmer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFarmer}
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

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconDownload,
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
  // Server-side pagination state
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize] = React.useState(50)
  const [totalCount, setTotalCount] = React.useState(0)
  const [exportingCsv, setExportingCsv] = React.useState(false)
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
      header: "District/Block",
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
      id: "total_land_area",
      header: () => <div className="text-right">Land Area</div>,
      cell: ({ row }) => {
        const land = row.original.land_details
        return (
          <div className="text-right">
            {land?.total_land_area
              ? <span className="font-semibold">{land.total_land_area} <span className="text-xs text-muted-foreground font-normal">Bigha</span></span>
              : <span className="text-muted-foreground">—</span>
            }
          </div>
        )
      },
    },
    {
      id: "crops",
      header: "Crops Grown",
      cell: ({ row }) => {
        const land = row.original.land_details
        if (!land) return <span className="text-muted-foreground">—</span>

        const crops = [
          land.rabi_crop && { label: land.rabi_crop, season: "Rabi", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
          land.kharif_crop && { label: land.kharif_crop, season: "Kharif", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
          land.zaid_crop && { label: land.zaid_crop, season: "Zaid", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300" },
        ].filter(Boolean)

        if (crops.length === 0) return <span className="text-muted-foreground">—</span>

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {crops.map((crop, i) => (
              <span key={i} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${crop.color}`}>
                {crop.label}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      id: "livestock",
      header: () => <div className="text-right">Livestock</div>,
      cell: ({ row }) => {
        const ls = row.original.livestock_details
        if (!ls) return <div className="text-right text-muted-foreground">—</div>

        const total = (ls.cow || 0) + (ls.buffalo || 0) + (ls.goat || 0) +
          (ls.sheep || 0) + (ls.pig || 0) + (ls.poultry || 0) + (ls.others || 0)

        if (total === 0) return <div className="text-right text-muted-foreground">—</div>

        return (
          <div className="text-right">
            <span className="font-semibold">{total}</span>
            <span className="text-xs text-muted-foreground ml-1">animals</span>
          </div>
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
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400 font-medium"
              : "bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:text-amber-400 font-medium"
            }
          >
            <span className={`mr-1.5 inline-block size-1.5 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
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
    fetchFarmers(pageIndex)
  }, [pageIndex])

  async function fetchFarmers(page = 0) {
    setLoading(true)
    try {
      const offset = page * pageSize
      const response = await usersApi.getAll({ limit: pageSize, offset })
      const users = response.data?.users || response.data || []

      if (!Array.isArray(users)) {
        console.warn("Unexpected response format:", response)
        setData([])
        return
      }

      // Pagination total from server
      const total = response.data?.pagination?.total || users.length
      setTotalCount(total)

      const uniqueDistricts = [...new Set(users.map(u => u.district).filter(Boolean))]
      const allCrops = new Set()
      users.forEach(u => {
        if (u.land_details?.rabi_crop) allCrops.add(u.land_details.rabi_crop)
        if (u.land_details?.kharif_crop) allCrops.add(u.land_details.kharif_crop)
        if (u.land_details?.zaid_crop) allCrops.add(u.land_details.zaid_crop)
      })

      setData(users)
      setDistricts(uniqueDistricts)
      setCrops([...allCrops])
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
      result = result.filter(item => {
        const ld = item.land_details
        return ld && (ld.rabi_crop === cropFilter || ld.kharif_crop === cropFilter || ld.zaid_crop === cropFilter)
      })
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
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Server-side pagination — table doesn't paginate itself
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
  })

  const totalPages = Math.ceil(totalCount / pageSize)
  const canPrevPage = pageIndex > 0
  const canNextPage = pageIndex < totalPages - 1

  function buildCsvRow(farmer) {
    const ls = farmer.livestock_details
    const livestockCount = ls
      ? (ls.cow || 0) + (ls.buffalo || 0) + (ls.goat || 0) +
        (ls.sheep || 0) + (ls.pig || 0) + (ls.poultry || 0) + (ls.others || 0)
      : 0
    const fields = [
      farmer.name ?? "",
      farmer.mobile_number ?? "",
      farmer.district ?? "",
      farmer.state ?? "",
      farmer.village ?? "",
      farmer.land_details?.total_land_area ?? "",
      livestockCount,
      farmer.created_at ?? "",
      farmer.is_verified ? "true" : "false",
    ]
    return fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")
  }

  async function handleExportCsv() {
    setExportingCsv(true)
    try {
      if (totalCount <= 1000) {
        // Client-side export from filteredData
        const header = "name,mobile_number,district,state,village,land_area,livestock_count,created_at,is_verified"
        const rows = filteredData.map(buildCsvRow)
        const csvString = [header, ...rows].join("\n")
        const blob = new Blob([csvString], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `beneficiaries-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Server-side export
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/users?format=csv`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` } }
        )
        if (!response.ok) throw new Error("Export failed")
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `beneficiaries-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("CSV export error:", error)
      toast.error("Failed to export CSV. Please try again.")
    } finally {
      setExportingCsv(false)
    }
  }

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

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={handleExportCsv}
            disabled={exportingCsv || filteredData.length === 0}
          >
            {exportingCsv ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconDownload className="size-4" />
            )}
            {exportingCsv ? "Exporting..." : "Export CSV"}
          </Button>
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
            {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, totalCount)}
          </span>{" "}
          of <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span> farmers
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setPageIndex(0)} disabled={!canPrevPage}>
            <IconChevronsLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setPageIndex(p => p - 1)} disabled={!canPrevPage}>
            <IconChevronLeft className="size-4" />
          </Button>
          <div className="px-3 py-1 rounded-lg bg-muted text-xs font-medium">
            {pageIndex + 1} / {totalPages || 1}
          </div>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setPageIndex(p => p + 1)} disabled={!canNextPage}>
            <IconChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setPageIndex(totalPages - 1)} disabled={!canNextPage}>
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

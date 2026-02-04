"use client"

import * as React from "react"
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
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [districtFilter, setDistrictFilter] = React.useState("all")
  const [cropFilter, setCropFilter] = React.useState("all")
  const [districts, setDistricts] = React.useState([])
  const [crops, setCrops] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState(null)
  const [formData, setFormData] = React.useState({
    name: "",
    mobile: "",
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
            <AvatarImage src={row.original.avatar} />
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
      accessorKey: "mobile",
      header: "Mobile Number",
      cell: ({ row }) => (
        <a 
          href={`tel:${row.original.mobile}`}
          className="flex items-center gap-1 text-primary hover:underline"
        >
          <IconPhone className="size-3.5" />
          {row.original.mobile || "—"}
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
        const status = row.original.is_verified ? "Verified" : "Pending"
        return (
          <Badge 
            variant="outline" 
            className={status === "Verified" 
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400" 
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400"
            }
          >
            {status}
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
      const users = response.data || []

      const uniqueDistricts = [...new Set(users.map(u => u.district).filter(Boolean))]
      const uniqueCrops = [...new Set(users.map(u => u.main_crop).filter(Boolean))]

      setData(users)
      setDistricts(uniqueDistricts)
      setCrops(uniqueCrops)
    } catch (error) {
      console.error("Error fetching farmers:", error)
      toast.error("Failed to load farmers")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddFarmer() {
    if (!formData.name || !formData.mobile) {
      toast.error("Please enter name and mobile number")
      return
    }

    setSaving(true)
    try {
      const response = await usersApi.create(formData)
      setData(prev => [response.data, ...prev])
      setIsAddOpen(false)
      resetForm()
      toast.success("Farmer added successfully")
    } catch (error) {
      console.error("Error adding farmer:", error)
      toast.error("Failed to add farmer")
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
      mobile: "",
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
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
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
            placeholder="Search farmers..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={districtFilter} onValueChange={setDistrictFilter}>
          <SelectTrigger className="w-[180px]">
            <IconFilter className="size-4 mr-2" />
            <SelectValue placeholder="Filter by District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map(district => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cropFilter} onValueChange={setCropFilter}>
          <SelectTrigger className="w-[180px]">
            <IconFilter className="size-4 mr-2" />
            <SelectValue placeholder="Filter by Crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            {crops.map(crop => (
              <SelectItem key={crop} value={crop}>{crop}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
            <SheetTrigger asChild>
              <Button onClick={resetForm}>
                <IconPlus className="size-4 mr-2" />
                Add Farmer
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Farmer</SheetTitle>
                <SheetDescription>
                  Register a new beneficiary in the system.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter farmer name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input 
                    id="mobile" 
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input 
                    id="village" 
                    placeholder="Enter village name"
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block">Block</Label>
                  <Input 
                    id="block" 
                    placeholder="Enter block name"
                    value={formData.block}
                    onChange={(e) => setFormData(prev => ({ ...prev, block: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select 
                    value={formData.district} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kamrup">Kamrup</SelectItem>
                      <SelectItem value="Jorhat">Jorhat</SelectItem>
                      <SelectItem value="Dibrugarh">Dibrugarh</SelectItem>
                      <SelectItem value="Sivasagar">Sivasagar</SelectItem>
                      <SelectItem value="Tezpur">Tezpur</SelectItem>
                      <SelectItem value="Nagaon">Nagaon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button onClick={handleAddFarmer} className="w-full" disabled={saving}>
                  {saving && <IconLoader2 className="mr-2 size-4 animate-spin" />}
                  Save Farmer
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
                  No farmers found.
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
          of {table.getFilteredRowModel().rows.length} farmers
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

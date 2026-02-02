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
  IconUser,
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

function getInitials(name) {
  if (!name) return "?"
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

const columns = [
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
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

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

  React.useEffect(() => {
    async function fetchFarmers() {
      try {
        // Fetch users with their land details
        const { data: users, error } = await supabase
          .from("users")
          .select(`
            id,
            name,
            mobile,
            village,
            block,
            district,
            is_verified,
            created_at
          `)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Fetch land details separately
        const { data: landDetails } = await supabase
          .from("land_details")
          .select("user_id, total_land_area, main_crop")

        // Merge land details with users
        const mergedData = users?.map(user => {
          const land = landDetails?.find(l => l.user_id === user.id)
          return {
            ...user,
            total_land_area: land?.total_land_area || null,
            main_crop: land?.main_crop || null,
          }
        }) || []

        // Extract unique districts and crops for filters
        const uniqueDistricts = [...new Set(mergedData.map(u => u.district).filter(Boolean))]
        const uniqueCrops = [...new Set(mergedData.map(u => u.main_crop).filter(Boolean))]

        setData(mergedData)
        setDistricts(uniqueDistricts)
        setCrops(uniqueCrops)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching farmers:", error)
        setLoading(false)
      }
    }

    fetchFarmers()
  }, [])

  // Apply custom filters
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
      {/* Filters Row */}
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
          <Sheet>
            <SheetTrigger asChild>
              <Button>
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
                  <Input id="name" placeholder="Enter farmer name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" placeholder="Enter mobile number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input id="village" placeholder="Enter village name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" placeholder="Enter district" />
                </div>
                <Button className="w-full mt-6">Save Farmer</Button>
              </div>
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
                  No farmers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
    </div>
  )
}

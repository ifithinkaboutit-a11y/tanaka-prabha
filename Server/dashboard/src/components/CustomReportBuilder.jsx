"use client"

import * as React from "react"
import {
  IconDownload,
  IconFilter,
  IconLoader2,
  IconSearch,
  IconX,
} from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { usersApi } from "@/lib/api"
import { INDIA_STATES_UTS, DISTRICTS_BY_STATE, ASSAM_DISTRICTS } from "@/lib/constants"
import { toast } from "sonner"

const REPORT_COLUMNS = [
  { key: "name", label: "Name", defaultSelected: true },
  { key: "mobile_number", label: "Mobile Number", defaultSelected: true },
  { key: "district", label: "District", defaultSelected: true },
  { key: "state", label: "State", defaultSelected: true },
  { key: "village", label: "Village", defaultSelected: true },
  { key: "block", label: "Block", defaultSelected: false },
  { key: "total_land_area", label: "Land Area (Bigha)", defaultSelected: true },
  { key: "rabi_crop", label: "Rabi Crop", defaultSelected: false },
  { key: "kharif_crop", label: "Kharif Crop", defaultSelected: false },
  { key: "zaid_crop", label: "Zaid Crop", defaultSelected: false },
  { key: "livestock_count", label: "Livestock Count", defaultSelected: false },
  { key: "is_verified", label: "Verified", defaultSelected: false },
  { key: "created_at", label: "Registration Date", defaultSelected: false },
]

const LAND_AREA_RANGES = [
  { label: "All", value: "all" },
  { label: "< 1 Bigha", value: "0-1" },
  { label: "1–3 Bigha", value: "1-3" },
  { label: "3–5 Bigha", value: "3-5" },
  { label: "5–10 Bigha", value: "5-10" },
  { label: "> 10 Bigha", value: "10-999" },
]

export function CustomReportBuilder() {
  const [farmers, setFarmers] = React.useState([])
  const [filteredFarmers, setFilteredFarmers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [exporting, setExporting] = React.useState(false)

  // Filter state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [stateFilter, setStateFilter] = React.useState("all")
  const [districtFilter, setDistrictFilter] = React.useState("all")
  const [landAreaRange, setLandAreaRange] = React.useState("all")
  const [verificationFilter, setVerificationFilter] = React.useState("all")
  const [cropFilter, setCropFilter] = React.useState("all")

  // Column selection
  const [selectedColumns, setSelectedColumns] = React.useState(
    REPORT_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.key)
  )

  // Available districts based on state
  const availableDistricts = React.useMemo(() => {
    if (stateFilter !== "all" && DISTRICTS_BY_STATE[stateFilter]) {
      return DISTRICTS_BY_STATE[stateFilter]
    }
    return ASSAM_DISTRICTS
  }, [stateFilter])

  // Available crops from data
  const availableCrops = React.useMemo(() => {
    const crops = new Set()
    farmers.forEach((f) => {
      if (f.land_details?.rabi_crop) crops.add(f.land_details.rabi_crop)
      if (f.land_details?.kharif_crop) crops.add(f.land_details.kharif_crop)
      if (f.land_details?.zaid_crop) crops.add(f.land_details.zaid_crop)
    })
    return [...crops].sort()
  }, [farmers])

  // Fetch all farmers
  React.useEffect(() => {
    async function fetchFarmers() {
      try {
        const res = await usersApi.getAll({ limit: 500, offset: 0 })
        const users = res.data?.users || res.data || []
        setFarmers(Array.isArray(users) ? users : [])
      } catch (err) {
        console.error("Error fetching farmers:", err)
        toast.error("Failed to load farmer data")
        setFarmers([])
      } finally {
        setLoading(false)
      }
    }
    fetchFarmers()
  }, [])

  // Apply filters
  React.useEffect(() => {
    let result = [...farmers]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (f) =>
          (f.name || "").toLowerCase().includes(q) ||
          (f.mobile_number || "").includes(q) ||
          (f.village || "").toLowerCase().includes(q)
      )
    }

    // State filter
    if (stateFilter !== "all") {
      result = result.filter((f) => f.state === stateFilter)
    }

    // District filter
    if (districtFilter !== "all") {
      result = result.filter((f) => f.district === districtFilter)
    }

    // Land area range
    if (landAreaRange !== "all") {
      const [min, max] = landAreaRange.split("-").map(Number)
      result = result.filter((f) => {
        const area = parseFloat(f.land_details?.total_land_area || 0)
        return area >= min && area <= max
      })
    }

    // Verification
    if (verificationFilter === "verified") {
      result = result.filter((f) => f.is_verified)
    } else if (verificationFilter === "pending") {
      result = result.filter((f) => !f.is_verified)
    }

    // Crop filter
    if (cropFilter !== "all") {
      result = result.filter((f) => {
        const ld = f.land_details
        return (
          ld?.rabi_crop === cropFilter ||
          ld?.kharif_crop === cropFilter ||
          ld?.zaid_crop === cropFilter
        )
      })
    }

    setFilteredFarmers(result)
  }, [farmers, searchQuery, stateFilter, districtFilter, landAreaRange, verificationFilter, cropFilter])

  function toggleColumn(key) {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  function getCellValue(farmer, columnKey) {
    switch (columnKey) {
      case "name": return farmer.name || "—"
      case "mobile_number": return farmer.mobile_number || "—"
      case "district": return farmer.district || "—"
      case "state": return farmer.state || "—"
      case "village": return farmer.village || "—"
      case "block": return farmer.block || "—"
      case "total_land_area": return farmer.land_details?.total_land_area || "—"
      case "rabi_crop": return farmer.land_details?.rabi_crop || "—"
      case "kharif_crop": return farmer.land_details?.kharif_crop || "—"
      case "zaid_crop": return farmer.land_details?.zaid_crop || "—"
      case "livestock_count": {
        const ls = farmer.livestock_details
        if (!ls) return "0"
        return (ls.cow || 0) + (ls.buffalo || 0) + (ls.goat || 0) +
          (ls.sheep || 0) + (ls.pig || 0) + (ls.poultry || 0) + (ls.others || 0)
      }
      case "is_verified": return farmer.is_verified ? "✓ Verified" : "Pending"
      case "created_at": return farmer.created_at
        ? new Date(farmer.created_at).toLocaleDateString("en-IN")
        : "—"
      default: return "—"
    }
  }

  async function handleExportCsv() {
    setExporting(true)
    try {
      const visibleColumns = REPORT_COLUMNS.filter((c) =>
        selectedColumns.includes(c.key)
      )

      const header = visibleColumns.map((c) => c.label).join(",")
      const rows = filteredFarmers.map((farmer) =>
        visibleColumns
          .map((c) => `"${String(getCellValue(farmer, c.key)).replace(/"/g, '""')}"`)
          .join(",")
      )

      const csvString = [header, ...rows].join("\n")
      const blob = new Blob([csvString], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `farmer-report-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${filteredFarmers.length} farmer profiles`)
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Failed to export report")
    } finally {
      setExporting(false)
    }
  }

  function clearFilters() {
    setSearchQuery("")
    setStateFilter("all")
    setDistrictFilter("all")
    setLandAreaRange("all")
    setVerificationFilter("all")
    setCropFilter("all")
  }

  const activeFilterCount = [
    searchQuery.trim() && 1,
    stateFilter !== "all" && 1,
    districtFilter !== "all" && 1,
    landAreaRange !== "all" && 1,
    verificationFilter !== "all" && 1,
    cropFilter !== "all" && 1,
  ].filter(Boolean).length

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <IconFilter className="size-4" />
                Report Filters
              </CardTitle>
              <CardDescription>
                Filter farmer profiles by specific parameters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <IconX className="size-3.5" /> Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Name, phone, or village..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <Label className="text-xs">State</Label>
              <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setDistrictFilter("all") }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All States</SelectItem>
                  {INDIA_STATES_UTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <Label className="text-xs">District</Label>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All Districts</SelectItem>
                  {availableDistricts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Land Area Range */}
            <div className="space-y-1.5">
              <Label className="text-xs">Land Area</Label>
              <Select value={landAreaRange} onValueChange={setLandAreaRange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  {LAND_AREA_RANGES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Verification Status */}
            <div className="space-y-1.5">
              <Label className="text-xs">Verification</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Crop Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs">Crop Grown</Label>
              <Select value={cropFilter} onValueChange={setCropFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Crops" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">All Crops</SelectItem>
                  {availableCrops.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Selection */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Report Columns</CardTitle>
              <CardDescription>Select which fields to include in the report</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedColumns(REPORT_COLUMNS.map((c) => c.key))}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedColumns([])}
              >
                Deselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REPORT_COLUMNS.map((col) => (
              <label
                key={col.key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                  selectedColumns.includes(col.key)
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Checkbox
                  checked={selectedColumns.includes(col.key)}
                  onCheckedChange={() => toggleColumn(col.key)}
                  className="size-3.5"
                />
                {col.label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Preview + Export */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                Report Preview
              </CardTitle>
              <CardDescription>
                {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? "s" : ""} match your criteria
              </CardDescription>
            </div>
            <Button onClick={handleExportCsv} disabled={exporting || filteredFarmers.length === 0} className="gap-2">
              {exporting ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconDownload className="size-4" />
              )}
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFarmers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No farmers match your filters</p>
              <p className="text-sm mt-1">Try adjusting the filter criteria</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {REPORT_COLUMNS.filter((c) => selectedColumns.includes(c.key)).map((col) => (
                      <TableHead key={col.key} className="whitespace-nowrap text-xs">
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.slice(0, 50).map((farmer) => (
                    <TableRow key={farmer.id}>
                      {REPORT_COLUMNS.filter((c) => selectedColumns.includes(c.key)).map((col) => (
                        <TableCell key={col.key} className="text-xs whitespace-nowrap">
                          {getCellValue(farmer, col.key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredFarmers.length > 50 && (
                <div className="p-3 text-center text-sm text-muted-foreground border-t">
                  Showing 50 of {filteredFarmers.length} results. Export CSV for full data.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

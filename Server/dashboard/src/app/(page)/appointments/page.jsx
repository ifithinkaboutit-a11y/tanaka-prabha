"use client"

import * as React from "react"
import {
  IconCalendarCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react"
import { CalendarCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { appointmentsApi } from "@/lib/api"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
]

function statusBadge(status) {
  const map = {
    pending:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
    confirmed:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300",
    cancelled:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300",
    completed:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300",
  }
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "—"
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        map[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {label}
    </span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString(undefined, { dateStyle: "medium" })
}

function formatTime(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleTimeString(undefined, { timeStyle: "short" })
}

export default function AppointmentsPage() {
  const [data, setData] = React.useState([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [updatingId, setUpdatingId] = React.useState(null)

  // Filters
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")

  // Pagination
  const [pageSize, setPageSize] = React.useState(20)
  const [page, setPage] = React.useState(0)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  async function fetchAppointments(opts = {}) {
    setLoading(true)
    try {
      const params = {
        limit: opts.pageSize ?? pageSize,
        offset: (opts.page ?? page) * (opts.pageSize ?? pageSize),
      }
      const sf = opts.statusFilter ?? statusFilter
      if (sf && sf !== "all") params.status = sf
      const df = opts.dateFrom ?? dateFrom
      const dt = opts.dateTo ?? dateTo
      if (df) params.date_from = df
      if (dt) params.date_to = dt

      const res = await appointmentsApi.getAll(params)
      const appointments =
        res.data?.appointments ?? res.data ?? res.appointments ?? res ?? []
      const count =
        res.data?.total ?? res.total ?? (Array.isArray(appointments) ? appointments.length : 0)
      setData(Array.isArray(appointments) ? appointments : [])
      setTotal(count)
    } catch (err) {
      toast.error(err.message || "Failed to load appointments")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFrom, dateTo, page, pageSize])

  async function handleStatusUpdate(appointment, newStatus) {
    // Optimistic update
    setData((prev) =>
      prev.map((a) =>
        a.id === appointment.id ? { ...a, status: newStatus } : a
      )
    )
    setUpdatingId(appointment.id)
    try {
      await appointmentsApi.updateStatus(appointment.id, newStatus)
      toast.success(`Appointment ${newStatus}`)
    } catch (err) {
      // Revert on failure
      setData((prev) =>
        prev.map((a) =>
          a.id === appointment.id ? { ...a, status: appointment.status } : a
        )
      )
      toast.error(err.message || `Failed to update appointment`)
    } finally {
      setUpdatingId(null)
    }
  }

  function handleFilterChange(key, value) {
    setPage(0)
    if (key === "status") setStatusFilter(value)
    if (key === "dateFrom") setDateFrom(value)
    if (key === "dateTo") setDateTo(value)
  }

  function handlePageSizeChange(value) {
    setPageSize(Number(value))
    setPage(0)
  }

  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-6 px-4 md:py-8 lg:px-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <CalendarCheck className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage farmer–professional appointments
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card p-3">
          {/* Status filter */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => handleFilterChange("status", v)}
            >
              <SelectTrigger className="h-9 w-36 bg-muted/50 border-transparent focus:border-border">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="h-9 w-36 bg-muted/50 border-transparent focus:border-border"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="h-9 w-36 bg-muted/50 border-transparent focus:border-border"
            />
          </div>

          {/* Clear filters */}
          {(statusFilter !== "all" || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              className="self-end h-9"
              onClick={() => {
                setStatusFilter("all")
                setDateFrom("")
                setDateTo("")
                setPage(0)
              }}
            >
              Clear
            </Button>
          )}

          {/* Page size selector */}
          <div className="ml-auto flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Per page</Label>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-9 w-20 bg-muted/50 border-transparent focus:border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
            <div className="p-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full mb-1 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">
                    Farmer
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">
                    Professional
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">
                    Time
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length ? (
                  data.map((appt) => {
                    const isUpdating = updatingId === appt.id
                    const dateStr = appt.appointment_date ?? appt.date ?? appt.scheduled_at
                    return (
                      <TableRow
                        key={appt.id}
                        className="border-b border-border/40 transition-colors hover:bg-primary/5"
                      >
                        <TableCell className="py-3 font-medium">
                          {appt.farmer_name ?? appt.farmer?.name ?? "—"}
                        </TableCell>
                        <TableCell className="py-3 text-muted-foreground">
                          {appt.professional_name ?? appt.professional?.name ?? "—"}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {formatDate(dateStr)}
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {formatTime(dateStr)}
                        </TableCell>
                        <TableCell className="py-3">
                          {statusBadge(appt.status)}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5">
                            {appt.status !== "confirmed" &&
                              appt.status !== "cancelled" &&
                              appt.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(appt, "confirmed")}
                                >
                                  {isUpdating ? (
                                    <IconLoader2 className="size-3 animate-spin" />
                                  ) : (
                                    "Confirm"
                                  )}
                                </Button>
                              )}
                            {appt.status !== "cancelled" &&
                              appt.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(appt, "cancelled")}
                                >
                                  {isUpdating ? (
                                    <IconLoader2 className="size-3 animate-spin" />
                                  ) : (
                                    "Cancel"
                                  )}
                                </Button>
                              )}
                            {appt.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(appt, "completed")}
                              >
                                {isUpdating ? (
                                  <IconLoader2 className="size-3 animate-spin" />
                                ) : (
                                  "Complete"
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <IconCalendarCheck className="size-8 opacity-30" />
                        <span className="text-sm">No appointments found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total > 0
              ? `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total}`
              : "No results"}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <IconChevronLeft className="size-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <span className="px-2 tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              <IconChevronRight className="size-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

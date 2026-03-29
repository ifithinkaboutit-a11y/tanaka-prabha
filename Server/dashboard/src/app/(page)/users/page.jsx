"use client"

import * as React from "react"
import {
  IconDotsVertical,
  IconLoader2,
  IconPlus,
  IconSearch,
  IconUserCog,
} from "@tabler/icons-react"
import { UserCog } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { adminUsersApi } from "@/lib/api"
import { toast } from "sonner"

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "sub_admin", label: "Sub Admin" },
  { value: "volunteer", label: "Volunteer" },
]

function roleBadge(role) {
  const map = {
    super_admin: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300",
    admin: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300",
    sub_admin: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
    volunteer: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300",
  }
  const label = ROLES.find((r) => r.value === role)?.label ?? role
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[role] ?? "bg-muted text-muted-foreground"}`}
    >
      {label}
    </span>
  )
}

function statusBadge(isActive) {
  return (
    <Badge
      className={
        isActive
          ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400 font-medium"
          : "bg-red-500/10 text-red-700 border border-red-500/20 dark:text-red-400 font-medium"
      }
    >
      <span
        className={`mr-1.5 inline-block size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`}
      />
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

function formatLastLogin(ts) {
  if (!ts) return "—"
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const EMPTY_FORM = { name: "", email: "", password: "", role: "admin" }

export default function UsersPage() {
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  // Create dialog
  const [createOpen, setCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState(EMPTY_FORM)

  // Edit dialog
  const [editOpen, setEditOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState(null)
  const [editForm, setEditForm] = React.useState({ name: "", email: "", role: "admin" })

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await adminUsersApi.getAll()
      const users = res.data?.admins ?? res.data ?? res ?? []
      setData(Array.isArray(users) ? users : [])
    } catch (err) {
      toast.error(err.message || "Failed to load admin users")
      setData([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  async function handleCreate() {
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Name, email and password are required")
      return
    }
    setSaving(true)
    try {
      const res = await adminUsersApi.create(createForm)
      const newUser = res.data?.admin ?? res.data ?? res
      setData((prev) => [newUser, ...prev])
      setCreateOpen(false)
      setCreateForm(EMPTY_FORM)
      toast.success("Admin user created")
    } catch (err) {
      toast.error(err.message || "Failed to create user")
    } finally {
      setSaving(false)
    }
  }

  function openEdit(user) {
    setEditTarget(user)
    setEditForm({ name: user.name ?? "", email: user.email ?? "", role: user.role ?? "admin" })
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!editForm.name || !editForm.email) {
      toast.error("Name and email are required")
      return
    }
    setSaving(true)
    try {
      const res = await adminUsersApi.update(editTarget.id, editForm)
      const updated = res.data?.admin ?? res.data ?? { ...editTarget, ...editForm }
      setData((prev) => prev.map((u) => (u.id === editTarget.id ? { ...u, ...updated } : u)))
      setEditOpen(false)
      toast.success("User updated")
    } catch (err) {
      toast.error(err.message || "Failed to update user")
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(user) {
    const next = !user.is_active
    try {
      await adminUsersApi.setStatus(user.id, next)
      setData((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: next } : u))
      )
      toast.success(`User ${next ? "activated" : "deactivated"}`)
    } catch (err) {
      toast.error(err.message || "Failed to update status")
    }
  }

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-6 px-4 md:py-8 lg:px-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <UserCog className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage admin accounts, roles, and access
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus:border-border h-9"
            />
          </div>
          <div className="ml-auto">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => { setCreateForm(EMPTY_FORM); setCreateOpen(true) }}
            >
              <IconPlus className="size-4" />
              Create User
            </Button>
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
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">Email</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">Role</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 h-10">Last Login</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? (
                  filtered.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-b border-border/40 transition-colors hover:bg-primary/5"
                    >
                      <TableCell className="py-3 font-medium">{user.name || "—"}</TableCell>
                      <TableCell className="py-3 text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="py-3">{roleBadge(user.role)}</TableCell>
                      <TableCell className="py-3">{statusBadge(user.is_active)}</TableCell>
                      <TableCell className="py-3 text-sm text-muted-foreground">
                        {formatLastLogin(user.last_login_at)}
                      </TableCell>
                      <TableCell className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <IconDotsVertical className="size-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {user.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <IconUserCog className="size-8 opacity-30" />
                        <span className="text-sm">No admin users found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Admin User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                placeholder="Full name"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="admin@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="••••••••"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <IconLoader2 className="size-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Full name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="admin@example.com"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving && <IconLoader2 className="size-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

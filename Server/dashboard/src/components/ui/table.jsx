"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Table Component - Vibecode Architect Rules Applied:
 * - Rule 10: Dashboard Hygiene - Grid lines for data clarity
 * - Rule 2: Spacing Multiplier - Consistent padding
 * - Rule 4: 4-Layer System - Proper surface/border contrast
 */

function Table({
  className,
  gridLines = false,
  ...props
}) {
  return (
    <div 
      data-slot="table-container" 
      className={cn(
        "relative w-full overflow-x-auto rounded-lg border",
        className
      )}
    >
      <table
        data-slot="table"
        data-grid-lines={gridLines || undefined}
        className={cn(
          "w-full caption-bottom text-sm",
          // Rule 10: Add grid lines when enabled
          gridLines && "[&_th]:border-r [&_th:last-child]:border-r-0 [&_td]:border-r [&_td:last-child]:border-r-0"
        )}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b bg-muted/30",
        className
      )}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props} />
  );
}

function TableRow({
  className,
  interactive = true,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors duration-150",
        // Rule 10: Subtle hover for interactive rows
        interactive && "hover:bg-muted/50 data-[state=selected]:bg-primary/5",
        className
      )}
      {...props} />
  );
}

function TableHead({
  className,
  sortable = false,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // Rule 2: Proper spacing (12px = 1.5 * 8px base)
        "text-muted-foreground h-11 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wider whitespace-nowrap",
        // Sortable styling
        sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props} />
  );
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // Rule 2: Consistent 12px padding (1.5 * 8px)
        "px-3 py-3 align-middle whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "text-muted-foreground mt-4 text-sm",
        className
      )}
      {...props} />
  );
}

// Rule 10: Empty state for tables
function TableEmpty({
  className,
  children,
  icon: Icon,
  ...props
}) {
  return (
    <tr data-slot="table-empty-row">
      <td 
        colSpan={100} 
        className={cn(
          "py-12 text-center text-muted-foreground",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center gap-2">
          {Icon && <Icon className="size-10 opacity-40" />}
          {children || "No data available"}
        </div>
      </td>
    </tr>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableEmpty,
}

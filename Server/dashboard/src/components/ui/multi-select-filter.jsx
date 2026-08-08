"use client"

import * as React from "react"
import { IconCheck, IconChevronDown, IconSearch, IconX } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/**
 * MultiSelectFilter — dropdown of checkboxes for filtering a table.
 *
 * An empty `value` array means "no filter" (i.e. everything), which keeps the
 * common case free of noise: the trigger reads "All Districts" rather than
 * forcing the user to tick every option.
 *
 * @param {{value:string,label:string}[]} options
 * @param {string[]} value      currently selected option values
 * @param {(next:string[])=>void} onChange
 * @param {string} label        e.g. "Districts" — used for the "All …" text
 * @param {boolean} searchable  show a filter box (for long lists)
 */
export function MultiSelectFilter({
    options = [],
    value = [],
    onChange,
    label = "Options",
    icon: Icon = null,
    searchable = false,
    className,
    align = "start",
}) {
    const [query, setQuery] = React.useState("")
    const selected = React.useMemo(() => new Set(value), [value])

    const visibleOptions = React.useMemo(() => {
        if (!searchable || !query.trim()) return options
        const q = query.trim().toLowerCase()
        return options.filter((o) => o.label.toLowerCase().includes(q))
    }, [options, query, searchable])

    function toggle(optionValue) {
        const next = new Set(selected)
        if (next.has(optionValue)) next.delete(optionValue)
        else next.add(optionValue)
        onChange([...next])
    }

    const triggerText =
        value.length === 0
            ? `All ${label}`
            : value.length === 1
                ? options.find((o) => o.value === value[0])?.label ?? value[0]
                : `${value.length} ${label}`

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-9 justify-between gap-1.5 border-transparent bg-muted/50 font-normal",
                        value.length > 0 && "border-primary/40 bg-primary/5",
                        className
                    )}
                >
                    <span className="flex items-center gap-1.5 truncate">
                        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
                        <span className="truncate">{triggerText}</span>
                    </span>
                    {value.length > 1 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                            {value.length}
                        </Badge>
                    )}
                    <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={align} className="w-[240px] p-0">
                {searchable && (
                    <div className="relative border-b p-2">
                        <IconSearch className="absolute left-4 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search ${label.toLowerCase()}…`}
                            className="h-8 pl-7 text-sm"
                            // Typing must not be swallowed by the menu's typeahead
                            onKeyDown={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                <div className="max-h-[260px] overflow-y-auto py-1">
                    {visibleOptions.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No matches
                        </p>
                    ) : (
                        visibleOptions.map((option) => {
                            const isChecked = selected.has(option.value)
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="menuitemcheckbox"
                                    aria-checked={isChecked}
                                    onClick={(e) => {
                                        // Keep the menu open so several values can be picked at once
                                        e.preventDefault()
                                        toggle(option.value)
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
                                >
                                    <span
                                        className={cn(
                                            "flex size-4 shrink-0 items-center justify-center rounded border",
                                            isChecked
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-input"
                                        )}
                                    >
                                        {isChecked && <IconCheck className="size-3" />}
                                    </span>
                                    <span className="truncate">{option.label}</span>
                                </button>
                            )
                        })
                    )}
                </div>

                {value.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="my-0" />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                onChange([])
                            }}
                            className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-muted-foreground outline-none hover:bg-accent hover:text-foreground"
                        >
                            <IconX className="size-3.5" />
                            Clear {value.length} selected
                        </button>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

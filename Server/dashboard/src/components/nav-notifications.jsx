"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BellIcon } from "lucide-react"
import Link from "next/link"

export function NotificationsPopover({ notifications }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full size-7"
                    aria-label="Open notifications"
                >
                    <BellIcon className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" className="w-80 my-6">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map(({ id, avatar, fallback, text, time }) => (
                    <DropdownMenuItem key={id} className="flex items-start gap-3">
                        <Avatar className="size-8">
                            <AvatarImage src={avatar} alt="Avatar" />
                            <AvatarFallback>{fallback}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{text}</span>
                            <span className="text-xs text-muted-foreground">{time}</span>
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center text-sm text-muted-foreground hover:text-primary">
                    <Link href="/notifications">View all notifications</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

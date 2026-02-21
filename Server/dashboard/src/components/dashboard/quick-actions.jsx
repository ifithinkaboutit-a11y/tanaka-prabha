"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { UserPlus, FilePlus, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"

const actions = [
    { label: "Add Beneficiary", href: "/beneficiaries", icon: UserPlus, color: "text-zinc-600" },
    { label: "New Content", href: "/content", icon: FilePlus, color: "text-zinc-600" },
    { label: "Add Professional", href: "/professionals", icon: Stethoscope, color: "text-zinc-600" },
]

export function QuickActions() {
    return (
        <div className="px-4 lg:px-6">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-3"
            >
                <span className="text-sm font-medium text-muted-foreground self-center mr-1">Quick Actions:</span>
                {actions.map((action, i) => (
                    <motion.div
                        key={action.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + i * 0.07, duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href={action.href}>
                                <action.icon className={`size-4 ${action.color}`} />
                                {action.label}
                            </Link>
                        </Button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}

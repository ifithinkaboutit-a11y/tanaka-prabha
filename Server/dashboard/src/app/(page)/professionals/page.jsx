"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProfessionalsTable } from "@/components/professionals-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Stethoscope, Star } from "lucide-react"

export default function ProfessionalsPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam === "experts" ? "experts" : "experts")

  // Sync tab with URL param changes
  useEffect(() => {
    if (tabParam === "experts" || tabParam === "all") {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Professionals</h1>
          <p className="text-muted-foreground">
            Manage doctors, veterinarians, and agricultural experts.
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="experts" className="gap-2">
              <Star className="size-3.5" />
              Experts
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Stethoscope className="size-3.5" />
              All Professionals
            </TabsTrigger>
          </TabsList>
          <TabsContent value="experts" className="mt-6">
            <ProfessionalsTable filterType="expert" />
          </TabsContent>
          <TabsContent value="all" className="mt-6">
            <ProfessionalsTable filterType="all" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

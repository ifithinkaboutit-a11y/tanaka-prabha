import { BeneficiariesTable } from "@/components/beneficiaries-table"
import { Users } from "lucide-react"

export default function BeneficiariesPage() {
  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-6 px-4 md:py-8 lg:px-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and view all registered farmers in the system
            </p>
          </div>
        </div>

        <BeneficiariesTable />
      </div>
    </div>
  )
}

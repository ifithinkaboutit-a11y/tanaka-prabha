import { ProfessionalsTable } from "@/components/professionals-table"

export default function ProfessionalsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Professionals</h1>
          <p className="text-muted-foreground">
            Manage doctors, veterinarians, and agricultural experts.
          </p>
        </div>
        <ProfessionalsTable />
      </div>
    </div>
  )
}

import { CustomReportBuilder } from "@/components/CustomReportBuilder"
import { FileText } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="flex flex-col gap-6 py-6 px-4 md:py-8 lg:px-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <FileText className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Custom Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generate and export farmer profile reports based on specific parameters
            </p>
          </div>
        </div>

        <CustomReportBuilder />
      </div>
    </div>
  )
}

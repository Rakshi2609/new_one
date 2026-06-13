import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Consultation } from "@/types/models";

export function ReportsWidget({ consultations }: { consultations: Consultation[] }) {
  // Sort by date descending and take top 5
  const reports = [...consultations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <Card className="col-span-1 md:col-span-2 border-alan-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-alan-text-primary">
          <FileText className="h-4 w-4 text-alan-indigo" />
          Recent Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-sm text-alan-text-muted italic py-2">
            No recent reports found.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const docTitle = report.clinical_note?.chief_complaint 
                || report.documents[0]?.document_type 
                || "Consultation Note";
              const dateObj = new Date(report.date);
              const dateStr = !isNaN(dateObj.getTime()) 
                ? dateObj.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) 
                : report.date;

              return (
                <div key={report.id} className="flex items-center justify-between p-2 rounded-md hover:bg-alan-surface transition-colors cursor-pointer border border-transparent hover:border-alan-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-alan-indigo/10 p-2 rounded-md">
                      <FileText className="h-4 w-4 text-alan-indigo" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-alan-text-primary capitalize">{docTitle}</p>
                      <p className="text-xs text-alan-text-muted">{dateStr}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-alan-text-muted" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

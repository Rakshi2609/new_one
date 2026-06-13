import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Pill } from "lucide-react";
import { getMedications, markDoseTaken, skipDose } from "@/api/client";
import type { MedicationsResponse } from "@/types/models";
import { Button } from "@/components/ui/button";

export default function MedicationTrackerPage() {
  const [data, setData] = useState<MedicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeds = async () => {
    try {
      const res = await getMedications();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const handleMarkTaken = async (scheduleId: string, doseId: string) => {
    await markDoseTaken(scheduleId, doseId);
    fetchMeds();
  };

  const handleSkip = async (scheduleId: string, doseId: string) => {
    await skipDose(scheduleId, doseId);
    fetchMeds();
  };

  if (loading) return <div className="p-8 text-center text-alan-text-muted">Loading medications...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-alan-border bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Link to="/card" className="p-2 hover:bg-alan-border/50 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-alan-text-primary" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-alan-teal">
            <Pill className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-alan-text-primary">Medications</span>
          <span className="ml-auto text-sm font-semibold text-alan-teal">
            {data.adherence_score}% Adherence
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 pb-32 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-alan-text-primary">Today's Schedule</h1>
          <p className="mt-1 text-sm text-alan-text-muted">
            Track your doses and maintain your streak.
          </p>
        </div>

        {data.schedules.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-alan-border rounded-xl">
            <p className="text-alan-text-muted">No medications scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.schedules.map((schedule) => (
              <div key={schedule.id} className="rounded-card border border-alan-border p-5 space-y-4 shadow-sm hover:shadow transition-shadow">
                <div>
                  <h3 className="font-semibold text-alan-text-primary text-lg">
                    {schedule.medication_name}
                  </h3>
                  <p className="text-sm text-alan-text-secondary mt-1">
                    {schedule.dosage && <span>{schedule.dosage}</span>}
                    {schedule.dosage && schedule.frequency && <span> • </span>}
                    {schedule.frequency && <span>{schedule.frequency}</span>}
                  </p>
                  {schedule.instructions && (
                    <p className="text-xs text-alan-text-muted mt-2 italic bg-alan-border/20 p-2 rounded">
                      {schedule.instructions}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-alan-text-muted">Doses</p>
                  {schedule.doses.map((dose) => (
                    <div key={dose.id} className="flex items-center justify-between p-3 rounded-lg bg-alan-border/10">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">
                          {new Date(dose.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dose.status === "TAKEN" ? "bg-green-100 text-green-700" : dose.status === "SKIPPED" ? "bg-red-100 text-red-700" : "bg-alan-border/50 text-alan-text-muted"}`}>
                          {dose.status}
                        </div>
                      </div>

                      {dose.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleSkip(schedule.id, dose.id)} className="h-8">
                            <X className="h-4 w-4 mr-1" /> Skip
                          </Button>
                          <Button size="sm" onClick={() => handleMarkTaken(schedule.id, dose.id)} className="h-8 bg-alan-teal hover:bg-alan-teal/90 text-white border-0">
                            <Check className="h-4 w-4 mr-1" /> Taken
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

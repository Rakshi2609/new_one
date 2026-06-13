import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Plus, Pill, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReminders, createReminder } from "@/api/client";

interface Reminder {
  id: string;
  medication: string;
  dosage?: string;
  frequency?: string;
  reminder_times: string[];
}

export default function ReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    time1: "08:00",
    time2: "",
    time3: "",
  });

  const fetchReminders = async () => {
    try {
      const data = await getReminders();
      setReminders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const times = [form.time1, form.time2, form.time3].filter(Boolean);
      await createReminder({
        medication: form.medication,
        dosage: form.dosage || undefined,
        frequency: form.frequency || undefined,
        reminder_times: times,
      });
      setForm({ medication: "", dosage: "", frequency: "", time1: "08:00", time2: "", time3: "" });
      setShowForm(false);
      await fetchReminders();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fe]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-alan-border bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-alan-border/50 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-alan-text-primary" />
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-amber-500">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-alan-text-primary">Reminders</span>
          <Button
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="ml-auto bg-alan-indigo hover:bg-alan-indigo/90 text-white gap-1.5 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        {/* Add Reminder Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-alan-border shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-alan-text-primary">New Medication Reminder</h2>
              <button onClick={() => setShowForm(false)} className="text-alan-text-muted hover:text-alan-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-alan-text-secondary">Medication *</label>
                <input
                  type="text"
                  required
                  value={form.medication}
                  onChange={(e) => setForm((f) => ({ ...f, medication: e.target.value }))}
                  placeholder="e.g. Amoxicillin"
                  className="w-full rounded-xl border border-alan-border bg-alan-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-alan-indigo/30 focus:border-alan-indigo transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-alan-text-secondary">Dosage</label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
                    placeholder="e.g. 500mg"
                    className="w-full rounded-xl border border-alan-border bg-alan-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-alan-indigo/30 focus:border-alan-indigo transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-alan-text-secondary">Frequency</label>
                  <input
                    type="text"
                    value={form.frequency}
                    onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                    placeholder="e.g. 3x daily"
                    className="w-full rounded-xl border border-alan-border bg-alan-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-alan-indigo/30 focus:border-alan-indigo transition"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-alan-text-secondary">Reminder Times</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { key: "time1" as const, label: "Morning" },
                    { key: "time2" as const, label: "Afternoon" },
                    { key: "time3" as const, label: "Evening" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-alan-text-muted font-medium">{label}</span>
                      <input
                        type="time"
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="rounded-lg border border-alan-border bg-alan-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-alan-indigo/30 focus:border-alan-indigo transition"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-alan-indigo hover:bg-alan-indigo/90 text-white rounded-xl mt-2"
              >
                {submitting ? "Saving..." : "Save Reminder"}
              </Button>
            </form>
          </div>
        )}

        {/* Reminders List */}
        {loading ? (
          <div className="text-center py-16 text-alan-text-muted text-sm">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Bell className="h-8 w-8 text-amber-400" />
            </div>
            <p className="text-base font-semibold text-alan-text-primary">No reminders yet</p>
            <p className="text-sm text-alan-text-muted max-w-xs mx-auto">
              Add medication reminders to stay on track with your recovery schedule.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-alan-indigo hover:bg-alan-indigo/90 text-white gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add First Reminder
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-alan-text-muted uppercase tracking-wider">
              Active Reminders ({reminders.length})
            </h2>
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white rounded-2xl border border-alan-border p-5 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Pill className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-alan-text-primary text-base">{rem.medication}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {rem.dosage && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {rem.dosage}
                        </span>
                      )}
                      {rem.frequency && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {rem.frequency}
                        </span>
                      )}
                    </div>
                    {rem.reminder_times.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <Clock className="h-3.5 w-3.5 text-alan-text-muted flex-shrink-0" />
                        {rem.reminder_times.map((time, i) => (
                          <span
                            key={i}
                            className="text-xs font-mono bg-alan-surface border border-alan-border px-2 py-0.5 rounded-lg text-alan-text-secondary"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-7 w-7 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

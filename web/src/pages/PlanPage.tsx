import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ArrowRight, Sparkles, MessageSquare } from "lucide-react";
import type {
  ActionPlan,
  Action,
  ClinicalNote,
  Decision,
  MedicalDocument,
  Priority,
  UploadResponse,
  ValidatedAction,
} from "@/types/models";
import { mockActionPlan, mockUploadResponse } from "@/fixtures/urology_case";
import { executePlan } from "@/api/client";
import { ActionRow } from "@/components/ActionRow";
import { AlertBanner } from "@/components/AlertBanner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Overrides = { title?: string; deadline?: string };

const PRIORITY_ORDER: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  URGENT: { label: "Urgent", color: "text-alan-error", dot: "bg-alan-error" },
  HIGH: { label: "Important", color: "text-alan-orange", dot: "bg-alan-orange" },
  MEDIUM: { label: "To schedule", color: "text-alan-teal", dot: "bg-alan-teal" },
  LOW: { label: "Optional", color: "text-alan-text-muted", dot: "bg-alan-border" },
};

export default function PlanPage() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [decisions, setDecisions] = useState<Record<string, { decision: Decision; overrides?: Overrides }>>({});
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("plan");
    setPlan(stored ? (JSON.parse(stored) as ActionPlan) : mockActionPlan);
  }, []);

  if (!plan) return null;

  const handleDecision = (id: string, decision: Decision, overrides?: Overrides) => {
    setDecisions((prev) => ({ ...prev, [id]: { decision, overrides } }));
  };

  const actionsByPriority = PRIORITY_ORDER.reduce<Record<Priority, Action[]>>(
    (acc, p) => {
      acc[p] = plan.actions.filter((a) => a.priority === p);
      return acc;
    },
    { URGENT: [], HIGH: [], MEDIUM: [], LOW: [] }
  );

  const acceptedCount = Object.values(decisions).filter((d) => d.decision !== "REJECT").length;

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const validated: ValidatedAction[] = plan.actions.map((a) => {
        const d = decisions[a.id];
        return {
          id: a.id,
          decision: d?.decision ?? "ACCEPT",
          overrides: d?.overrides,
        };
      });

      const storedUpload = sessionStorage.getItem("upload");
      const upload: UploadResponse = storedUpload
        ? (JSON.parse(storedUpload) as UploadResponse)
        : mockUploadResponse;

      const result = await executePlan(
        plan,
        validated,
        upload.documents as MedicalDocument[],
        upload.clinical_note as ClinicalNote | null
      );

      sessionStorage.setItem("decisions", JSON.stringify(validated));
      sessionStorage.setItem("execution", JSON.stringify(result));
      navigate("/card");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-alan-border bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-alan-indigo">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-alan-text-primary">Arwen</span>
          <span className="ml-auto text-sm text-alan-text-muted">
            {plan.actions.length} actions • Pierre Muller
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 pb-32 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-alan-text-primary">Your action plan</h1>
          <p className="mt-1 text-sm text-alan-text-muted">
            Validate, reject or modify each action before execution.
          </p>
        </div>

        {/* Alerts */}
        {plan.alerts.length > 0 && (
          <AlertBanner messages={plan.alerts} />
        )}

        {/* Actions by priority */}
        {PRIORITY_ORDER.map((priority) => {
          const actions = actionsByPriority[priority];
          if (actions.length === 0) return null;
          const conf = priorityConfig[priority];

          return (
            <div key={priority} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", conf.dot)} />
                <h2 className={cn("text-xs font-semibold uppercase tracking-wider", conf.color)}>
                  {conf.label}
                </h2>
                <span className="text-xs text-alan-text-muted">({actions.length})</span>
              </div>
              {actions.map((action) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  decision={decisions[action.id]?.decision ?? null}
                  onDecision={handleDecision}
                />
              ))}
            </div>
          );
        })}

        {/* Questions for appointments */}
        {plan.questions_for_next_appointments.length > 0 && (
          <div className="rounded-card border border-alan-teal/30 bg-alan-teal/5">
            <button
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
              onClick={() => setQuestionsOpen((o) => !o)}
            >
              <div className="rounded-full bg-alan-teal/15 p-1.5">
                <MessageSquare className="h-4 w-4 text-alan-teal" />
              </div>
              <span className="flex-1 text-sm font-semibold text-alan-text-primary">
                Questions for the next appointment
              </span>
              <span className="text-xs text-alan-teal mr-1">
                {plan.questions_for_next_appointments.reduce((s, q) => s + q.questions.length, 0)} questions
              </span>
              {questionsOpen ? (
                <ChevronUp className="h-4 w-4 text-alan-teal" />
              ) : (
                <ChevronDown className="h-4 w-4 text-alan-teal" />
              )}
            </button>

            {questionsOpen && (
              <>
                <Separator />
                <div className="px-5 py-4 space-y-5">
                  {plan.questions_for_next_appointments.map((bundle, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-alan-teal mb-2">{bundle.appointment}</p>
                      <ul className="space-y-2">
                        {bundle.questions.map((q, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-alan-text-secondary">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-alan-teal" />
                            {q}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-xs text-alan-text-muted italic">{bundle.reasoning}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-alan-border bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <p className="text-sm text-alan-text-muted">
            {acceptedCount > 0
              ? `${acceptedCount} action${acceptedCount > 1 ? "s" : ""} selected`
              : "Select actions to execute"}
          </p>
          <Button
            size="lg"
            onClick={handleExecute}
            disabled={executing || acceptedCount === 0}
            className="gap-2"
          >
            {executing ? "Executing…" : `Execute plan (${acceptedCount})`}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

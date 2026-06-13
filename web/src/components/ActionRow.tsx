import { useState } from "react";
import {
  FlaskConical,
  Camera,
  Calendar,
  Car,
  Bell,
  Pill,
  MessageSquare,
  Check,
  X,
  Edit3,
  Link,
  Users,
} from "lucide-react";
import type { Action, ActionType, Priority } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ActionRowProps {
  action: Action;
  decision: "ACCEPT" | "REJECT" | "MODIFY" | null;
  onDecision: (id: string, decision: "ACCEPT" | "REJECT" | "MODIFY", overrides?: { title?: string; deadline?: string }) => void;
}

const actionTypeConfig: Record<ActionType, { icon: React.ReactNode; label: string; color: string }> = {
  BOOK_LAB: { icon: <FlaskConical className="h-4 w-4" />, label: "Lab test", color: "bg-alan-indigo/10 text-alan-indigo" },
  BOOK_IMAGING: { icon: <Camera className="h-4 w-4" />, label: "Imaging", color: "bg-alan-teal/10 text-alan-teal" },
  BOOK_APPOINTMENT: { icon: <Calendar className="h-4 w-4" />, label: "Appointment", color: "bg-[#a78bfa]/20 text-[#7c3aed]" },
  BOOK_TRANSPORT: { icon: <Car className="h-4 w-4" />, label: "Transport", color: "bg-alan-orange/10 text-alan-orange" },
  ADD_REMINDER: { icon: <Bell className="h-4 w-4" />, label: "Reminder", color: "bg-alan-surface text-alan-text-muted" },
  TAKE_MEDICATION: { icon: <Pill className="h-4 w-4" />, label: "Medication", color: "bg-green-100 text-green-700" },
  QUESTION_FOR_DOCTOR: { icon: <MessageSquare className="h-4 w-4" />, label: "Question", color: "bg-alan-border text-alan-text-secondary" },
};

const priorityBadgeVariant: Record<Priority, "urgent" | "high" | "medium" | "low"> = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

function formatDeadline(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function ActionRow({ action, decision, onDecision }: ActionRowProps) {
  const [modifyOpen, setModifyOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(action.title);
  const [draftDeadline, setDraftDeadline] = useState(action.deadline ?? "");

  const typeConf = actionTypeConfig[action.type];
  const isAccepted = decision === "ACCEPT";
  const isRejected = decision === "REJECT";
  const isModified = decision === "MODIFY";

  const handleModifySave = () => {
    onDecision(action.id, "MODIFY", {
      title: draftTitle !== action.title ? draftTitle : undefined,
      deadline: draftDeadline !== action.deadline ? draftDeadline : undefined,
    });
    setModifyOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "rounded-card border border-alan-border bg-white px-5 py-4 shadow-card transition-colors",
          isRejected && "opacity-50",
          !isRejected && "hover:bg-alan-surface/50"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Type icon */}
          <div className={cn("mt-0.5 flex-shrink-0 rounded-full p-2", typeConf.color)}>
            {typeConf.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className={cn("text-sm font-semibold text-alan-text-primary", isModified && "line-through text-alan-text-muted")}>
                {action.title}
              </p>
              {isModified && (
                <p className="text-sm font-semibold text-alan-text-primary">{draftTitle}</p>
              )}
              {action.group_with && (
                <span className="flex items-center gap-1 text-xs text-alan-text-muted">
                  <Users className="h-3 w-3" />
                  Can be grouped
                </span>
              )}
            </div>
            <p className="text-xs text-alan-text-muted mb-2 leading-relaxed">{action.why}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={priorityBadgeVariant[action.priority]}>
                {action.priority}
              </Badge>
              {action.deadline && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  by {formatDeadline(isModified && draftDeadline ? draftDeadline : action.deadline)}
                </Badge>
              )}
              {action.suggested_url && (
                <a
                  href={action.suggested_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-alan-indigo hover:underline"
                >
                  <Link className="h-3 w-3" />
                  Book
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant={isAccepted ? "default" : "outline"}
              onClick={() => onDecision(action.id, "ACCEPT")}
              className={cn("gap-1", isAccepted && "ring-2 ring-alan-indigo/30")}
            >
              <Check className="h-3.5 w-3.5" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setModifyOpen(true)}
              className={cn(isModified && "ring-2 ring-alan-orange/30 bg-alan-orange/5")}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDecision(action.id, "REJECT")}
              className={cn("text-alan-error hover:bg-alan-error/10", isRejected && "ring-2 ring-alan-error/30 bg-alan-error/5")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modify dialog */}
      <Dialog open={modifyOpen} onOpenChange={setModifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-alan-text-secondary mb-1.5 block">Title</label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full rounded-btn border border-alan-border bg-alan-surface px-3 py-2 text-sm text-alan-text-primary focus:outline-none focus:ring-2 focus:ring-alan-indigo/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-alan-text-secondary mb-1.5 block">Deadline</label>
              <input
                type="date"
                value={draftDeadline}
                onChange={(e) => setDraftDeadline(e.target.value)}
                className="w-full rounded-btn border border-alan-border bg-alan-surface px-3 py-2 text-sm text-alan-text-primary focus:outline-none focus:ring-2 focus:ring-alan-indigo/40"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModifyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleModifySave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

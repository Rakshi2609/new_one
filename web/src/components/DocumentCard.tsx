import { FileText, Pill, File, X } from "lucide-react";
import type { DocumentType } from "@/types/models";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  name: string;
  documentType?: DocumentType;
  onRemove?: () => void;
  className?: string;
}

const docTypeConfig: Record<DocumentType, { label: string; icon: React.ReactNode; color: string }> = {
  prescription: {
    label: "Prescription",
    icon: <Pill className="h-4 w-4" />,
    color: "text-alan-teal bg-alan-teal/10",
  },
  operation_report: {
    label: "Operative report",
    icon: <FileText className="h-4 w-4" />,
    color: "text-alan-indigo bg-alan-indigo/10",
  },
  other: {
    label: "Document",
    icon: <File className="h-4 w-4" />,
    color: "text-alan-text-muted bg-alan-surface",
  },
};

export function DocumentCard({ name, documentType, onRemove, className }: DocumentCardProps) {
  const config = documentType ? docTypeConfig[documentType] : docTypeConfig.other;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-btn border border-alan-border bg-white px-4 py-3 shadow-card",
        className
      )}
    >
      <span className={cn("flex items-center justify-center rounded-full p-1.5", config.color)}>
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-alan-text-primary">{name}</p>
        <p className="text-xs text-alan-text-muted">{config.label}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 rounded-full p-1 text-alan-text-muted hover:bg-alan-surface hover:text-alan-text-primary transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  messages: string[];
  className?: string;
}

export function AlertBanner({ messages, className }: AlertBannerProps) {
  if (messages.length === 0) return null;

  return (
    <div className={cn("rounded-card border border-alan-orange/30 bg-alan-orange/8 p-4", className)}
      style={{ backgroundColor: "rgba(255, 147, 89, 0.08)" }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0 rounded-full bg-alan-orange/15 p-1.5">
          <AlertTriangle className="h-4 w-4 text-alan-orange" />
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-semibold text-alan-orange">Alerte médicamenteuse</p>
          {messages.map((msg, i) => (
            <p key={i} className="text-sm text-alan-text-secondary leading-relaxed">
              {msg}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

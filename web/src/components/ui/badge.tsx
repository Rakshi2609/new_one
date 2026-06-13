import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-alan-indigo/10 text-alan-indigo",
        urgent: "bg-alan-error/10 text-alan-error",
        high: "bg-alan-orange/10 text-alan-orange",
        medium: "bg-alan-teal/10 text-alan-teal",
        low: "bg-alan-text-muted/10 text-alan-text-muted",
        success: "bg-alan-success/10 text-[#4a8a3a]",
        outline: "border border-alan-border text-alan-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-brand-400" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-brand-900 mb-2">
        {title}
      </h3>
      <p className="text-brand-400 text-sm max-w-sm mb-6">{description}</p>
      {(actionLabel && (onAction || actionHref)) && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

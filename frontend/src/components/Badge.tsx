import { cn } from "@/lib/utils";

type BadgeVariant = "new" | "sale" | "discount" | "featured";

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  new: "bg-brand-900 text-white",
  sale: "bg-red-600 text-white",
  discount: "bg-accent-600 text-white",
  featured: "bg-brand-800 text-accent-200 border border-accent-600",
};

export default function Badge({ variant, label, className }: BadgeProps) {
  const defaultLabels: Record<BadgeVariant, string> = {
    new: "New",
    sale: "Sale",
    discount: label || "",
    featured: "Featured",
  };

  return (
    <span
      className={cn(
        "absolute top-2 left-2 z-10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {defaultLabels[variant]}
    </span>
  );
}

"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md";
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  size = "md",
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    }
  };

  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex items-center border border-brand-200 rounded",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          "flex items-center justify-center transition-colors hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed",
          isSmall ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={cn(
          "w-10 text-center text-sm font-medium border-x border-brand-200 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          isSmall ? "h-7" : "h-9"
        )}
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          "flex items-center justify-center transition-colors hover:bg-brand-50 disabled:opacity-30 disabled:cursor-not-allowed",
          isSmall ? "h-7 w-7" : "h-9 w-9"
        )}
        aria-label="Increase quantity"
      >
        <Plus className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
    </div>
  );
}

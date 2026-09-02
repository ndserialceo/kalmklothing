"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm animate-fade-in" />

      <div
        className={cn(
          "relative z-10 w-full max-w-lg bg-white rounded-lg shadow-2xl animate-slide-up",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
          {title && (
            <h2 className="font-heading text-lg font-semibold text-brand-900">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-brand-100 transition-colors ml-auto"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-brand-500" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {actions && (
          <div className="px-6 py-4 border-t border-brand-100 flex items-center justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assignmentTitle: string;
}

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  assignmentTitle,
}: DeleteConfirmDialogProps) {
  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-red-500">
            <AlertTriangle size={24} />
          </div>

          <div className="space-y-1">
            <h3 className="font-semibold font-[Outfit] text-foreground text-base">Delete Assignment?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-2">
              Are you sure you want to delete <strong className="text-foreground">"{assignmentTitle}"</strong>? This action cannot be undone.
            </p>
          </div>

          <div className="w-full flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

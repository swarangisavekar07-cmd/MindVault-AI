import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />,
    info: <Info className="text-blue-500 w-5 h-5 flex-shrink-0" />,
  };

  const bgStyles = {
    success: "border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/20",
    error: "border-red-500/30 bg-red-50/90 dark:bg-red-950/20",
    info: "border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/20",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm min-w-[280px] max-w-sm animate-scale-up ${
        bgStyles[toast.type]
      }`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs font-medium text-foreground leading-relaxed">
        {toast.message}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 hover:bg-muted/80 rounded text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

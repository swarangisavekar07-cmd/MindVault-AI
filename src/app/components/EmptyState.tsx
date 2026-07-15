import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = <FolderOpen size={36} className="text-muted-foreground/50" />,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-card/40 border border-dashed border-border rounded-2xl max-w-md mx-auto my-6 space-y-4 shadow-sm animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold font-[Outfit] text-foreground text-base">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed px-4">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 transition-all hover:scale-[1.02] shadow-sm shadow-indigo-600/10"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export const Modal = ({ open, onClose, title, children, footer }: Props) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-border/80 w-full max-w-lg flex flex-col max-h-[85vh] min-h-0 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <h2 className="text-lg font-semibold text-navy tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-navy hover:bg-navy/5 transition-all -mr-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 pb-5 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60 bg-navy/[0.02] rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

export const Toast = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-raised border text-sm font-medium ${
        toast.type === "success"
          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
          : "bg-red-50 text-red-800 border-red-100"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 text-emerald-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose} className="hover:opacity-75">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

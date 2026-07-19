import { AlertTriangle } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
};

export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  isLoading,
}: Props) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <>
        <Button type="button" variant="outlined" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800"
        >
          {isLoading ? "Deleting..." : confirmText}
        </Button>
      </>
    }
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5 text-red-500" />
      </div>
      <div>
        <p className="text-sm text-muted leading-relaxed">{message}</p>
      </div>
    </div>
  </Modal>
);

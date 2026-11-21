// ConfirmationModal.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  confirmText,
  cancelText,
  loading = false,
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl p-8">
        <DialogHeader className="items-center text-center">
          {/* Icon like the image: circle border + red icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-400">
            <Trash2 className="h-7 w-7 text-red-500" />
          </div>

          <DialogTitle className="text-xl font-bold text-slate-900">
            {title || t('deleteModals.confirmation', 'Are you sure you want to delete this item?')}
          </DialogTitle>

        </DialogHeader>

        <div className="mt-8 flex items-center justify-center gap-6">
          {/* Cancel button (outlined blue like typical UI) */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="h-10 w-30 rounded-xl border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {cancelText || t('deleteModals.cancel', 'Cancel')}
          </Button>

          {/* Confirm button (red filled) */}
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-10 w-30 rounded-xl bg-red-500 text-white hover:bg-red-600"
          >
            {loading ? t('deleteModals.deleting', 'Deleting...') : (confirmText || t('deleteModals.title', 'Delete'))}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

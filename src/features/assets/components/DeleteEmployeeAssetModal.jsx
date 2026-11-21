// src/features/assets/components/DeleteEmployeeAssetModal.jsx
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteEmployeeAssetModal({ open, onOpenChange, onConfirm, loading, assetName }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className={`mt-4 text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('assets.deleteAssetModal.title', { assetName })}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="mt-4 flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            {t('assets.deleteAssetModal.cancel')}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? t('assets.deleteAssetModal.deleting') : t('assets.deleteAssetModal.delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

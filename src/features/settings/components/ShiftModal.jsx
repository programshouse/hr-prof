// src/features/settings/components/ShiftModal.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ShiftModal({ open, shift, onCancel, onSave }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(() => ({
    name_en: shift?.name_en || '',
    name_ar: shift?.name_ar || '',
  }));

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      name_en: formData.name_en.trim(),
      name_ar: formData.name_ar.trim(),
    };

    if (!payload.name_en) {
      toast.error(t('settings.validation.shiftEnglishNameRequired'));
      return;
    }

    if (!payload.name_ar) {
      toast.error(t('settings.validation.shiftArabicNameRequired'));
      return;
    }

    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {shift ? t('settings.modals.shift.editTitle') : t('settings.modals.shift.addTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('settings.modals.shift.nameEn')} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name_en}
              onChange={(e) => handleChange('name_en', e.target.value)}
              placeholder={t('settings.modals.shift.nameEnPlaceholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('settings.modals.shift.nameAr')} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name_ar}
              onChange={(e) => handleChange('name_ar', e.target.value)}
              placeholder={t('settings.modals.shift.nameArPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="link" onClick={onCancel} className="cursor-pointer">
            {t('settings.actions.cancel')}
          </Button>

          <Button onClick={handleSubmit} className="cursor-pointer">
            {shift ? t('common.update') : t('common.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

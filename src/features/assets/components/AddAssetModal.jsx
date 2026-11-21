import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AddAssetModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [formData, setFormData] = useState({

  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert to FormData for consistency with existing patterns
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('value', formData.value);
    submitData.append('description', formData.description);
    
    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('assets.addAssetModal.title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className={isRTL ? 'text-right' : 'text-left'}>{t('assets.addAssetModal.assetName')}</Label>
            <Input
              id="name"
              placeholder={t('assets.addAssetModal.assetName')}
              className={isRTL ? 'text-right' : 'text-left'}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          {/* Asset Value */}
          <div className="space-y-2">
            <Label htmlFor="value" className={isRTL ? 'text-right' : 'text-left'}>{t('assets.addAssetModal.assetValue')}</Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              placeholder={t('assets.addAssetModal.assetValue')}
              className={isRTL ? 'text-right' : 'text-left'}
              value={formData.value}
              onChange={(e) => handleInputChange("value", e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={isRTL ? 'text-right' : 'text-left'}>{t('assets.addAssetModal.description')}</Label>
            <Input
              id="description"
              placeholder={t('assets.addAssetModal.description')}
              className={isRTL ? 'text-right' : 'text-left'}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('assets.addAssetModal.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : t('assets.addAssetModal.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

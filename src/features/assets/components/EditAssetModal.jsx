import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function EditAssetModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  asset,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    value: asset?.value?.toString() || '',
    description: asset?.description || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert to proper format for API
    const submitData = {
      name: formData.name,
      value: parseFloat(formData.value) || 0,
      description: formData.description,
    };
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('assets.editAssetModal.title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className={isRTL ? 'text-right' : 'text-left'}>{t('assets.editAssetModal.assetName')}</Label>
            <Input
              id="name"
              placeholder={t('assets.editAssetModal.assetName')}
              className={isRTL ? 'text-right' : 'text-left'}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Asset Value */}
          <div className="space-y-2">
            <Label htmlFor="value" className={isRTL ? 'text-right' : 'text-left'}>{t('assets.editAssetModal.assetValue')}</Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              placeholder={t('assets.editAssetModal.assetValue')}
              className={isRTL ? 'text-right' : 'text-left'}
              value={formData.value}
              onChange={(e) => handleInputChange("value", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={isRTL ? 'text-right' : 'text-left'}>{t('assets.editAssetModal.description')}</Label>
            <Input
              id="description"
              placeholder={t('assets.editAssetModal.description')}
              className={isRTL ? 'text-right' : 'text-left'}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              disabled={loading}
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
              {t('assets.editAssetModal.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('assets.editAssetModal.updating') : t('assets.editAssetModal.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

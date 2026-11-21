import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calculator, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CommissionPreviewModal({ open, onOpenChange, previewData, isLoading }) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('commission.previewTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!previewData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('commission.previewTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="text-center text-muted-foreground">
              {t('commission.noPreviewData')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { commission_percent, base_amount, computed_amount, employee_id, month, has_commission, source } = previewData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            {t('commission.previewTitle')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Main Preview Card */}
          <div className="border border-blue-200 bg-[#f5f7ff] rounded-xl p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-black">{t('commission.commissionRate')}</p>
                <p className="text-xl font-bold text-primary">{commission_percent}%</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-black">{t('commission.baseAmount')}</p>
                <p className="text-xl font-bold text-primary">{base_amount.toLocaleString()}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-black">{t('commission.commissionAmount')}</p>
                </div>
                <p className="text-xl font-bold text-primary">{computed_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">{t('commission.details')}</h4>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('commission.employeeId')}:</span>
                  <span className="font-medium text-slate-900">{employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('tables.month')}:</span>
                  <span className="font-medium text-slate-900">{month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('commission.status')}:</span>
                  <span className={`font-medium ${has_commission ? 'text-green-600' : 'text-orange-600'}`}>
                    {has_commission ? t('commission.hasCommission') : t('commission.noCommissionYet')}
                  </span>
                </div>
                {source && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t('tables.source')}:</span>
                    <span className="font-medium text-slate-900">{source}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('commission.close')}
            </Button>
            <Button 
              onClick={() => {
                // Navigate to commission form with this data
                const params = new URLSearchParams();
                params.set('base_amount', String(base_amount));
                params.set('preview', '1');
                window.location.href = `/commission-performance/${employee_id}?${params.toString()}`;
              }}
            >
              {t('commission.openCommissionForm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

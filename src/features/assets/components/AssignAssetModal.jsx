// src/features/assets/components/AssignAssetModal.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import EmployeeCombobox from "@/components/ui/EmployeeCombobox";
import { useAllEmployees } from "@/shared/hooks/useAllEmployees";
import { useAssetsQuery } from "../hooks/useAssetsQuery";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/services/auth/auth.store';

export default function AssignAssetModal({ open, onOpenChange, onSubmit, loading, defaultEmployeeId = "", employeeName = null }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { authSource, user } = useAuthStore();

  // In employee-login + defaultEmployeeId mode: show static name instead of combobox
  const isEmployeeLogin = authSource === 'employee-login';
  const showStaticEmployee = isEmployeeLogin && !!defaultEmployeeId;
  const resolvedEmployeeName = employeeName || user?.name || user?.full_name || null;
  const [formData, setFormData] = useState({
    employeeId: defaultEmployeeId,
    asset: "",
    numberOfAssets: "",
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    status: "In Use",
  });

  // Reset form when dialog opens, keeping defaultEmployeeId pre-filled
  useEffect(() => {
    if (open) {
      setFormData({
        employeeId: defaultEmployeeId,
        asset: "",
        numberOfAssets: "",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: "In Use",
      });
    }
  }, [open, defaultEmployeeId]);

  // Fetch real employee data
  const { data: employeesData = [], isLoading: employeesLoading } = useAllEmployees(open);

  // Fetch real assets data only when modal is open
  const { data: assetsResponse, isLoading: assetsLoading } = useAssetsQuery(
    {
      limit: 1000, // Get all assets for the select
    },
    { enabled: open }
  );

  // Extract assets data from response
  const assetsData = assetsResponse?.data || [];

  const employees = employeesData || [];

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert to FormData for consistency with existing patterns
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof Date) {
        submitData.append(key, format(value, 'yyyy-MM-dd'));
      } else {
        submitData.append(key, value);
      }
    });
    
    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className={isRTL ? 'text-right' : 'text-left'}>
          <DialogTitle className={isRTL ? 'text-right' : 'text-left'}>{t('assets.assignAssetModal.title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employeeId" className={isRTL ? 'text-right' : ''}>{t('assets.assignAssetModal.employee')}</Label>
            {showStaticEmployee ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                {resolvedEmployeeName || '—'}
              </div>
            ) : (
              <EmployeeCombobox
                value={formData.employeeId}
                onChange={(value) => handleInputChange("employeeId", value)}
                employees={employees}
                loading={employeesLoading}
                placeholder={t('assets.assignAssetModal.selectEmployee')}
                searchPlaceholder={t('assets.assignAssetModal.selectEmployee')}
              />
            )}
          </div>

          {/* Asset */}
          <div className="space-y-2">
            <Label htmlFor="asset" className={isRTL ? 'text-right' : ''}>{t('assets.assignAssetModal.asset')}</Label>
            <Select
              value={formData.asset}
              onValueChange={(value) => handleInputChange("asset", value)}
              required
              disabled={assetsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={assetsLoading ? t('assets.assignAssetModal.loadingAssets') : t('assets.assignAssetModal.selectAsset')} />
              </SelectTrigger>
              <SelectContent>
                {assetsData?.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id.toString()}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number Of Assets */}
          <div className="space-y-2">
            <Label htmlFor="numberOfAssets" className={isRTL ? 'text-right' : ''}>{t('assets.assignAssetModal.numberOfAssets')}</Label>
            <Input
              id="numberOfAssets"
              type="number"
              min="1"
              placeholder={t('assets.assignAssetModal.enterNumberOfAssets')}
              value={formData.numberOfAssets}
              onChange={(e) => handleInputChange("numberOfAssets", e.target.value)}
              required
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right' : ''}>{t('assets.assignAssetModal.startDate')}</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(formData.startDate, "PPP")
                  ) : (
                    <span>{t('assets.assignAssetModal.pickDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => {
                    handleInputChange("startDate", date);
                    setStartDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right' : ''}>{t('assets.assignAssetModal.endDate')}</Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? (
                    format(formData.endDate, "PPP")
                  ) : (
                    <span>{t('assets.assignAssetModal.pickDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => {
                    handleInputChange("endDate", date);
                    setEndDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className={isRTL ? 'text-right' : ''}>{t('assets.assignAssetModal.status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={t('assets.assignAssetModal.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Use">{t('assets.filters.inUse')}</SelectItem>
                <SelectItem value="Returned">{t('assets.filters.returned')}</SelectItem>
                <SelectItem value="Lost">{t('assets.filters.lost')}</SelectItem>
                <SelectItem value="Overdue">{t('assets.filters.overdue')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className={isRTL ? 'ml-auto' : ''}
            >
              {t('assets.assignAssetModal.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('assets.assignAssetModal.saving') : t('assets.assignAssetModal.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

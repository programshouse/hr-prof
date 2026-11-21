// src/features/assets/components/EditEmployeeAssetModal.jsx
import { useEffect, useMemo, useState } from "react";
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
import { useTranslation } from "react-i18next";

export default function EditEmployeeAssetModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  employeeAsset,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [formData, setFormData] = useState({
    employeeId: "",
    asset: "",
    numberOfAssets: "1",
    startDate: new Date(),
    endDate: new Date(),
    status: "In Use",
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const { data: employeesData = [], isLoading: employeesLoading } = useAllEmployees(open);

  const { data: assetsResponse, isLoading: assetsLoading } = useAssetsQuery(
    {
      limit: 1000,
    },
    { enabled: open }
  );

  const assetsData = assetsResponse?.data || [];

  const employees = useMemo(() => {
    const mapped = (employeesData || []).map((emp) => ({
      ...emp,
      employee_id: String(emp.employee_id ?? emp.id),
      employee_name:
        emp.employee_name ||
        (emp.applicant?.first_name && emp.applicant?.last_name
          ? `${emp.applicant.first_name} ${emp.applicant.last_name}`
          : emp.full_name || emp.name || "Unknown"),
      employee_code: emp.employee_code || emp.code || String(emp.employee_id ?? emp.id),
    }));

    if (employeeAsset?.employee?.id) {
      const currentEmployee = {
        employee_id: String(employeeAsset.employee.id),
        employee_name:
          employeeAsset.employee.name ||
          employeeAsset.employee.full_name ||
          "Unknown",
        employee_code:
          employeeAsset.employee.code || String(employeeAsset.employee.id),
      };

      const exists = mapped.some(
        (emp) => String(emp.employee_id) === String(currentEmployee.employee_id)
      );

      if (!exists) {
        mapped.unshift(currentEmployee);
      }
    }

    return mapped;
  }, [employeesData, employeeAsset]);

  useEffect(() => {
    if (!employeeAsset) return;

    setFormData({
      employeeId:
        employeeAsset.employee_id?.toString() ||
        employeeAsset.employee?.id?.toString() ||
        "",

      asset:
        employeeAsset.asset_id?.toString() ||
        employeeAsset.asset?.id?.toString() ||
        "",

      numberOfAssets:
        employeeAsset.quantity?.toString() ||
        employeeAsset.number_of_assets?.toString() ||
        "1",

      startDate: employeeAsset.start_date
        ? new Date(employeeAsset.start_date)
        : new Date(),

      endDate: employeeAsset.end_date
        ? new Date(employeeAsset.end_date)
        : new Date(),

      status: employeeAsset.status || "In Use",
    });
  }, [employeeAsset]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof Date) {
        submitData.append(key, format(value, "yyyy-MM-dd"));
      } else {
        submitData.append(key, value);
      }
    });

    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={isRTL ? "rtl" : "ltr"}
        className={cn(
          "sm:max-w-[500px]",
          isRTL && "text-right [&>button]:left-4 [&>button]:right-auto"
        )}
      >
        <DialogHeader className={isRTL ? "text-right" : "text-left"}>
          <DialogTitle className={isRTL ? "text-right" : "text-left"}>
            {t("assets.editEmployeeAssetModal.title")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
          <div className="space-y-2">
            <Label className="block text-right" htmlFor="employeeId">
              {t("assets.assignAssetModal.employee")}
            </Label>

            <EmployeeCombobox
              key={`${formData.employeeId}-${employees.length}`}
              value={formData.employeeId}
              onChange={(value) => handleInputChange("employeeId", value)}
              employees={employees}
              loading={employeesLoading}
              placeholder={t("assets.assignAssetModal.selectEmployee")}
              searchPlaceholder={t("assets.assignAssetModal.searchEmployee")}
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-right" htmlFor="asset">
              {t("assets.assignAssetModal.asset")}
            </Label>

            <Select
              value={formData.asset}
              onValueChange={(value) => handleInputChange("asset", value)}
              required
              disabled={assetsLoading}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <SelectTrigger className="text-right">
                <SelectValue
                  placeholder={
                    assetsLoading
                      ? t("common.loading")
                      : t("assets.assignAssetModal.selectAsset")
                  }
                />
              </SelectTrigger>

              <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                {assetsData?.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id.toString()}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="block text-right" htmlFor="numberOfAssets">
              {t("assets.assignAssetModal.numberOfAssets", {
                defaultValue: t("assets.assignAssetModal.numOfAssets"),
              })}
            </Label>

            <Input
              id="numberOfAssets"
              type="number"
              min="1"
              dir={isRTL ? "rtl" : "ltr"}
              className="text-right"
              placeholder={t("assets.assignAssetModal.enterNumberOfAssets")}
              value={formData.numberOfAssets}
              onChange={(e) => handleInputChange("numberOfAssets", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-right">
              {t("assets.assignAssetModal.startDate")}
            </Label>

            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full font-normal text-right justify-between",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <span>
                    {formData.startDate
                      ? format(formData.startDate, "PPP")
                      : t("assets.assignAssetModal.pickDate")}
                  </span>
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align={isRTL ? "end" : "start"}>
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => {
                    if (!date) return;
                    handleInputChange("startDate", date);
                    setStartDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="block text-right">
              {t("assets.assignAssetModal.endDate")}
            </Label>

            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full font-normal text-right justify-between",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <span>
                    {formData.endDate
                      ? format(formData.endDate, "PPP")
                      : t("assets.assignAssetModal.pickDate")}
                  </span>
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align={isRTL ? "end" : "start"}>
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => {
                    if (!date) return;
                    handleInputChange("endDate", date);
                    setEndDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="block text-right" htmlFor="status">
              {t("assets.assignAssetModal.status")}
            </Label>

            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              required
              dir={isRTL ? "rtl" : "ltr"}
            >
              <SelectTrigger className="text-right">
                <SelectValue placeholder={t("assets.assignAssetModal.selectStatus")} />
              </SelectTrigger>

              <SelectContent dir={isRTL ? "rtl" : "ltr"}>
                <SelectItem value="In Use">{t("assets.status.inUse")}</SelectItem>
                <SelectItem value="Returned">{t("assets.status.returned")}</SelectItem>
                <SelectItem value="Lost">{t("assets.status.lost")}</SelectItem>
                <SelectItem value="Overdue">{t("assets.status.overdue")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-row-reverse gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? t("common.updating") : t("common.update")}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
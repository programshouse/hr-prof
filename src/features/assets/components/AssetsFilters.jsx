// AssetsFilters.jsx
import { useTranslation } from 'react-i18next';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

import { useAllDepartments } from "@/shared/hooks/useAllDepartments";
import { useAllBranches } from "@/shared/hooks/useAllBranches";
import { useFilter } from "@/shared/hooks/useFilter";

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
}) {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = i18n.language?.startsWith('ar');

  const getOptionLabel = (option) => {
    if (isRTL) {
      return (
        option?.name_ar ||
        option?.title_ar ||
        option?.title ||
        option?.name ||
        option?.name_en ||
        option?.title_en ||
        ""
      );
    }

    return (
      option?.name_en ||
      option?.title_en ||
      option?.title ||
      option?.name ||
      option?.name_ar ||
      option?.title_ar ||
      ""
    );
  };

  const filteredOptions = (options || []).filter((option) =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) setSearchTerm("");
  };

  return (
    <Select
      dir={isRTL ? "rtl" : "ltr"}
      open={isOpen}
      onOpenChange={handleOpenChange}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={`border-gray-200 bg-white text-sm text-gray-500 shadow-sm ${
          isRTL ? 'text-right [&>span]:text-right' : 'text-left [&>span]:text-left'
        }`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isRTL ? "rtl" : "ltr"} className="max-h-60">
        <div className="sticky top-0 z-10 border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <Input
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={t('filters.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`h-8 ps-8 text-sm ${
                isRTL ? "text-right placeholder:text-right" : "text-left placeholder:text-left"
              }`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          <SelectItem
            className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
            value="all"
          >
            {allOption || t('filters.all')}
          </SelectItem>

          {filteredOptions.map((option) => (
            <SelectItem
              key={option.id}
              value={String(option.id)}
              className={isRTL ? 'text-right [&>span]:text-right' : 'text-left'}
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default function AssetsFilters({
  filters,
  onFiltersChange,
  showStatus = true,
  showDateFilters = false,
}) {
  const { t, i18n } = useTranslation();
  const { sidebarCollapsed } = useUIStore();
  const isRTL = i18n.language?.startsWith('ar');

  const { searchTerm, handleSearchChange, handleChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    "search"
  );

  const gridColsClass = sidebarCollapsed
    ? "md:grid-cols-2 xl:grid-cols-5"
    : "xl:grid-cols-5";

  const { data: departments = [] } = useAllDepartments();
  const { data: branches = [] } = useAllBranches();

  const statusOptions = [
    { id: "active", name_en: t("assets.status.inUse"), name_ar: t("assets.status.inUse") },
    { id: "returned", name_en: t("assets.status.returned"), name_ar: t("assets.status.returned") },
    { id: "lost", name_en: t("assets.status.lost"), name_ar: t("assets.status.lost") },
    { id: "completed", name_en: t("assets.status.completed"), name_ar: t("assets.status.completed") },
  ];

  const hasAnyFilter =
    searchTerm ||
    (showStatus && filters.status && filters.status !== "all") ||
    (filters.asset_type && filters.asset_type !== "all") ||
    (filters.department_id && filters.department_id !== "all") ||
    (filters.branch_id && filters.branch_id !== "all") ||
    filters.from_date ||
    filters.to_date;

  return (
    <div className={cn("flex w-full flex-1 flex-wrap items-center gap-3", gridColsClass)}>
      <div className="relative w-full xl:max-w-[250px] xl:min-w-[150px] xl:flex-1">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
            isRTL ? "right-3" : "left-3"
          }`}
        />

        <Input
          dir={isRTL ? 'rtl' : 'ltr'}
          placeholder={t('filters.search')}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={
            isRTL
              ? "h-11 w-full rounded-md border-gray-200 bg-white pr-9 pl-3 text-sm text-gray-700 placeholder:text-right"
              : "h-11 w-full rounded-md border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-700 placeholder:text-left"
          }
        />
      </div>

      {showDateFilters && (
        <>
          <div className="flex-1">
            <DatePicker
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={t('filters.fromDate')}
              value={filters.from_date}
              onChange={(date) => handleChange("from_date", date)}
              className="h-11"
            />
          </div>

          <div className="flex-1">
            <DatePicker
              dir={isRTL ? 'rtl' : 'ltr'}
              placeholder={t('filters.toDate')}
              value={filters.to_date}
              onChange={(date) => handleChange("to_date", date)}
              className="h-11"
            />
          </div>
        </>
      )}

      {showStatus && (
        <div className="flex-1">
          <SearchableSelect
            value={filters.status || "all"}
            onValueChange={(val) => handleChange("status", val)}
            options={statusOptions}
            placeholder={t('filters.status')}
            allOption={t('filters.allStatuses')}
          />
        </div>
      )}

      <div className="flex-1">
        <SearchableSelect
          value={filters.department_id ? String(filters.department_id) : "all"}
          onValueChange={(val) => handleChange("department_id", val)}
          options={departments}
          placeholder={t('filters.department')}
          allOption={t('filters.allCompanies')}
        />
      </div>

      <div className="flex-1">
        <SearchableSelect
          value={filters.branch_id ? String(filters.branch_id) : "all"}
          onValueChange={(val) => handleChange("branch_id", val)}
          options={branches}
          placeholder={t('filters.branch')}
          allOption={t('filters.allBranches')}
        />
      </div>

      {hasAnyFilter && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="flex h-11 items-center gap-2 px-3 text-slate-400 hover:text-red-500"
        >
          <X className="size-4" />
          <span className="text-sm font-medium">{t('filters.clearFilters')}</span>
        </Button>
      )}
    </div>
  );
}
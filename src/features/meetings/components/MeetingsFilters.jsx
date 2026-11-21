import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, CalendarIcon, LayoutGrid, List } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { useAllBranches, useAllDepartments, useAllPositions } from "@/shared/hooks";
import { useFilter } from "@/shared/hooks/useFilter";
import { useTranslation } from "react-i18next";

/* ---------- helpers ---------- */

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption = "All",
  t,
  isArabic,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const getOptionLabel = (o) => {
    if (isArabic) {
      return (
        o.name_ar ||
        o.title_ar ||
        o.name_en ||
        o.title_en ||
        o.name ||
        o.title ||
        ""
      );
    }

    return (
      o.name_en ||
      o.title_en ||
      o.name_ar ||
      o.title_ar ||
      o.name ||
      o.title ||
      ""
    );
  };

  const filtered = (options || []).filter((o) =>
    getOptionLabel(o).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Select
      dir={isArabic ? "rtl" : "ltr"}
      open={open}
      onOpenChange={setOpen}
      value={value ?? ""}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={`
          h-10 w-full border border-slate-200 bg-white shadow-sm
          ${isArabic ? "text-right [&>span]:text-right" : "text-left [&>span]:text-left"}
        `}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent dir={isArabic ? "rtl" : "ltr"} className="bg-white">
        <div className="border-b bg-white p-2">
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder={t("meetings.filters.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`
                bg-white ps-8
                ${isArabic ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}
              `}
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto bg-white">
          <SelectItem
            value="all"
            className={isArabic ? "text-right [&>span]:text-right" : "text-left"}
          >
            {allOption || t("meetings.filters.all")}
          </SelectItem>

          {filtered.map((o) => (
            <SelectItem
              key={o.id}
              value={String(o.id)}
              className={isArabic ? "text-right [&>span]:text-right" : "text-left"}
            >
              {getOptionLabel(o)}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

function DateSelect({ value, onChange, placeholder, isArabic }) {
  return (
    <Select dir={isArabic ? "rtl" : "ltr"} value={value || ""} onValueChange={onChange}>
      <SelectTrigger
        className={`
          h-10 w-full border border-slate-200 bg-white shadow-sm
          ${isArabic ? "text-right [&>span]:text-right" : "text-left [&>span]:text-left"}
        `}
      >
        <CalendarIcon className={`${isArabic ? "ml-2" : "mr-2"} h-4 w-4`} />

        <SelectValue placeholder={placeholder}>
          {value ? format(new Date(value), "dd/MM/yyyy") : placeholder}
        </SelectValue>
      </SelectTrigger>

      <SelectContent dir={isArabic ? "rtl" : "ltr"} className="bg-white">
        <div className="bg-white">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          />
        </div>
      </SelectContent>
    </Select>
  );
}

/* ---------- component ---------- */

export default function MeetingsFilters({
  filters,
  onFiltersChange,
  onAddMeeting,
  viewMode,
  onViewModeChange,
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith("ar");

  const { data: branches = [] } = useAllBranches();
  const { data: companies = [] } = useAllDepartments();
  const { data: positions = [] } = useAllPositions();

  const { searchTerm, handleSearchChange, handleChange, handleReset } = useFilter(
    filters,
    onFiltersChange,
    "keyword"
  );

  const hasAnyFilter =
    filters.keyword ||
    filters.position_id ||
    filters.department_id ||
    filters.branch_id ||
    filters.from_date ||
    filters.to_date;

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="flex flex-col gap-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-wrap xl:items-center xl:gap-3">
            {/* Search */}
            <div className="relative w-full xl:w-[280px] 2xl:w-[300px]">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder={t("meetings.filters.search")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`
                  h-10 w-full rounded-md border-slate-200 ps-9 text-sm text-slate-700 shadow-sm
                  ${isArabic ? "text-right placeholder:text-right" : "text-left placeholder:text-left"}
                `}
              />
            </div>

            {/* Position */}
            <div className="w-full xl:w-[140px]">
              <SearchableSelect
                value={filters.position_id}
                onValueChange={(v) => handleChange("position_id", v)}
                options={positions}
                placeholder={t("meetings.filters.position")}
                allOption={t("meetings.filters.all")}
                t={t}
                isArabic={isArabic}
              />
            </div>

            {/* Company */}
            <div className="w-full xl:w-[150px]">
              <SearchableSelect
                value={filters.department_id}
                onValueChange={(v) => handleChange("department_id", v)}
                options={companies}
                placeholder={t("meetings.filters.company")}
                allOption={t("meetings.filters.all")}
                t={t}
                isArabic={isArabic}
              />
            </div>

            {/* Branch */}
            <div className="w-full xl:w-[140px]">
              <SearchableSelect
                value={filters.branch_id}
                onValueChange={(v) => handleChange("branch_id", v)}
                options={branches}
                placeholder={t("meetings.filters.branch")}
                allOption={t("meetings.filters.all")}
                t={t}
                isArabic={isArabic}
              />
            </div>

            {/* Date Range */}
            <div className="w-full xl:w-[200px]">
              <div className="grid grid-cols-2 gap-2">
                <DateSelect
                  value={filters.from_date}
                  onChange={(v) => handleChange("from_date", v)}
                  placeholder={t("meetings.filters.from")}
                  isArabic={isArabic}
                />

                <DateSelect
                  value={filters.to_date}
                  onChange={(v) => handleChange("to_date", v)}
                  placeholder={t("meetings.filters.to")}
                  isArabic={isArabic}
                />
              </div>
            </div>

            {/* Clear button */}
            {hasAnyFilter && (
              <div className="w-full xl:w-auto">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="h-10 w-full justify-center px-3 text-slate-500 hover:text-red-500 xl:w-auto"
                >
                  <X className="size-4" />

                  <span className={`${isArabic ? "mr-1" : "ml-1"} text-sm font-medium`}>
                    {t("meetings.filters.clear")}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex w-full xl:w-auto ${isArabic ? "justify-start" : "justify-end"}`}>
          <div className="flex gap-2">
            {onAddMeeting && (
              <Button variant="reset1" onClick={onAddMeeting}>
                + {t("meetings.addMeetingButton")}
              </Button>
            )}

            {onViewModeChange && (
              <div className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={`h-10 w-10 ${
                    viewMode === "grid" ? "bg-slate-900 text-white" : "bg-white"
                  }`}
                >
                  <LayoutGrid className="mx-auto h-4 w-4" />
                </button>

                <button
                  onClick={() => onViewModeChange("list")}
                  className={`h-10 w-10 ${
                    isArabic ? "border-r" : "border-l"
                  } ${
                    viewMode === "list" ? "bg-slate-900 text-white" : "bg-white"
                  }`}
                >
                  <List className="mx-auto h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
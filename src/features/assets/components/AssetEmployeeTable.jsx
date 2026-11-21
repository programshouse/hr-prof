// src/features/assets/components/AssetEmployeeTable.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const getStatusStyles = (status) => {
  const s = String(status || "").toLowerCase().replace(/\s+/g, "");
  if (s === "inuse" || s === "in_use" || s === "active") return "bg-green-100 text-green-700";
  if (s === "returned") return "bg-blue-100 text-blue-700";
  if (s === "lost") return "bg-red-100 text-red-600";
  if (s === "completed") return "bg-slate-100 text-slate-600";
  if (s === "overdue") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
};

/** Map API / form values to i18n key suffix under assets.status */
const toStatusI18nKey = (status) => {
  const raw = String(status || "").toLowerCase().trim();
  const s = raw.replace(/\s+/g, "_");

  if (s === "in_use" || raw === "in use" || s === "inuse") return "inUse";
  if (s === "returned" || raw === "returned") return "returned";
  if (s === "lost") return "lost";
  if (s === "completed") return "completed";
  if (s === "active") return "active";
  if (s === "overdue") return "overdue";
  return null;
};

const getStatusLabel = (status, t) => {
  const k = toStatusI18nKey(status);
  if (k) return t(`assets.status.${k}`);
  return status || "—";
};

const fmtDate = (v) => {
  if (!v) return "--";
  return String(v);
};

function getEmployeeName(emp, applicant, preferArabic) {
  if (preferArabic) {
    return (
      applicant.full_name_ar?.trim() ||
      emp.full_name_ar?.trim() ||
      applicant.name?.trim() ||
      emp.name?.trim() ||
      [applicant.first_name, applicant.middle_name, applicant.last_name].filter(Boolean).join(" ").trim() ||
      [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ").trim() ||
      ""
    );
  }

  return (
    applicant.name?.trim() ||
    emp.name?.trim() ||
    [applicant.first_name, applicant.last_name].filter(Boolean).join(" ").trim() ||
    [applicant.first_name, applicant.middle_name, applicant.last_name].filter(Boolean).join(" ").trim() ||
    [emp.first_name, emp.last_name].filter(Boolean).join(" ").trim() ||
    ""
  );
}

function getPositionLabel(emp, applicant, preferArabic) {
  const pos = emp.position || applicant.position || emp.job || applicant.job;
  if (!pos) {
    return (
      emp.position_name ||
      applicant.position_name ||
      emp.job_title ||
      applicant.job_title ||
      ""
    );
  }
  if (typeof pos === "string") return pos;
  if (preferArabic) {
    return pos.title_ar || pos.name_ar || pos.title_en || pos.name_en || pos.title || pos.name || "";
  }
  return pos.title_en || pos.name_en || pos.title || pos.name || pos.title_ar || pos.name_ar || "";
}

function getAssetDisplayName(asset, row, preferArabic) {
  if (preferArabic) {
    return (
      asset.name_ar?.trim() ||
      row.asset_name_ar?.trim() ||
      asset.name?.trim() ||
      row.asset_name?.trim() ||
      row.type ||
      "—"
    );
  }
  return asset.name?.trim() || row.asset_name?.trim() || row.type || "—";
}

export default function AssetEmployeeTable({ data = [], onEdit, onDelete }) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language === "ar";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="whitespace-nowrap text-xs font-semibold text-slate-600">
                {t("assets.headers.employee")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold text-slate-600">
                {t("assets.headers.asset")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold text-slate-600">
                {t("assets.headers.numOfAssets")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold text-slate-600">
                {t("assets.headers.startDate")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold text-slate-600">
                {t("assets.headers.endDate")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold text-slate-600">
                {t("assets.headers.status")}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right text-xs font-semibold text-slate-600">
                {t("assets.headers.action")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!data?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  {t("assets.noRecordsFound")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const emp = row.employee || {};
                const applicant = emp.applicant || {};
                const asset = row.asset || {};

                const fullName = getEmployeeName(emp, applicant, preferArabic) || "—";
                const position = getPositionLabel(emp, applicant, preferArabic);
                const code = emp.code ?? emp.id ?? row.employee_id ?? "—";
                const assetName = getAssetDisplayName(asset, row, preferArabic);

                const rowKey = [
                  "ea",
                  row.id ?? "noid",
                  row.employee_id ?? emp.id ?? "noemp",
                  row.asset_id ?? asset.id ?? "noasset",
                  index,
                ].join("-");

                return (
                  <TableRow
                    key={rowKey}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40"
                  >
                    <TableCell className="min-w-[12rem] whitespace-normal py-5">
                      <div className="flex flex-col gap-0.5 leading-tight">
                        <div className="text-sm font-semibold text-slate-900">{fullName}</div>
                        <div className="text-xs text-slate-500">
                          {t("assets.employeeRow.code")}: {code}
                        </div>
                        {position ? (
                          <div className="text-xs text-slate-600">
                            {t("assets.headers.position")}: {position}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-5 text-sm text-slate-800">
                      {assetName}
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-5 text-sm text-slate-700">
                      {row.quantity ?? row.num_of_assets ?? row.assets_count ?? row.count ?? "—"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-5 text-sm text-slate-700">
                      {fmtDate(row.start_date ?? row.startDate)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-5 text-sm text-slate-700">
                      {fmtDate(row.end_date ?? row.endDate)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-5">
                      <span
                        className={[
                          "inline-flex items-center justify-center rounded-md px-3 py-1 text-[11px] font-medium",
                          getStatusStyles(row.status),
                        ].join(" ")}
                      >
                        {getStatusLabel(row.status, t)}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-md border-slate-200 bg-white text-slate-600 "
                          onClick={() => onEdit?.(row)}
                          title={t("assets.edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-md border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-red-600"
                          onClick={() => onDelete?.(row)}
                          title={t("assets.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

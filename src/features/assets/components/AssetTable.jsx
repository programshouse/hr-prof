import { useTranslation } from "react-i18next";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

/* =========================
   Status UI mapping
========================= */

const getStatusStyles = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "in_use") {
    return "bg-green-100 text-green-700";
  }
  if (s === "returned") {
    return "bg-blue-100 text-blue-700";
  }
  if (s === "lost") {
    return "bg-red-100 text-red-600";
  }
  return "bg-slate-100 text-slate-700";
};

export default function AssetTable({ data = [], onEdit, onDelete }) {
  const { t } = useTranslation();

  const getStatusLabel = (status) => {
    const s = String(status || "").toLowerCase();

    const map = {
      in_use: t("assets.status.inUse"),
      returned: t("assets.status.returned"),
      lost: t("assets.status.lost"),
      completed: t("assets.status.completed"),
      active: t("assets.status.active"),
    };

    return map[s] || status;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{t("assets.headers.asset")}</TableHead>
              <TableHead>{t("assets.headers.assetValue")}</TableHead>
              <TableHead>{t("assets.headers.description")}</TableHead>
              <TableHead className="text-right">
                {t("assets.headers.action")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!data?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((asset, index) => (
                <TableRow key={asset?.id ?? index}>
                  {/* Asset Name */}
                  <TableCell>
                    {asset?.asset?.name || asset?.assetName || asset?.name || "—"}
                  </TableCell>

                  {/* Value */}
                  <TableCell>
                    {asset?.asset?.value != null
                      ? Number(asset.asset.value).toLocaleString()
                      : asset?.value != null
                      ? Number(asset.value).toLocaleString()
                      : asset?.assetValue != null
                      ? Number(asset.assetValue).toLocaleString()
                      : "—"}
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    {asset?.description || "—"}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit?.(asset)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete?.(asset)}
                        className="hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
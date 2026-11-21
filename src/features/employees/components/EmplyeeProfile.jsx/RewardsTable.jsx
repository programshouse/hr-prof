import React from "react";
import { Award, Calendar, Pencil, Trash2 } from "lucide-react";
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
import { useAuthStore } from "@/services/auth/auth.store";

export default function RewardsTable({
  rewards = [],
  isLoading = false,
  onEdit,
  onDelete,
  readOnly = false,
}) {
  const { t } = useTranslation();

  const authSource = useAuthStore((state) => state.authSource);
  const role = useAuthStore((state) => state.role);

  const isEmployeePortal =
    authSource === "employee-login" ||
    role === "employee";

  const canManage =
    !isEmployeePortal &&
    !readOnly;

  const colSpan = canManage ? 4 : 3;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">

          <Award className="h-5 w-5 text-slate-500" />

          <h3 className="text-base font-semibold text-black">
            {t(
              "employees.profile.details.rewards.title"
            )}
          </h3>

        </div>
      </div>

      <Table>

        <TableHeader className="bg-slate-50">

          <TableRow>

            <TableHead>
              {t(
                "employees.profile.details.rewards.table.date"
              )}
            </TableHead>

            <TableHead>
              {t(
                "employees.profile.details.rewards.table.amount"
              )}
            </TableHead>

            <TableHead>
              {t(
                "employees.profile.details.rewards.table.type"
              )}
            </TableHead>

            {canManage && (
              <TableHead className="w-24">
                {t(
                  "employees.profile.details.rewards.table.actions"
                )}
              </TableHead>
            )}

          </TableRow>

        </TableHeader>

        <TableBody>

          {isLoading ? (

            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="py-4 text-center"
              >
                {t(
                  "employees.profile.details.rewards.loading"
                )}
              </TableCell>
            </TableRow>

          ) : rewards.length === 0 ? (

            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="py-4 text-center text-gray-500"
              >
                {t(
                  "employees.profile.details.rewards.noRecords"
                )}
              </TableCell>
            </TableRow>

          ) : (

            rewards.map((row, index) => (
              <TableRow
                key={`reward-${row.id || index}-${row.employee_id || "unknown"}`}
                className="border-slate-100"
              >

                <TableCell>
                  <div className="flex items-center gap-2">

                    <Calendar className="h-4 w-4 text-slate-400" />

                    <span className="text-sm text-black">
                      {row.date || "—"}
                    </span>

                  </div>
                </TableCell>

                <TableCell className="text-sm text-black">
                  {row.amount
                    ? `${row.amount} EGP`
                    : "—"}
                </TableCell>

                <TableCell className="text-sm text-black">
                  {row.type || "—"}
                </TableCell>

                {canManage && (
                  <TableCell>
                    <div className="flex items-center gap-1">

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() =>
                          onEdit?.(row)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          onDelete?.(row)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </div>
                  </TableCell>
                )}

              </TableRow>
            ))

          )}

        </TableBody>

      </Table>

    </div>
  );
}
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import {
  RotateCcw,
  Fingerprint,
  Loader2,
  MonitorSmartphone,
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

import UsersEditActions from './UsersEditActions';

export default function UsersTable({
  users = [],
  loading = false,
  onEdit,
  onDelete,
  onResetDevice,
  onManageDevices,
  onResetFingerprint,
  resettingDeviceId,
  resettingFingerprintId,
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
        {t('common.loading')}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
        {t('emptyStates.noUsers')}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('tables.headers.employee')}</TableHead>

            <TableHead>{t('tables.headers.userName')}</TableHead>

            <TableHead className="text-center">
              {t('tables.headers.action')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const userId = user.id ?? user.employee_id ?? user.user_id;

            const isResetting = resettingDeviceId === userId;

            const isFingerprintResetting =
              resettingFingerprintId === userId;

            return (
              <TableRow key={userId}>
                <TableCell className="font-medium">
                  {user.employee?.name || user.name || t('common.na')}
                </TableCell>

                <TableCell>
                  {user.login_id || (
                    <span className="italic text-slate-400">
                      No credentials assigned
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={isFingerprintResetting}
                      onClick={() => onResetFingerprint?.(user)}
                      title="Reset fingerprint"
                      className="cursor-pointer rounded-md border p-2.5 text-slate-600 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isFingerprintResetting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Fingerprint className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onManageDevices?.(user)}
                      title="Manage MAC devices"
                      className="cursor-pointer rounded-md border p-2.5 text-slate-600 transition-colors hover:text-primary"
                    >
                      <MonitorSmartphone className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={() => onResetDevice?.(user)}
                      title="Reset device"
                      className="cursor-pointer rounded-md border p-2.5 text-slate-600 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isResetting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </button>

                    <UsersEditActions
                      onEdit={() => onEdit?.(user)}
                      onDelete={() => onDelete?.(user)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
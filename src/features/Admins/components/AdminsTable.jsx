import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import SystemSettingsEditDeleteActions from '../../../components/ui/EditDeleteActions';

function isSuperAdmin(admin) {
  const flag = admin?.is_super_admin;
  if (flag === true || flag === 1 || flag === '1') return true;

  const role = String(admin?.role ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  return role === 'super_admin';
}

function getAdminRoleLabel(admin, t) {
  if (isSuperAdmin(admin)) {
    return t('admins.form.superAdmin');
  }

  return t('admins.form.adminRole');
}

export default function AdminsTable({ admins = [], loading = false, onEdit, onDelete }) {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        {t('admins.loading')}
      </div>
    );
  }

  if (!admins.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        {t('admins.noAdmins')}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admins.headers.name')}</TableHead>
            <TableHead>{t('admins.headers.email')}</TableHead>
            <TableHead>{t('admins.headers.role')}</TableHead>
            <TableHead className="text-center">{t('admins.headers.action')}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium text-slate-900">{admin.name}</TableCell>

              <TableCell className="text-slate-600">{admin.email}</TableCell>

              <TableCell className="text-slate-700">{getAdminRoleLabel(admin, t)}</TableCell>

              <TableCell>
                <div className="flex justify-center">
                  <SystemSettingsEditDeleteActions
                    onEdit={() => onEdit?.(admin)}
                    onDelete={() => onDelete?.(admin)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

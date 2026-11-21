import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import { useAdminsQuery } from '../hooks/useAdminsQuery';
import { usePermissionsQuery } from '../hooks/usePermissionsQuery';
import { useAdminPermissionsQuery } from '../hooks/useAdminPermissionsQuery';
import { useUpdateAdminPermissionsMutation } from '../hooks/useUpdateAdminPermissionsMutation';

import PermissionAdminSelect from '../components/PermissionAdminSelect';
import PermissionsEmptyState from '../components/PermissionsEmptyState';
import PermissionsModuleCard from '../components/PermissionsModuleCard';
import PermissionsSuperAdminNotice from '../components/PermissionsSuperAdminNotice';

import { groupPermissionsByModule, mapPermissionIds } from '../utils/permissions.mapper';

export default function PermissionManagement() {
  const { t } = useTranslation();
  const [selectedAdminId, setSelectedAdminId] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  const { data: admins = [], isLoading: adminsLoading } = useAdminsQuery();
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissionsQuery();

  const { data: adminPermissionsData, isLoading: adminPermissionsLoading } =
    useAdminPermissionsQuery(selectedAdminId);

  const updatePermissionsMutation = useUpdateAdminPermissionsMutation();

  const modules = React.useMemo(() => {
    return groupPermissionsByModule(permissions);
  }, [permissions]);

  const selectedAdmin = React.useMemo(() => {
    return admins.find((admin) => String(admin.id) === String(selectedAdminId)) || null;
  }, [admins, selectedAdminId]);

  React.useEffect(() => {
    if (!selectedAdminId) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(mapPermissionIds(adminPermissionsData?.permissions || []));
  }, [selectedAdminId, adminPermissionsData]);

  const handleTogglePermission = (permissionId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }

      return next;
    });
  };

  const handleSelectAllModule = (module, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      module.actions.forEach((action) => {
        if (checked) {
          next.add(action.id);
        } else {
          next.delete(action.id);
        }
      });

      return next;
    });
  };

  const handleSave = () => {
    if (!selectedAdminId || selectedAdmin?.is_super_admin) return;

    updatePermissionsMutation.mutate({
      adminId: selectedAdminId,
      permissions: Array.from(selectedIds),
    });
  };

  const isLoading = adminsLoading || permissionsLoading || adminPermissionsLoading;

  return (
    <div>
      <PermissionAdminSelect
        admins={admins}
        selectedAdminId={selectedAdminId}
        onChange={setSelectedAdminId}
      />

      {!selectedAdminId ? (
        <PermissionsEmptyState />
      ) : isLoading ? (
        <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="text-primary h-5 w-5 animate-spin" />
        </div>
      ) : selectedAdmin?.is_super_admin ? (
        <PermissionsSuperAdminNotice />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
            {modules.map((module) => (
              <PermissionsModuleCard
                key={module.id}
                module={module}
                selectedIds={selectedIds}
                onTogglePermission={handleTogglePermission}
                onSelectAllModule={handleSelectAllModule}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={updatePermissionsMutation.isPending}
              className="bg-primary rounded-xl px-6 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatePermissionsMutation.isPending ? t('permissions.saving') : t('permissions.savePermissions')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

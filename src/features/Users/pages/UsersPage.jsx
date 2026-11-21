import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import EmployeeFilters from '@/features/employees/components/EmployeeFilters';

import UsersTable from '../components/UsersTable';
import UserFormModal from '../components/UserFormModal';
import DeleteUserModal from '../components/DeleteUserModal';
import UserDevicesModal from '../components/UserDevicesModal';

import { useUsersQuery } from '../hooks/useUsersQuery';

import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useResetDeviceMutation,
  useResetFingerprintMutation,
} from '../hooks/useUserMutations';

export default function UsersPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    search: '',
    shift_id: '',
    position_id: '',
    department_id: '',
    branch_id: '',
    employment_type: '',
    is_active: '',
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [devicesUser, setDevicesUser] = useState(null);

  const [resettingDeviceId, setResettingDeviceId] = useState(null);
  const [resettingFingerprintId, setResettingFingerprintId] = useState(null);

  const { data, isLoading } = useUsersQuery({
    page,
    per_page: pageSize,
    keyword: filters.search || undefined,
    shift_id: filters.shift_id || undefined,
    position_id: filters.position_id || undefined,
    department_id: filters.department_id || undefined,
    branch_id: filters.branch_id || undefined,
    employment_type: filters.employment_type || undefined,
    is_active: filters.is_active || undefined,
  });

  const users = data?.data ?? [];
  const meta = data?.meta ?? {};

  const totalPages = Number(meta.last_page) || 1;

  const createUserMutation = useCreateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const resetDeviceMutation = useResetDeviceMutation();
  const resetFingerprintMutation = useResetFingerprintMutation();

  const sortedUsers = useMemo(() => {
    return [...users].sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    );
  }, [users]);

  const handleCreate = async (payload) => {
    await createUserMutation.mutateAsync(payload);

    setCreateOpen(false);
    setPage(1);
  };

  const handleUpdate = async (payload) => {
    const userId =
      editUser?.id ?? editUser?.employee_id ?? editUser?.user_id;

    if (!userId) return;

    await resetPasswordMutation.mutateAsync({
      id: userId,
      data: payload,
    });

    setEditUser(null);
  };

  const handleResetDevice = async (user) => {
    const userId = user?.id ?? user?.employee_id ?? user?.user_id;

    if (!userId) return;

    setResettingDeviceId(userId);

    try {
      await resetDeviceMutation.mutateAsync(userId);
    } finally {
      setResettingDeviceId(null);
    }
  };

  const handleResetFingerprint = async (user) => {
    const userId = user?.id ?? user?.employee_id ?? user?.user_id;

    if (!userId) return;

    setResettingFingerprintId(userId);

    try {
      await resetFingerprintMutation.mutateAsync(userId);
    } finally {
      setResettingFingerprintId(null);
    }
  };

  const handleDelete = async () => {
    const userId =
      deleteUser?.id ?? deleteUser?.employee_id ?? deleteUser?.user_id;

    if (!userId) return;

    await deleteUserMutation.mutateAsync(userId);

    setDeleteUser(null);

    if (sortedUsers.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handlePageSizeChange = (value) => {
    const size = Number(value) || 10;

    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-transparent md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {t('users.title')}
          </h1>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />

          {t('users.createNew')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <EmployeeFilters
          filters={filters}
          onFiltersChange={(next) => {
            setFilters(next || {});
            setPage(1);
          }}
          hideType
          hideDateFilters
        />

        <div className="flex justify-end">
          <PageSizeSelect
            value={pageSize}
            onChange={handlePageSizeChange}
          />
        </div>
      </div>

      <UsersTable
        users={sortedUsers}
        loading={isLoading}
        onEdit={setEditUser}
        onDelete={setDeleteUser}
        onResetDevice={handleResetDevice}
        onManageDevices={setDevicesUser}
        onResetFingerprint={handleResetFingerprint}
        resettingDeviceId={resettingDeviceId}
        resettingFingerprintId={resettingFingerprintId}
      />

      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <UserFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={createUserMutation.isPending}
      />

      <UserFormModal
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) {
            setEditUser(null);
          }
        }}
        user={editUser}
        onSubmit={handleUpdate}
        loading={resetPasswordMutation.isPending}
      />

      <UserDevicesModal
        open={!!devicesUser}
        onOpenChange={(open) => {
          if (!open) {
            setDevicesUser(null);
          }
        }}
        user={devicesUser}
      />

      <DeleteUserModal
        open={!!deleteUser}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUser(null);
          }
        }}
        user={deleteUser}
        onConfirm={handleDelete}
        loading={deleteUserMutation.isPending}
      />
    </div>
  );
}
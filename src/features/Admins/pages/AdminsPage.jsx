import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminsTable from '../components/AdminsTable';
import AdminFormModal from '../components/AdminFormModal';
import DeleteAdminModal from '../components/DeleteAdminModal';
import { useAdminsQuery } from '../hooks/useAdminsQuery';
import {
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useUpdateAdminMutation,
} from '../hooks/useAdminMutations';

export default function AdminsPage() {
  const { t } = useTranslation();
  const { data: admins = [], isLoading } = useAdminsQuery();

  const createAdminMutation = useCreateAdminMutation();
  const updateAdminMutation = useUpdateAdminMutation();
  const deleteAdminMutation = useDeleteAdminMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [deleteAdmin, setDeleteAdmin] = useState(null);

  const isSubmittingCreate = createAdminMutation.isPending;
  const isSubmittingUpdate = updateAdminMutation.isPending;
  const isSubmittingDelete = deleteAdminMutation.isPending;

  const sortedAdmins = useMemo(() => {
    return [...admins].sort((a, b) => {
      if (a.is_super_admin && !b.is_super_admin) return -1;
      if (!a.is_super_admin && b.is_super_admin) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [admins]);

  const handleCreate = async (payload) => {
    await createAdminMutation.mutateAsync(payload);
    setCreateOpen(false);
  };

  const handleUpdate = async (payload) => {
    if (!editAdmin?.id) return;

    await updateAdminMutation.mutateAsync({
      id: editAdmin.id,
      data: payload,
    });

    setEditAdmin(null);
  };

  const handleDelete = async () => {
    if (!deleteAdmin?.id) return;

    await deleteAdminMutation.mutateAsync(deleteAdmin.id);
    setDeleteAdmin(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-transparent md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-primary text-3xl font-bold tracking-tight">{t('admins.title')}</h1>
          <p className="mt-1 text-lg text-slate-500">
            {t('admins.description')}
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('admins.createNew')}
        </Button>
      </div>

      <AdminsTable
        admins={sortedAdmins}
        loading={isLoading}
        onEdit={(admin) => setEditAdmin(admin)}
        onDelete={(admin) => setDeleteAdmin(admin)}
      />

      <AdminFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        onSubmit={handleCreate}
        loading={isSubmittingCreate}
      />

      <AdminFormModal
        open={!!editAdmin}
        onOpenChange={(open) => {
          if (!open) setEditAdmin(null);
        }}
        mode="update"
        admin={editAdmin}
        onSubmit={handleUpdate}
        loading={isSubmittingUpdate}
      />

      <DeleteAdminModal
        open={!!deleteAdmin}
        onOpenChange={(open) => {
          if (!open) setDeleteAdmin(null);
        }}
        admin={deleteAdmin}
        onConfirm={handleDelete}
        loading={isSubmittingDelete}
      />
    </div>
  );
}

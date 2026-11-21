import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useAllowancesQuery } from '../hooks/useAllowancesQuery';
import { useAllowanceMutations } from '../hooks/useAllowanceMutations';
import AllowanceFilters from '../components/AllowanceFilters';
import AllowancesTable from '../components/AllowancesTable';
import AllowanceFormDialog from '../components/AllowanceFormDialog';
import DeleteAllowanceDialog from '../components/DeleteAllowanceDialog';

export default function AllowancesPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    keyword: '',
    department_id: '',
    from_date: '',
    to_date: '',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAllowance, setDeletingAllowance] = useState(null);

  const { data, isLoading } = useAllowancesQuery({
    page: currentPage,
    limit: pageSize,
    keyword: filters.keyword,
    department_id: filters.department_id,
    from_date: filters.from_date,
    to_date: filters.to_date,
  });

  const { createAllowance, updateAllowance, deleteAllowance } = useAllowanceMutations();

  const rows = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta || {};

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  const handleSave = async (payload) => {
    if (editingAllowance?.id) {
      await updateAllowance.mutateAsync({
        id: editingAllowance.id,
        payload,
      });
    } else {
      await createAllowance.mutateAsync(payload);
    }

    setFormOpen(false);
    setEditingAllowance(null);
  };

  const handleDelete = async (allowance) => {
    if (!allowance?.id) return;

    await deleteAllowance.mutateAsync(allowance.id);
    setDeleteOpen(false);
    setDeletingAllowance(null);
  };

  const handleOpenAdd = () => {
    setEditingAllowance(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (row) => {
    setEditingAllowance(row);
    setFormOpen(true);
  };

  const handleCloseForm = (open) => {
    setFormOpen(open);
    if (!open) {
      setEditingAllowance(null);
    }
  };

  const handleCloseDelete = (open) => {
    setDeleteOpen(open);
    if (!open) {
      setDeletingAllowance(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Filters (LEFT) */}
        <div className="flex-1">
          <AllowanceFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Button (RIGHT) */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md px-4 text-xs font-semibold shadow-xs"
            onClick={handleOpenAdd}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t('common.addNew')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PageSizeSelect
            value={pageSize}
            onChange={(value) => {
              setPageSize(Number(value) || 10);
              setCurrentPage(1);
            }}
            options={[10, 20, 50, 100]}
          />
        </div>

        <AllowancesTable
          data={rows}
          loading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={(row) => {
            setDeletingAllowance(row);
            setDeleteOpen(true);
          }}
        />
      </div>

      <Pagination
        currentPage={meta.current_page || currentPage}
        totalPages={meta.last_page || 1}
        onPageChange={setCurrentPage}
      />

      <AllowanceFormDialog
        open={formOpen}
        onOpenChange={handleCloseForm}
        allowance={editingAllowance}
        onSubmit={handleSave}
        isSubmitting={createAllowance.isPending || updateAllowance.isPending}
      />

      <DeleteAllowanceDialog
        open={deleteOpen}
        onOpenChange={handleCloseDelete}
        allowance={deletingAllowance}
        onConfirm={handleDelete}
        isDeleting={deleteAllowance.isPending}
      />
    </div>
  );
}

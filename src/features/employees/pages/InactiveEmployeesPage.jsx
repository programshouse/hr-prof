// src/features/employees/pages/InactiveEmployeesPage.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, List, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useUIStore } from '@/stores/useUIStore';
import { useTranslation } from 'react-i18next';

import EmployeeStats from '../components/EmployeeStats';
import EmployeeFilters from '../components/EmployeeFilters';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeTable from '../components/EmployeeTable';
import { EmployeeFormDialog } from '../components/EmployeeFormDialog';
import DeleteEmployeeModal from '../components/DeleteEmployeeModal';
import ActivateEmployeeModal from '../components/ActivateEmployeeModal';
import EmployeesHeaderActions from '../components/EmployeesHeaderActions';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';

import { useInactiveEmployeesQuery } from '../hooks/useInactiveEmployeesQuery';
import useEmployeesHeaderQuery from '../hooks/useEmployeesHeaderQuery.js';
import { employeesApi } from '../api/employees.api';

export default function InactiveEmployeesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔒 always inactive
  const [filters, setFilters] = useState(() => {
    const urlFilters = { is_active: 'false' };
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'is_active' && value !== '' && value !== 'all') {
        urlFilters[key] = value;
      }
    });
    return urlFilters;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // selection
  const [rowSelection, setRowSelection] = useState({});
  const [employeeTable, setEmployeeTable] = useState(null);
  const [showSelection, setShowSelection] = useState(false);

  // delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // activate modal
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [employeeToActivate, setEmployeeToActivate] = useState(null);

  // view mode (cards / table)
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);

  // header stats
  const {
    data: headerData,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = useEmployeesHeaderQuery();

  // data query
  const { data, isLoading, refetch } = useInactiveEmployeesQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  // filters
  const handleFiltersChange = (nextFilters) => {
    setFilters({ ...nextFilters, is_active: 'false' });
    setPage(1);
  };

  // page size
  const handlePageSizeChange = (value) => {
    setPageSize(Number(value) || 10);
    setPage(1);
  };

  // row selection
  const handleRowSelectionChange = (updater) => {
    setRowSelection((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater || {};
      if (Object.keys(next).length === 0) setShowSelection(false);
      return next;
    });
  };

  // edit
  const handleEdit = async (emp) => {
    const fullData = await employeesApi.getPersonalData(emp.id);
    setEditEmployee(fullData);
    setIsDialogOpen(true);
  };

  // refresh after activate
  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {isHeaderError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load employees summary.
        </div>
      ) : (
        <EmployeeStats data={headerData} isLoading={isHeaderLoading} />
      )}

      {/* Filters + actions */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-5xl">
          <EmployeeFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        <EmployeesHeaderActions
          viewMode={viewMode}
          setViewMode={setViewMode}
          table={employeeTable}
          showSelection={showSelection}
          onEnableSelection={() => setShowSelection(true)}
          allRows={data?.rows ?? []}
        />
      </div>

      {/* page size + view */}
      <div className="flex items-center justify-between">
        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'cards' ? 'save' : 'outline'}
            size="icon"
            onClick={() => setViewMode('cards')}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'save' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {/* content */}
      {hasNoData ? (
        <EmptyState
          title="لا يوجد موظفون غير نشطين"
          description="جميع الموظفين نشطون حالياً"
          action={
            <Button variant="outline" onClick={() => navigate('/employees')}>
              <Users className="mr-2 size-4" />
              عرض جميع الموظفين
            </Button>
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(data?.rows ?? []).map((emp) => (
            <EmployeeCard
              key={emp.id}
              id={emp.id}
              image={emp.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
              name={emp.full_name || '—'}
              role={emp.position || '—'}
              employeeId={emp.code || '—'}
              joinDate={emp.join_date || ''}
              isActive={false}
              onView={() => navigate(`/employees/${emp.id}`)}
              onEdit={() => handleEdit(emp)}
              onDelete={() => {
                setEmployeeToDelete(emp);
                setDeleteModalOpen(true);
              }}
              onActivateClick={() => {
                setEmployeeToActivate(emp);
                setActivateModalOpen(true);
              }}
              onToggleStatus={handleRefresh}
            />
          ))}
        </div>
      ) : (
        <EmployeeTable
          data={data?.rows ?? []}
          loading={isLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          onTableReady={setEmployeeTable}
          showSelection={showSelection}
          onShowSelectionChange={setShowSelection}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
          onActivateRequest={(emp) => {
            setEmployeeToActivate(emp);
            setActivateModalOpen(true);
          }}
        />
      )}

      {!hasNoData && (
        <Pagination
          currentPage={page}
          totalPages={data?.meta?.last_page || 1}
          onPageChange={setPage}
        />
      )}

      {/* dialog */}
      <EmployeeFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditEmployee(null);
        }}
        employee={editEmployee}
      />

      {/* delete modal */}
      <DeleteEmployeeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        employee={employeeToDelete}
      />

      {/* activate modal */}
      <ActivateEmployeeModal
        open={activateModalOpen}
        onOpenChange={setActivateModalOpen}
        employee={employeeToActivate}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

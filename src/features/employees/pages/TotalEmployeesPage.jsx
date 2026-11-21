// src/features/employees/pages/TotalEmployeesPage.jsx
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
import DeactivateEmployeeModal from '../components/DeactivateEmployeeModal';
import ActivateEmployeeModal from '../components/ActivateEmployeeModal';
import EmployeesHeaderActions from '../components/EmployeesHeaderActions';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';

import { useTotalEmployeesQuery } from '../hooks/useTotalEmployeesQuery';
import useEmployeesHeaderQuery from '../hooks/useEmployeesHeaderQuery.js';
import { employeesApi } from '../api/employees.api';

export default function TotalEmployeesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState(() => {
    const urlFilters = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && value !== 'all' && value !== '') {
        urlFilters[key] = value;
      }
    });
    return urlFilters;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // selection + table instance
  const [rowSelection, setRowSelection] = useState({});
  const [employeeTable, setEmployeeTable] = useState(null);
  const [showSelection, setShowSelection] = useState(false);

  // delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // deactivate modal state
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState(null);

  // activate modal state
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [employeeToActivate, setEmployeeToActivate] = useState(null);

  // Get view mode from Zustand UI store (system-wide)
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // header stats query
  const {
    data: headerData,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = useEmployeesHeaderQuery();

  //  reset page when filters change (so filters work on any page)
  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  // pass page + limit to the hook
  const { data, isLoading, refetch } = useTotalEmployeesQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const isAnyLoading = isLoading;
  const hasNoData = !isAnyLoading && (data?.rows?.length ?? 0) === 0;

  const handlePageSizeChange = (value) => {
    const num = Number(value) || 10;
    setPageSize(num);
    setPage(1);
  };

  // row selection handler
  const handleRowSelectionChange = (updaterOrValue) => {
    setRowSelection((prev) => {
      const next =
        typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue || {};

      if (Object.keys(next).length === 0) {
        setShowSelection(false);
      }

      return next;
    });
  };

  // Edit handler that fetches /personal-data/:id
  const handleEdit = async (emp) => {
    try {
      setIsEditLoading(true);
      const personalDataId = emp.id;
      const fullData = await employeesApi.getPersonalData(personalDataId);
      setEditEmployee(fullData);
      setIsDialogOpen(true);
    } catch (err) {
      console.error('Failed to load personal data for edit:', err);
    } finally {
      setIsEditLoading(false);
    }
  };

  // refresh after status change
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
        <div className="flex-1 xl:max-w-6xl">
          <EmployeeFilters filters={filters} onFiltersChange={handleFiltersChange} showStatus />
        </div>

        <EmployeesHeaderActions
          onAdd={() => {
            setEditEmployee(null);
            setIsDialogOpen(true);
          }}
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
          title="لا يوجد موظفون"
          description="ابدأ بإضافة أول موظف"
          action={
            <Button
              onClick={() => {
                setEditEmployee(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              إضافة موظف
            </Button>
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isAnyLoading && (data?.rows?.length ?? 0) === 0
            ? Array.from({ length: 4 }).map((_, idx) => <EmployeeCard key={idx} loading />)
            : (data?.rows ?? []).map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  id={emp.id}
                  image={emp.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
                  name={emp.full_name || '—'}
                  role={emp.position || '—'}
                  employeeId={emp.code || '—'}
                  joinDate={emp.join_date || ''}
                  isActive={!!emp.is_active}
                  loading={isAnyLoading}
                  onView={() => navigate(`/employees/${emp.id}`)}
                  onEdit={async () => {
                    const personalDataId = emp.id;
                    const fullData = await employeesApi.getPersonalData(personalDataId);
                    setEditEmployee(fullData);
                    setIsDialogOpen(true);
                  }}
                  onDelete={() => {
                    setEmployeeToDelete(emp);
                    setDeleteModalOpen(true);
                  }}
                  onDeactivateClick={() => {
                    setEmployeeToDeactivate(emp);
                    setDeactivateModalOpen(true);
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
          loading={isAnyLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          onTableReady={setEmployeeTable}
          showSelection={showSelection}
          onShowSelectionChange={setShowSelection}
          onEdit={handleEdit}
          onDeactivateRequest={(emp) => {
            setEmployeeToDeactivate(emp);
            setDeactivateModalOpen(true);
          }}
          onActivateRequest={(emp) => {
            setEmployeeToActivate(emp);
            setActivateModalOpen(true);
          }}
          onRefresh={handleRefresh}
        />
      )}

      {!hasNoData && (
        <Pagination
          currentPage={page}
          totalPages={data?.meta?.last_page || 1}
          onPageChange={setPage}
        />
      )}

      {/* shared dialog for add + edit */}
      <EmployeeFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditEmployee(null);
        }}
        employee={editEmployee}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEmployeeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        employee={employeeToDelete}
      />

      {/* Deactivate Confirmation Modal */}
      <DeactivateEmployeeModal
        open={deactivateModalOpen}
        onOpenChange={setDeactivateModalOpen}
        employee={employeeToDeactivate}
        onSuccess={handleRefresh}
      />

      {/* Activate Confirmation Modal */}
      <ActivateEmployeeModal
        open={activateModalOpen}
        onOpenChange={setActivateModalOpen}
        employee={employeeToActivate}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

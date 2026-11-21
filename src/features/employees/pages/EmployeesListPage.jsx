// src/features/employees/pages/EmployeesListPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, List } from 'lucide-react';
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
import { useEmployeesQuery } from '../hooks/useEmployeesQuery';
import EmployeesHeaderActions from '../components/EmployeesHeaderActions';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import useEmployeesHeaderQuery from '../hooks/useEmployeesHeaderQuery.js';

import { employeesApi } from '../api/employees.api';

export default function EmployeesListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromApplicantId = searchParams.get('fromApplicant');
  const mode = searchParams.get('mode');
  const isHireMode = mode === 'hire' && !!fromApplicantId;

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState(() => {
    const urlFilters = {};
    searchParams.forEach((value, key) => {
      if (
        key !== 'page' &&
        key !== 'fromApplicant' &&
        key !== 'mode' &&
        key !== 'step' &&
        value !== 'all' &&
        value !== ''
      ) {
        urlFilters[key] = value;
      }
    });
    return urlFilters;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

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

  // Get view mode from Zustand UI store (system-wide)
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // auto-open dialog in hire mode
  useEffect(() => {
    if (isHireMode) {
      setEditEmployee(null);
      setIsDialogOpen(true);
    }
  }, [isHireMode]);

  // header stats query
  const {
    data: headerData,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = useEmployeesHeaderQuery();

  // reset page when filters change
  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  // pass page + limit to the hook
  const { data, isLoading, refetch } = useEmployeesQuery({
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

  // edit handler
  const handleEdit = async (emp) => {
    try {
      const personalDataId = emp.id;
      const fullData = await employeesApi.getPersonalData(personalDataId);
      setEditEmployee(fullData);
      setIsDialogOpen(true);
    } catch (err) {
      console.error('Failed to load personal data for edit:', err);
    }
  };

  return (
    <div className="space-y-6">
      {isHeaderError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load employees summary.
        </div>
      ) : (
        <EmployeeStats data={headerData} isLoading={isHeaderLoading} />
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-6xl">
          <EmployeeFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        <div className="shrink-0">
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="shrink-0">
          <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
        </div>

        <div className="flex shrink-0 gap-2">
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
          onRefresh={refetch}
        />
      )}

      {!hasNoData && (
        <Pagination
          currentPage={page}
          totalPages={data?.meta?.last_page || 1}
          onPageChange={setPage}
        />
      )}

      <EmployeeFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);

          if (!open) {
            setEditEmployee(null);

            // optional: clean hire query params after closing modal
            if (isHireMode) {
              navigate('/employees', { replace: true });
            }
          }
        }}
        employee={editEmployee}
      />

      <DeleteEmployeeModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        employee={employeeToDelete}
      />

      <DeactivateEmployeeModal
        open={deactivateModalOpen}
        onOpenChange={setDeactivateModalOpen}
        employee={employeeToDeactivate}
        onSuccess={refetch}
      />
    </div>
  );
}
// src/features/internships/pages/InternshipsListPage.jsx
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useUIStore } from '@/stores/useUIStore';

import InternshipStats from '../components/InternshipStats';
import InternshipFilters from '../components/InternshipFilters';
import { InternshipCard } from '../components/InternshipCard';
import { InternshipTable } from '../components/InternshipTable';
import InternshipsHeaderActions from '../components/InternshipsHeaderActions';
import EmployeeFormDialog from '../../employees/components/EmployeeFormDialog';
import DeleteInternshipModal from '../components/DeleteInternshipModal';
import { useInternshipsQuery } from '../hooks/useInternshipsQuery';
import useInternshipsHeaderQuery from '../hooks/useInternshipsHeaderQuery.js';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';

// NEW: use API to fetch employee personal data before opening dialog
import { employeesApi } from '../../employees/api/employees.api';

export default function InternshipsListPage() {
  const [searchParams] = useSearchParams();

  // ✅ keep URL params behavior (but we won't render filters UI)
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
  const [editInternship, setEditInternship] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // selection + table instance
  const [rowSelection, setRowSelection] = useState({});
  const [internshipTable, setInternshipTable] = useState(null);
  const [showSelection, setShowSelection] = useState(false);

  // delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState(null);

  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get view mode from Zustand UI store (system-wide)
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // header stats query
  const {
    data: headerData,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
  } = useInternshipsHeaderQuery();

  // reset page when filters change (so filters work on any page)
  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  // pass page + limit to the hook
  const { data, isLoading, refetch } = useInternshipsQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const isAnyLoading = isLoading;
  const hasNoData = !isAnyLoading && (data?.data?.length ?? 0) === 0;

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

  // ✅ Edit handler that fetches employee personal data (same as Employees page)
  const handleEdit = async (internship) => {
    try {
      const fullData = await employeesApi.getPersonalData(internship.id);
      setEditInternship(fullData);
      setIsDialogOpen(true);
    } catch (err) {
      console.error('Failed to load personal data for edit:', err);
    }
  };

  const handleDelete = (internship) => {
    setInternshipToDelete(internship);
    setDeleteModalOpen(true);
  };

  const handleView = (id) => {
    navigate(`/internships/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {isHeaderError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('internships.failedToLoadSummary')}
        </div>
      ) : (
        <InternshipStats data={headerData} isLoading={isHeaderLoading} />
      )}

      {/* ✅ same layout as Employees page WITH filters */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-5xl">
          <InternshipFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        <InternshipsHeaderActions
          onAdd={() => {
            setEditInternship(null);
            setIsDialogOpen(true);
          }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          table={internshipTable}
          showSelection={showSelection}
          onEnableSelection={() => setShowSelection(true)}
          allRows={data?.data ?? []}
        />
      </div>

      {/* page size + view toggle */}
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
          title="لا يوجد تدريب"
          description="لا توجد تدريبات متاحة في الوقت الحالي."
        />
      ) : viewMode === 'cards' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isAnyLoading && (data?.data?.length ?? 0) === 0
            ? Array.from({ length: 4 }).map((_, idx) => <InternshipCard key={idx} loading />)
            : (data?.data ?? []).map((internship) => (
                <InternshipCard
                  key={internship.id}
                  id={internship.id}
                  image={internship.image}
                  name={internship.full_name}
                  role={internship.position}
                  code={internship.code}
                  joinDate={internship.join_date}
                  department={internship.department}
                  shift={internship.shift}
                  phone={internship.phone}
                  loading={isAnyLoading}
                  internship={internship}
                  onView={() => handleView(internship.id)}
                  onEdit={() => handleEdit(internship)}
                  onDelete={() => handleDelete(internship)}
                />
              ))}
        </div>
      ) : (
        <InternshipTable
          data={data?.data ?? []}
          loading={isAnyLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          onTableReady={setInternshipTable}
          showSelection={showSelection}
          _onShowSelectionChange={setShowSelection}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onRefresh={refetch}
        />
      )}

      {/* pagination */}
      {!hasNoData && (
        <Pagination
          currentPage={page}
          totalPages={data?.meta?.last_page || 1}
          onPageChange={setPage}
        />
      )}

      {/* Employee Form Dialog for editing internships */}
      <EmployeeFormDialog
        open={isDialogOpen}
        onOpenChange={(v) => {
          setIsDialogOpen(v);
          if (!v) setEditInternship(null);
        }}
        employee={editInternship}
      />

      {/* Delete Confirmation Modal */}
      <DeleteInternshipModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        internship={internshipToDelete}
        onRefresh={refetch}
      />
    </div>
  );
}

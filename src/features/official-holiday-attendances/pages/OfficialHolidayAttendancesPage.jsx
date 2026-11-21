import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import TotalHolidaysFilters from '@/components/ui/TotalHolidaysFilters';
import { useAuthStore } from '@/services/auth/auth.store';

import OfficialHolidayAttendanceModal from '../components/OfficialHolidayAttendanceModal';
import OfficialHolidayAttendancesTable from '../components/OfficialHolidayAttendancesTable';
import {
  getEmployeeDepartmentId,
  getEmployeeSearchText,
  toDateOnly,
  unwrapOfficialHolidayAttendances,
} from '../components/officialHolidayAttendanceUtils';
import { useOfficialHolidayAttendancesQuery } from '../hooks/useOfficialHolidayAttendances';

export default function OfficialHolidayAttendancesPage() {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language?.startsWith('ar');
  const { user } = useAuthStore();

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);

  const { data: response, isLoading } = useOfficialHolidayAttendancesQuery();

  const allRows = useMemo(() => unwrapOfficialHolidayAttendances(response), [response]);

  const filteredRows = useMemo(() => {
    const keyword = String(filters.keyword || '').trim().toLowerCase();
    const department = String(filters.department || '').trim();
    const from = toDateOnly(filters.from);
    const to = toDateOnly(filters.to);

    return allRows.filter((row) => {
      const employees = Array.isArray(row?.employees) ? row.employees : [];

      if (keyword) {
        const searchText = [
          row?.id,
          row?.notes,
          ...employees.map(getEmployeeSearchText),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchText.includes(keyword)) return false;
      }

      if (department && department !== 'all') {
        const hasDepartment = employees.some(
          (employee) => String(getEmployeeDepartmentId(employee) ?? '') === department
        );

        if (!hasDepartment) return false;
      }

      const rowStart = toDateOnly(row?.start_date);
      const rowEnd = toDateOnly(row?.end_date);

      if (from && rowEnd && rowEnd < from) return false;
      if (to && rowStart && rowStart > to) return false;

      return true;
    });
  }, [allRows, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, pageSize, safePage]);

  const hasNoData = !isLoading && filteredRows.length === 0;

  const handlePageSizeChange = (num) => {
    setPageSize(Number(num) || 10);
    setPage(1);
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  const handleAdd = () => {
    setEditingAttendance(null);
    setIsModalOpen(true);
  };

  const handleEdit = (attendance) => {
    setEditingAttendance(attendance);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('navigation.officialHolidayAttendance')}
        </h1>

        <Button onClick={handleAdd} className="w-auto">
          <Plus className="size-4" />
          {t('officialHolidayAttendance.add')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <TotalHolidaysFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          searchPlaceholder={t('officialHolidayAttendance.filters.search')}
          departmentKey="department"
          fromKey="from"
          toKey="to"
          getDepartmentLabel={(departmentItem) =>
            preferArabic
              ? departmentItem?.name_ar || departmentItem?.name_en || departmentItem?.name
              : departmentItem?.name_en || departmentItem?.name_ar || departmentItem?.name
          }
        />
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('officialHolidayAttendance.emptyTitle')}
          description={t('officialHolidayAttendance.emptyDesc')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              {t('officialHolidayAttendance.add')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>

          <OfficialHolidayAttendancesTable
            data={rows}
            loading={isLoading}
            onEdit={handleEdit}
          />

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <OfficialHolidayAttendanceModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingAttendance(null);
        }}
        attendance={editingAttendance}
        companyId={Number(user?.company_id) || 1}
      />
    </div>
  );
}

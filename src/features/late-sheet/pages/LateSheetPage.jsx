import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/error/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useBreadcrumbStore } from '@/stores/useBreadcrumbStore';
import LateSheetFilters from '../components/LateSheetFilters';
import { MonthNavigation } from '@/features/fingerprintIssues/components/MonthNavigation.jsx';
import LateModal from '../components/LateModal';
import { lateSheetApi } from '../api/lateSheet.api';
import { formatMinutesDurationLong } from '@/utils/durationLabels';

export default function DeductionSheetPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const setBreadcrumbName = useBreadcrumbStore((state) => state.setName);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    company: searchParams.get('company') || 'all',
    branch: searchParams.get('branch') || 'all',
    department: searchParams.get('department') || 'all',
    position: searchParams.get('position') || 'all',
    shift: searchParams.get('shift') || 'all',
    from: searchParams.get('from') || null,
    to: searchParams.get('to') || null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const { month, year, date } = useMemo(() => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    if (monthParam && yearParam) {
      const d = new Date(Number(yearParam), Number(monthParam) - 1, 1);

      return {
        month: Number(monthParam),
        year: Number(yearParam),
        date: d,
      };
    }

    const d = new Date();

    return {
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      date: d,
    };
  }, [searchParams]);

  useEffect(() => {
    setBreadcrumbName('deduction-sheet', t('lateSheet.breadcrumb'));
  }, [setBreadcrumbName, t]);

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);

    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.delete('page');

    setSearchParams(params);
  };

  const handleFilterChange = useCallback(
    (key, value) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));

      const params = new URLSearchParams(searchParams);

      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      params.delete('page');
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleReset = useCallback(() => {
    setFilters({
      search: '',
      company: 'all',
      branch: 'all',
      department: 'all',
      position: 'all',
      shift: 'all',
      from: null,
      to: null,
    });

    const params = new URLSearchParams(searchParams);

    [
      'search',
      'company',
      'branch',
      'department',
      'position',
      'shift',
      'from',
      'to',
      'page',
    ].forEach((key) => params.delete(key));

    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handlePageSizeChange = (value) => {
    const params = new URLSearchParams(searchParams);

    params.set('pageSize', value);
    params.delete('page');

    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);

    params.set('page', String(page));

    setSearchParams(params);
  };

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      'deduction-sheet',
      year,
      month,
      filters.search,
      filters.branch,
      filters.department,
      filters.position,
      filters.from,
      filters.to,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      const monthString = `${year}-${String(month).padStart(2, '0')}`;

      return await lateSheetApi.getDeductionMinutesSummary({
        month: monthString,
        keyword: filters.search || '',
        from: filters.from,
        to: filters.to,
        department: filters.department !== 'all' ? filters.department : '',
        branch: filters.branch !== 'all' ? filters.branch : '',
        position: filters.position !== 'all' ? filters.position : '',
        page: currentPage,
        perPage: pageSize,
      });
    },
    keepPreviousData: true,
  });

  const rows = data?.data || [];
  const pagination = data?.meta || {};

  const lastPage = Number(pagination.last_page || 1);
  const total = Number(pagination.total || rows.length);

  return (
    <div className="space-y-8">
      <MonthNavigation
        date={date}
        onDateChange={handleDateChange}
        className="mb-8"
      />

      <LateSheetFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-500">
          {t('lateSheet.showEntries')}
        </span>

        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-9 w-16 rounded-lg border-slate-200 bg-white text-sm shadow-none">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>


      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="h-14 px-5 text-xs font-bold text-slate-900">
                {t('lateSheet.columns.id')}
              </TableHead>

              <TableHead className="h-14 px-5 text-xs font-bold text-slate-900">
                {t('lateSheet.columns.employee')}
              </TableHead>

              <TableHead className="h-14 px-5 text-xs font-bold text-slate-900">
                {t('lateSheet.columns.department')}
              </TableHead>

              <TableHead className="h-14 px-5 text-xs font-bold text-slate-900">
                {t('lateSheet.columns.position')}
              </TableHead>

              <TableHead className="h-14 px-5 text-xs font-bold text-slate-900">
                {t('lateSheet.columns.deduction')}
              </TableHead>

              <TableHead className="h-14 px-5 text-right text-xs font-bold text-slate-900">
                {t('lateSheet.columns.action')}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <TableCell key={cellIndex} className="h-16 px-5">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row, index) => (
                <TableRow
                  key={`${row.employee_id || row.employee_code}-${index}`}
                  className="cursor-pointer border-slate-100 hover:bg-slate-50"
                  onClick={() =>
                    handleRowClick({
                      id: row.employee_id,
                      name: row.employee_name,
                    })
                  }
                >
                  <TableCell className="h-16 px-5 text-xs font-semibold text-slate-900">
                    {row.employee_code}
                  </TableCell>

                  <TableCell className="h-16 px-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-slate-200 text-xs">
                          {row.employee_name
                            ?.split(' ')
                            ?.map((name) => name[0])
                            ?.join('')
                            ?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-xs font-semibold text-slate-900">
                        {row.employee_name || '__'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="h-16 px-5 text-xs font-semibold text-slate-900">
                    {row.employee_department || '__'}
                  </TableCell>

                  <TableCell className="h-16 px-5 text-xs font-semibold text-slate-900">
                    {row.employee_position || '__'}
                  </TableCell>

                  <TableCell className="h-16 px-5 text-xs font-semibold text-slate-900">
                    {formatMinutesDurationLong(t, row.total_deduction_minutes)}
                  </TableCell>

                  <TableCell className="h-16 px-5 text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-slate-200 bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick({
                          id: row.employee_id,
                          name: row.employee_name,
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12">
                  <EmptyState
                    title={t('lateSheet.noData.title')}
                    description={t('lateSheet.noData.description')}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length > 0 && lastPage > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={lastPage}
          onPageChange={handlePageChange}
        />
      )}

      <LateModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        employeeId={selectedEmployee?.id}
        month={`${year}-${String(month).padStart(2, '0')}`}
      />
    </div>
  );
}
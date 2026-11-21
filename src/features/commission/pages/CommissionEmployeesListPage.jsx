import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { MonthNavigation } from '../../fingerprintIssues/components/MonthNavigation';
import CommissionEmployeeCard from '../components/CommissionEmployeeCard';
import CommissionEmployeesFilters from '../components/CommissionEmployeesFilters';

import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/error/EmptyState';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import ResetCommissionDialog from '../components/ResetCommissionDialog';

import { useCommissionEmployeesListQuery } from '../hooks/useCommissionEmployeesListQuery';
import { useResetEmployeeCommission } from '../hooks/useResetEmployeeCommission';

export default function CommissionEmployeesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // confirm reset dialog state
  const [confirmResetEmp, setConfirmResetEmp] = useState(null);
  const resetCommission = useResetEmployeeCommission();

  // month/year from url (same pattern)
  const getCurrentMonthYear = () => {
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    const dateParam = searchParams.get('date');

    if (monthParam && yearParam) {
      const m = Number(monthParam);
      const y = Number(yearParam);
      const d = new Date(y, m - 1, 1);
      return { month: m, year: y, date: d, monthString: `${y}-${String(m).padStart(2, '0')}-01` };
    }

    const d = dateParam ? new Date(dateParam) : new Date();
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    return { month: m, year: y, date: d, monthString: `${y}-${String(m).padStart(2, '0')}-01` };
  };

  const { month, year, date, monthString } = getCurrentMonthYear();

  // pagination
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);

  // ONE source of truth (like Employees page)
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get('limit')) || 12);

  // filters (backend params: department, keyword)
  const [filters, setFilters] = useState(() => ({
    department: searchParams.get('department') || 'all',
    keyword: searchParams.get('keyword') || '',
  }));

  // sync URL
  useEffect(() => {
    const params = new URLSearchParams();

    params.set('month', String(month));
    params.set('year', String(year));
    params.delete('date');

    if (page > 1) params.set('page', String(page));
    if (pageSize !== 12) params.set('limit', String(pageSize)); // backend expects limit

    if (filters.keyword) params.set('keyword', filters.keyword);

    // IMPORTANT: when "all" don't send department at all (backend returns ALL)
    if (filters.department && filters.department !== 'all') {
      params.set('department', String(filters.department));
    } else {
      params.delete('department');
    }

    setSearchParams(params);
  }, [month, year, page, pageSize, filters, setSearchParams]);

  const handleDateChange = (newDate) => {
    const params = new URLSearchParams(searchParams);
    params.set('month', String(newDate.getMonth() + 1));
    params.set('year', String(newDate.getFullYear()));
    params.delete('date');
    params.delete('page');
    setSearchParams(params);
    setPage(1);
  };

  // show entries handler (like Employees page)
  const handlePageSizeChange = (value) => {
    const num = Number(value) || 12;
    setPageSize(num);
    setPage(1);
  };

  // query params exactly like backend expects
  const queryParams = useMemo(
    () => ({
      month: monthString,
      page,
      limit: pageSize,

      ...(filters.department !== 'all' ? { department: filters.department } : {}),
      ...(filters.keyword ? { keyword: filters.keyword } : {}),
      ...(filters.position !== 'all' ? { position: filters.position } : {}),
      ...(filters.shift !== 'all' ? { shift: filters.shift } : {}),
      ...(filters.branch !== 'all' ? { branch: filters.branch } : {}),
    }),
    [monthString, page, pageSize, filters]
  );

  const { data, isLoading, isFetching } = useCommissionEmployeesListQuery(queryParams, true);

  const rows = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, limit: pageSize };
  const totalPages = meta?.limit ? Math.ceil((meta?.total || 0) / meta.limit) : 1;

  const isBusy = isLoading || isFetching;
  const hasNoData = !isBusy && rows.length === 0;

  return (
    <div className="space-y-6">
      <MonthNavigation date={date} onDateChange={handleDateChange} />

      <div>
        <h2 className="text-lg font-semibold">{t('commission.companySetup')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('commission.selectEmployee', { month, year })}
        </p>
      </div>

      {/* Filters */}
      <CommissionEmployeesFilters
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next || { department: 'all', keyword: '' });
          setPage(1);
        }}
      />

      {/* Show entries */}
      <div className="flex items-center justify-between">
        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} options={[10, 12, 20, 50]} />
      </div>

      {/* Content area */}
      {isBusy ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <CommissionEmployeeCard key={idx} loading />
          ))}
        </div>
      ) : hasNoData ? (
        <div className="rounded-xl border p-6">
          <EmptyState title="لا يوجد موظفون" description="ابدأ بإضافة أول موظف" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((emp) => (
            <CommissionEmployeeCard
              key={emp.employee_id}
              employee={emp}
              monthString={monthString}
              onOpen={() => {
                const qs = new URLSearchParams();
                qs.set('year', String(year));
                qs.set('month', String(month));

                // carry department ONLY if selected (otherwise keep it empty => ALL)
                if (filters.department && filters.department !== 'all') {
                  qs.set('department', String(filters.department));
                }

                // ✅ pass base_amount if available (so preview can auto-run)
                const base =
                  emp.base_amount ??
                  emp.baseAmount ??
                  emp?.commission?.base_amount ??
                  '';

                if (base !== '' && base != null) qs.set('base_amount', String(base));

                // ✅ mark as preview navigation
                qs.set('preview', '1');

                navigate(`/commission-performance/${emp.employee_id}?${qs.toString()}`, {
                  state: { employee: emp }, // includes commission_percentage from backend
                });
              }}
              onReset={() => setConfirmResetEmp(emp)}
            />
          ))}
        </div>
      )}

      <ResetCommissionDialog
        open={!!confirmResetEmp}
        onOpenChange={(open) => !open && setConfirmResetEmp(null)}
        isProcessing={resetCommission.isPending}
        onConfirm={async () => {
          if (!confirmResetEmp) return;

          const identifier =
            confirmResetEmp.id ??
            confirmResetEmp.employee_id ??
            confirmResetEmp?.employee?.id ??
            confirmResetEmp?.user_id ??
            confirmResetEmp?.employeeId;

          resetCommission.mutate({
            employeeId: String(identifier),
            month: monthString,
          });

          setConfirmResetEmp(null);
        }}
      />

      {/* Pagination */}
      {!hasNoData && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

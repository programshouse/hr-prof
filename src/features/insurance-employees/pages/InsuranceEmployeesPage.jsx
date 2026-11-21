import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { EmptyState } from '@/components/feedback/EmptyState';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import {
  exportToExcel,
  exportToPdf,
  printTable,
} from '@/lib/export/tableExport.js';

import InsuranceEmployeesFilters from '../components/InsuranceEmployeesFilters';
import InsuranceEmployeesTable from '../components/InsuranceEmployeesTable';
import { useInsuranceEmployeesQuery } from '../hooks/useInsuranceEmployeesQuery';
import { insuranceEmployeesApi } from '../api/insuranceEmployees.api';
import {
  getInsuranceExportColumns,
  mapInsuranceRowsForExport,
} from '../utils/insuranceExport';

function buildQueryParams(filters, page, pageSize) {
  return {
    page,
    per_page: pageSize,
    keyword: filters.keyword || undefined,
    payroll_policy_id:
      filters.payroll_policy_id || undefined,
    position_id: filters.position_id || undefined,
    level: filters.level || undefined,
    employment_type:
      filters.employment_type || undefined,
    shift_id: filters.shift_id || undefined,
    department_id:
      filters.department_id || undefined,
    branch_id: filters.branch_id || undefined,
  };
}

function buildTotalExportRow(totalInsuranceAmount, t) {
  return {
    id: 'total-insurance',
    code: '',
    name: t('insuranceEmployees.totalInsurance', {
      defaultValue: 'Total Insurance Amount',
    }),
    base_salary: '',
    insurance_percentage: '',
    insurance_amount:
      Number(totalInsuranceAmount) || 0,
    payroll_policy_id: '',
    company_insurance_percent: '',
    company_insurance_amount: '',
  };
}

export default function InsuranceEmployeesPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] =
    useState(false);

  const [filters, setFilters] = useState({
    keyword: '',
    payroll_policy_id: '',
    position_id: '',
    level: '',
    employment_type: '',
    shift_id: '',
    department_id: '',
    branch_id: '',
  });

  const queryParams = useMemo(
    () =>
      buildQueryParams(
        filters,
        page,
        pageSize
      ),
    [filters, page, pageSize]
  );

  const {
    data,
    isLoading,
    isError,
  } = useInsuranceEmployeesQuery(queryParams);

  const rows = data?.rows ?? [];
  const meta = data?.meta ?? {};

  const totalInsuranceAmount =
    Number(data?.totalInsuranceAmount) || 0;

  const totalPages = Math.max(
    1,
    Number(meta.last_page) || 1
  );

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value) || 10);
    setPage(1);
  };

  const fetchRowsForExport = async () => {
    const total =
      Number(meta.total) || rows.length;

    if (!total) {
      toast.error(
        t('insuranceEmployees.export.noData')
      );

      return [];
    }

    setIsExporting(true);

    try {
      const response =
        await insuranceEmployeesApi.getList({
          ...buildQueryParams(
            filters,
            1,
            Math.max(total, pageSize)
          ),
        });

      const exportRows = response?.rows ?? [];

      if (!exportRows.length) {
        toast.error(
          t('insuranceEmployees.export.noData')
        );

        return [];
      }

      const mappedRows =
        mapInsuranceRowsForExport(exportRows);

      const mappedTotalRows =
        mapInsuranceRowsForExport([
          buildTotalExportRow(
            response?.totalInsuranceAmount,
            t
          ),
        ]);

      return [
        ...mappedRows,
        ...mappedTotalRows,
      ];
    } catch {
      toast.error(
        t('insuranceEmployees.export.failed')
      );

      return [];
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    const exportRows =
      await fetchRowsForExport();

    if (!exportRows.length) {
      return;
    }

    exportToPdf({
      rows: exportRows,
      columns:
        getInsuranceExportColumns(t),
      fileName: `insurance-employees-${
        new Date()
          .toISOString()
          .split('T')[0]
      }`,
      title: t(
        'insuranceEmployees.title'
      ),
    });
  };

  const handleExportExcel = async () => {
    const exportRows =
      await fetchRowsForExport();

    if (!exportRows.length) {
      return;
    }

    exportToExcel({
      rows: exportRows,
      columns:
        getInsuranceExportColumns(t),
      fileName: `insurance-employees-${
        new Date()
          .toISOString()
          .split('T')[0]
      }`,
      title: t(
        'insuranceEmployees.title'
      ),
    });
  };

  const handleExportPrint = async () => {
    const exportRows =
      await fetchRowsForExport();

    if (!exportRows.length) {
      return;
    }

    printTable({
      rows: exportRows,
      columns:
        getInsuranceExportColumns(t),
      title: t(
        'insuranceEmployees.title'
      ),
    });
  };

  const hasNoData =
    !isLoading && rows.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-6xl">
          <InsuranceEmployeesFilters
            filters={filters}
            onFiltersChange={
              handleFiltersChange
            }
          />
        </div>

        <div className="shrink-0">
          <ExportDialog
            onPdf={handleExportPdf}
            onExcel={handleExportExcel}
            onPrintTable={
              handleExportPrint
            }
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-md px-4 text-xs font-semibold shadow-xs"
                disabled={isExporting}
              >
                <Download className="me-1.5 size-4" />

                {isExporting
                  ? t(
                      'insuranceEmployees.export.exporting'
                    )
                  : t(
                      'insuranceEmployees.export.button'
                    )}
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageSizeSelect
          value={pageSize}
          onChange={
            handlePageSizeChange
          }
        />
      </div>

      {isError ? (
        <EmptyState
          title={t(
            'insuranceEmployees.errorTitle'
          )}
          description={t(
            'insuranceEmployees.errorDescription'
          )}
        />
      ) : hasNoData ? (
        <EmptyState
          title={t(
            'insuranceEmployees.emptyTitle'
          )}
          description={t(
            'insuranceEmployees.emptyDescription'
          )}
        />
      ) : (
        <InsuranceEmployeesTable
          data={rows}
          loading={isLoading}
          totalInsuranceAmount={
            totalInsuranceAmount
          }
        />
      )}

      {!hasNoData && !isError ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
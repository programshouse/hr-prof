import { useState, useEffect } from 'react';
import {
  useSearchParams,
  useNavigate,
} from 'react-router-dom';
import {
  useQueryClient,
  useQuery,
} from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import ExportDialog from '@/components/ui/exportDialog.jsx';

import {
  exportToExcel,
  exportToPdf,
  printTable,
} from '@/lib/export/tableExport.js';

import { toast } from 'sonner';

import SalariesSummaryCards from '../components/SalariesSummaryCards';
import SalariesFilters from '../components/SalariesFilters';
import SalariesTable from '../components/SalariesTable';

import { salariesApi } from '../api/salariesApi';

import MonthLockButton from '../components/MonthLockButton';
import MonthPublishButton from '../components/MonthPublishButton';

// Export columns for full salary table
const getSalaryExportColumns = (t) => [
  {
    key: 'id',
    label: t('salaries.exportColumns.id'),
  },
  {
    key: 'name',
    label: t('salaries.exportColumns.name'),
  },
  {
    key: 'position',
    label: t('salaries.exportColumns.position'),
  },
  {
    key: 'type',
    label: t('salaries.exportColumns.type'),
  },
  {
    key: 'net_salary',
    label: t('salaries.exportColumns.netSalary'),
  },
  {
    key: 'programs',
    label: t('salaries.exportColumns.programs'),
  },
  {
    key: 'marketing',
    label: t('salaries.exportColumns.marketing'),
  },
  {
    key: 'research',
    label: t('salaries.exportColumns.research'),
  },
  {
    key: 'print',
    label: t('salaries.exportColumns.print'),
  },
  {
    key: 'kpi',
    label: t('salaries.exportColumns.kpi'),
  },
  {
    key: 'rewards',
    label: t('salaries.exportColumns.rewards'),
  },
  {
    key: 'penalties',
    label: t('salaries.exportColumns.penalties'),
  },
  {
    key: 'total_salary',
    label: t('salaries.exportColumns.totalSalary'),
  },
];

export default function SalariesPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [searchParams, setSearchParams] =
    useSearchParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getCurrentMonthYear = () => {
    const monthParam =
      searchParams.get('month');

    const yearParam =
      searchParams.get('year');

    const dateParam =
      searchParams.get('date');

    if (monthParam && yearParam) {
      const m = Number(monthParam);
      const y = Number(yearParam);

      const d = new Date(
        y,
        m - 1,
        1
      );

      return {
        month: m,
        year: y,
        date: d,
      };
    }

    const d = dateParam
      ? new Date(dateParam)
      : new Date();

    return {
      month:
        d.getMonth() + 1,
      year:
        d.getFullYear(),
      date: d,
    };
  };

  const {
    month,
    year,
    date,
  } = getCurrentMonthYear();

  /**
   * Company
   */
  const companyId =
    Number(
      searchParams.get(
        'company_id'
      )
    ) || 1;

  const [
    currentPage,
    setCurrentPage,
  ] = useState(
    () =>
      Number(
        searchParams.get(
          'page'
        )
      ) || 1
  );

  const [
    pageSize,
    setPageSize,
  ] = useState(
    () =>
      Number(
        searchParams.get(
          'pageSize'
        )
      ) || 20
  );

  const [
    hideColumns,
    setHideColumns,
  ] = useState(true);

  const [
    showSelection,
    setShowSelection,
  ] = useState(false);

  const [
    salariesTable,
    setSalariesTable,
  ] = useState(null);

  const [
    rowSelection,
    setRowSelection,
  ] = useState({});

  const [
    filters,
    setFilters,
  ] = useState(() => ({
    search:
      searchParams.get(
        'search'
      ) || '',

    shift_id:
      searchParams.get(
        'shift_id'
      ) || '',

    position_id:
      searchParams.get(
        'position_id'
      ) || '',

    department_id:
      searchParams.get(
        'department_id'
      ) || '',

    branch_id:
      searchParams.get(
        'branch_id'
      ) || '',
  }));

  /**
   * Filters
   */
  const handleFiltersChange = (
    newFilters
  ) => {
    setFilters(
      newFilters
    );

    setCurrentPage(1);

    setRowSelection({});

    setShowSelection(
      false
    );
  };

  /**
   * Export
   */
  const normalizeSalaryRowsForExport = (
    rows = []
  ) => {
    return rows.map(
      (row) => ({
        ...row,

        penalties:
          row?.penalties ??
          row?.penalties_total ??
          row?.deductions ??
          row?.total_deductions ??
          0,
      })
    );
  };

  const getSalaryRowsToExport = () => {
    const rows =
      salariesData?.data ||
      [];

    if (!rows.length) {
      toast.error(
        t(
          'salaries.messages.noDataToExport'
        )
      );

      return [];
    }

    return normalizeSalaryRowsForExport(
      rows
    );
  };

  const handleSalaryPdf = () => {
    const rows =
      getSalaryRowsToExport();

    if (!rows.length) {
      return;
    }

    exportToPdf({
      rows,

      columns:
        getSalaryExportColumns(
          t
        ),

      fileName:
        `salary-table-${new Date()
          .toISOString()
          .split('T')[0]
        }`,

      title: t(
        'salaries.salariesReport'
      ),
    });
  };

  const handleSalaryExcel = () => {
    const rows =
      getSalaryRowsToExport();

    if (!rows.length) {
      return;
    }

    exportToExcel({
      rows,

      columns:
        getSalaryExportColumns(
          t
        ),

      fileName:
        `salary-table-${new Date()
          .toISOString()
          .split('T')[0]
        }`,
    });
  };

  const handleSalaryPrint = () => {
    const rows =
      getSalaryRowsToExport();

    if (!rows.length) {
      return;
    }

    printTable({
      rows,

      columns:
        getSalaryExportColumns(
          t
        ),

      title: t(
        'salaries.salariesReport'
      ),
    });
  };

  /**
   * Salaries Query
   */
  const {
    data: salariesData,
    isLoading:
    salariesLoading,
  } = useQuery({
    queryKey: [
      'salariesTable',
      year,
      month,
      currentPage,
      pageSize,
      filters,
    ],

    queryFn: () =>
      salariesApi.getSalariesTable(
        {
          year,
          month,
          page:
            currentPage,
          pageSize,
          ...filters,
        }
      ),

    enabled:
      !!year &&
      !!month,
  });

  /**
   * Pagination
   */
  const handlePageChange = (
    page
  ) => {
    setCurrentPage(
      page
    );
  };

  const handlePageSizeChange = (
    value
  ) => {
    const num =
      Number(value) ||
      10;

    setPageSize(num);

    setCurrentPage(1);

    queryClient.invalidateQueries(
      {
        queryKey: [
          'salariesTable',
        ],
      }
    );
  };

  /**
   * Month
   */
  const handleDateChange = (
    newDate
  ) => {
    const params =
      new URLSearchParams(
        searchParams
      );

    params.set(
      'month',
      String(
        newDate.getMonth() +
        1
      )
    );

    params.set(
      'year',
      String(
        newDate.getFullYear()
      )
    );

    params.set(
      'company_id',
      String(companyId)
    );

    params.delete(
      'date'
    );

    params.delete(
      'page'
    );

    setSearchParams(
      params
    );

    setCurrentPage(1);

    setRowSelection({});

    setShowSelection(
      false
    );
  };

  /**
   * Sync state with URL
   */
  useEffect(() => {
    const params =
      new URLSearchParams();

    if (month) {
      params.set(
        'month',
        String(month)
      );
    }

    if (year) {
      params.set(
        'year',
        String(year)
      );
    }

    if (companyId) {
      params.set(
        'company_id',
        String(companyId)
      );
    }

    if (
      currentPage > 1
    ) {
      params.set(
        'page',
        String(
          currentPage
        )
      );
    }

    if (pageSize) {
      params.set(
        'pageSize',
        String(pageSize)
      );
    }

    if (
      filters.search
    ) {
      params.set(
        'search',
        filters.search
      );
    }

    if (
      filters.shift_id
    ) {
      params.set(
        'shift_id',
        String(
          filters.shift_id
        )
      );
    }

    if (
      filters.position_id
    ) {
      params.set(
        'position_id',
        String(
          filters.position_id
        )
      );
    }

    if (
      filters.department_id &&
      filters.department_id !==
      'all'
    ) {
      params.set(
        'department_id',
        String(
          filters.department_id
        )
      );
    }

    if (
      filters.branch_id &&
      filters.branch_id !==
      'all'
    ) {
      params.set(
        'branch_id',
        String(
          filters.branch_id
        )
      );
    }

    setSearchParams(
      params
    );
  }, [
    month,
    year,
    companyId,
    currentPage,
    pageSize,
    filters,
    setSearchParams,
  ]);

  /**
   * Month label
   */
  const formatMonthDisplay = (
    value
  ) => {
    const locale =
      i18n.language.startsWith(
        'ar'
      )
        ? 'ar-EG'
        : 'en-US';

    return value.toLocaleDateString(
      locale,
      {
        month: 'long',
        year: 'numeric',
      }
    );
  };

  /**
   * Prevent future months
   */
  const isCurrentMonth = () => {
    const now =
      new Date();

    return (
      date.getMonth() ===
      now.getMonth() &&
      date.getFullYear() ===
      now.getFullYear()
    );
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Month navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate =
                new Date(
                  date
                );

              newDate.setMonth(
                newDate.getMonth() -
                1
              );

              handleDateChange(
                newDate
              );
            }}
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </Button>

          <Popover>
            <PopoverTrigger
              asChild
            >
              <Button variant="outline">
                <Calendar className="me-1 size-3 sm:size-4" />

                <span>
                  {formatMonthDisplay(
                    date
                  )}
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="w-auto p-0"
              align="center"
            >
              <CalendarComponent
                mode="single"
                selected={
                  date
                }
                onSelect={(
                  newDate
                ) =>
                  newDate &&
                  handleDateChange(
                    newDate
                  )
                }
                initialFocus
                toDate={
                  new Date()
                }
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate =
                new Date(
                  date
                );

              newDate.setMonth(
                newDate.getMonth() +
                1
              );

              handleDateChange(
                newDate
              );
            }}
            disabled={
              isCurrentMonth()
            }
          >
            <ChevronRight className="size-4 sm:size-5" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Lock Month */}
          <MonthLockButton
            year={year}
            month={month}
            date={date}
          />

          {/* Publish Month */}
          <MonthPublishButton
            year={year}
            month={month}
            date={date}
            companyId={
              companyId
            }
            currentDepartmentId={
              filters?.department_id
            }
          />

          {/* Export */}
          <ExportDialog
            title={t(
              'salaries.exportSalaryData'
            )}
            onPdf={
              handleSalaryPdf
            }
            onExcel={
              handleSalaryExcel
            }
            onPrint={
              handleSalaryPrint
            }
          >
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-md px-4 text-xs font-semibold shadow-xs"
            >
              <Download className="me-1.5 h-4 w-4" />

              {t(
                'salaries.export'
              )}
            </Button>
          </ExportDialog>
        </div>
      </div>

      {/* Summary */}
      <SalariesSummaryCards
        year={year}
        month={month}
        departmentId={
          filters?.department_id &&
            filters.department_id !==
            'all'
            ? filters.department_id
            : ''
        }
      />

      {/* Filters */}
      <SalariesFilters
        filters={
          filters
        }
        onFiltersChange={
          handleFiltersChange
        }
        table={
          salariesTable
        }
        showSelection={
          showSelection
        }
        onEnableSelection={() =>
          setShowSelection(
            true
          )
        }
        hideColumns={
          hideColumns
        }
      />

      {/* Salary Table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <PageSizeSelect
            value={
              pageSize
            }
            onChange={
              handlePageSizeChange
            }
            options={[
              10,
              20,
              50,
              100,
              500,
            ]}
          />
        </div>

        <SalariesTable
          data={
            salariesData?.data ||
            []
          }
          loading={
            salariesLoading
          }
          currentPage={
            currentPage
          }
          totalPages={
            salariesData
              ?.pagination
              ?.pages ||
            1
          }
          onPageChange={
            handlePageChange
          }
          onViewDetails={(
            row
          ) => {
            const params =
              new URLSearchParams();

            params.set(
              'year',
              String(year)
            );

            params.set(
              'month',
              String(month)
            );

            params.set(
              'company_id',
              String(
                companyId
              )
            );

            params.set(
              'return_page',
              String(
                currentPage
              )
            );

            params.set(
              'return_pageSize',
              String(
                pageSize
              )
            );

            if (
              filters.search
            ) {
              params.set(
                'search',
                filters.search
              );
            }

            if (
              filters.shift_id &&
              filters.shift_id !==
              'all'
            ) {
              params.set(
                'shift_id',
                String(
                  filters.shift_id
                )
              );
            }

            if (
              filters.position_id &&
              filters.position_id !==
              'all'
            ) {
              params.set(
                'position_id',
                String(
                  filters.position_id
                )
              );
            }

            if (
              filters.department_id &&
              filters.department_id !==
              'all'
            ) {
              params.set(
                'department_id',
                String(
                  filters.department_id
                )
              );
            }

            if (
              filters.branch_id &&
              filters.branch_id !==
              'all'
            ) {
              params.set(
                'branch_id',
                String(
                  filters.branch_id
                )
              );
            }

            navigate(
              `/salaries/${row.id}?${params.toString()}`
            );
          }}
          hide={
            hideColumns
          }
          onHideChange={
            setHideColumns
          }
          onTableReady={
            setSalariesTable
          }
          rowSelection={
            rowSelection
          }
          onRowSelectionChange={
            setRowSelection
          }
          showSelection={
            showSelection
          }
          onShowSelectionChange={
            setShowSelection
          }
          year={year}
          month={month}
        />
      </div>
    </div>
  );
}
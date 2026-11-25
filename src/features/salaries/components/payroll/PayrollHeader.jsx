import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePayrollStore } from '@/stores/usePayrollStore';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { buildAvatarUrl } from '@/lib/utils/avatarUtils';
import ExportDialog from '@/components/ui/exportDialog.jsx';
import SalaryCalculationModal from './SalaryCalculationModal';

function getEmployeeActiveStatus(value) {
  return (
    value === 1 ||
    value === '1' ||
    value === true ||
    value === 'true'
  );
}

function normalizeEmployeeImageUrl(image) {
  if (!image || typeof image !== 'string') {
    return null;
  }

  const trimmedImage = image.trim();

  if (!trimmedImage) {
    return null;
  }

  return trimmedImage
    .replace('/hr/public/assets/', '/hr/assets/')
    .replace('/public/assets/', '/assets/');
}

export function PayrollHeader({
  employee,
  payrollData,
  date,
  formatMonthDisplay,
  onPdf,
  onExcel,
  onPrint,
  onUpdate,
  employeeNav,
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language?.startsWith('ar');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalNavigationOpen = usePayrollStore((state) => state.salaryModalNavigationOpen);
  const setModalNavigationOpen = usePayrollStore((state) => state.setSalaryModalNavigationOpen);

  // Shared state preserves the open salary modal when navigating to a different
  // employee route, including across salary-list page boundaries.
  useEffect(() => {
    if (modalNavigationOpen && payrollData?.employee?.id &&
        String(payrollData.employee.id) === String(employee?.id)) {
      setIsModalOpen(true);
    }
  }, [modalNavigationOpen, payrollData?.employee?.id, employee?.id]);

  const handleModalOpenChange = (nextOpen) => {
    setIsModalOpen(nextOpen);
    if (!nextOpen) setModalNavigationOpen(false);
  };

  const navigateInModal = (direction) => {
    const handler = direction === 'previous' ? employeeNav?.onPrevious : employeeNav?.onNext;
    if (!handler) return;
    setModalNavigationOpen(true);
    handler();
  };

  const iconMargin = isRTL ? 'ml-2' : 'mr-2';
  const isEmployeeActive = getEmployeeActiveStatus(employee?.is_active);

  const employeeName =
    employee?.name ||
    employee?.full_name ||
    employee?.employee_name ||
    '';

  const rawEmployeeImage =
    employee?.image ??
    employee?.avatar ??
    null;

  const employeeImage =
    normalizeEmployeeImageUrl(rawEmployeeImage);

  const avatarUrl = buildAvatarUrl(
    employeeName,
    employeeImage
  );

  const fallbackAvatarUrl = buildAvatarUrl(
    employeeName,
    null
  );

  return (
    <>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Employee Area */}
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              {isRTL ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              {/* Previous Buttons */}
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={employeeNav?.onFirst}
                  disabled={!employeeNav?.canGoPrevious}
                  className="h-10 w-10 shadow-sm"
                >
                  {isRTL ? (
                    <ChevronsRight className="h-4 w-4" />
                  ) : (
                    <ChevronsLeft className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={employeeNav?.onPrevious}
                  disabled={!employeeNav?.canGoPrevious}
                  className="h-10 w-10 shadow-sm"
                >
                  {isRTL ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Employee Card */}
              <div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row">
                <div className="relative shrink-0">
                  <div className="overflow-hidden rounded-full bg-slate-200 ring-4 ring-white">
                    <img
                      src={avatarUrl}
                      alt={employeeName || 'Employee'}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackAvatarUrl;
                      }}
                      className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20"
                    />
                  </div>

                  {/* <span
                    className={`absolute bottom-0 end-0 block size-4 rounded-full border-2 border-white ${
                      isEmployeeActive
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                    aria-hidden="true"
                  /> */}
                </div>

                <div
                  className={`min-w-0 text-center sm:text-start ${
                    isRTL ? 'sm:text-right' : 'sm:text-left'
                  }`}
                >
                  <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="truncate text-lg font-semibold leading-tight text-primary md:max-w-[420px] md:text-2xl">
                      {employee?.code || '—'} - {employeeName || '—'}
                    </h1>

                    {/* <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isEmployeeActive
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                          : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'
                      }`}
                    >
                      <span
                        className={`me-1.5 size-1.5 rounded-full ${
                          isEmployeeActive
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />

                      {isEmployeeActive
                        ? t('employees.stats.inactive', {
                            defaultValue: 'Active',
                          })
                        : t('employees.stats.inactive', {
                            defaultValue: 'Inactive',
                          })}
                    </span> */}
                  </div>

                  <p className="truncate text-sm font-medium text-muted-foreground md:max-w-[420px] md:text-base">
                    {employee?.position || '—'} |{' '}
                    {formatMonthDisplay(date)}
                  </p>
                </div>
              </div>

              {/* Next Buttons */}
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={employeeNav?.onNext}
                  disabled={!employeeNav?.canGoNext}
                  className="h-10 w-10 shadow-sm"
                >
                  {isRTL ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={employeeNav?.onLast}
                  disabled={!employeeNav?.canGoNext}
                  className="h-10 w-10 shadow-sm"
                >
                  {isRTL ? (
                    <ChevronsLeft className="h-4 w-4" />
                  ) : (
                    <ChevronsRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto xl:shrink-0">
            <ExportDialog
              trigger={
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Download className={`${iconMargin} h-4 w-4`} />

                  {t('salaries.payrollHeader.exportReport')}
                </Button>
              }
              onPdf={onPdf}
              onExcel={onExcel}
              onPrintTable={onPrint}
            />

            <Button
              variant="default"
              onClick={() => { setModalNavigationOpen(true); setIsModalOpen(true); }}
              className="w-full sm:w-auto"
            >
              <Eye className={`${iconMargin} h-4 w-4`} />

              {t('salaries.payrollHeader.view')}
            </Button>
          </div>
        </div>
      </div>

      <SalaryCalculationModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        employeeNav={employeeNav ? {
          ...employeeNav,
          onPrevious: () => navigateInModal('previous'),
          onNext: () => navigateInModal('next'),
        } : null}
        data={payrollData}
        onUpdate={onUpdate}
      />
    </>
  );
}
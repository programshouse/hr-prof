import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Pagination({
  table,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === 'ar';

  // Support both client-side (table-based) and server-side (manual) pagination
  const isManualPagination =
    currentPage !== undefined && totalPages !== undefined;

  const page = isManualPagination
    ? currentPage
    : table.getState().pagination.pageIndex + 1;

  const pages = isManualPagination
    ? totalPages
    : table.getPageCount();

  const maxVisible = 8;

  const getPageNumbers = () => {
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pageNumbers = [];

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handlePrevious = () => {
    if (isManualPagination) {
      onPageChange?.(page - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNext = () => {
    if (isManualPagination) {
      onPageChange?.(page + 1);
    } else {
      table.nextPage();
    }
  };

  const handlePageClick = (pageNum) => {
    if (isManualPagination) {
      onPageChange?.(pageNum);
    } else {
      table.setPageIndex(pageNum - 1);
    }
  };

  const handleFirst = () => {
    if (isManualPagination) {
      onPageChange?.(1);
    } else {
      table.setPageIndex(0);
    }
  };

  const handleLast = () => {
    if (isManualPagination) {
      onPageChange?.(pages);
    } else {
      table.setPageIndex(pages - 1);
    }
  };

  const canPrevious = isManualPagination
    ? page > 1
    : table.getCanPreviousPage();

  const canNext = isManualPagination
    ? page < pages
    : table.getCanNextPage();

  return (
    <>
      {pages > 1 && (
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="flex items-center justify-between gap-3"
        >
          {/* First + Previous */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFirst}
              disabled={!canPrevious}
              className="size-8"
              title={
                t?.('pagination.first') ||
                (isArabic ? 'الصفحة الأولى' : 'First page')
              }
            >
              {isArabic ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={!canPrevious}
              className="size-8 sm:h-9 sm:w-auto sm:gap-1 sm:px-3"
            >
              {isArabic ? (
                <>
                  <span className="hidden sm:inline">
                    {t?.('pagination.previous') || 'السابق'}
                  </span>
                  <ChevronRight className="size-4" />
                </>
              ) : (
                <>
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">
                    {t?.('pagination.previous') || 'Previous'}
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Pages */}
          <div className="grid grid-cols-4 items-center gap-1 sm:gap-2 md:flex">
            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={page === pageNum ? 'default' : 'outline'}
                size="icon"
                onClick={() => handlePageClick(pageNum)}
                className="size-7 sm:size-8"
              >
                {pageNum}
              </Button>
            ))}
          </div>

          {/* Next + Last */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={!canNext}
              className="size-8 sm:h-9 sm:w-auto sm:gap-1 sm:px-3"
            >
              {isArabic ? (
                <>
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">
                    {t?.('pagination.next') || 'التالي'}
                  </span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    {t?.('pagination.next') || 'Next'}
                  </span>
                  <ChevronRight className="size-4" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleLast}
              disabled={!canNext}
              className="size-8"
              title={
                t?.('pagination.last') ||
                (isArabic ? 'الصفحة الأخيرة' : 'Last page')
              }
            >
              {isArabic ? (
                <ChevronsLeft className="size-4" />
              ) : (
                <ChevronsRight className="size-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
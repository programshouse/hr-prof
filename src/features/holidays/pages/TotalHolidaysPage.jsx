import { useState } from 'react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import TotalHolidaysTable from '../components/TotalHolidaysTable';
import { useTotalHolidaysQuery } from '../hooks/useTotalHolidaysQuery';
import TotalHolidaysFilters from '../../../components/ui/TotalHolidaysFilters';

export default function TotalHolidaysPage() {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language === 'ar';
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(() => {
    const urlFilters = {};

    searchParams.forEach((value, key) => {
      if (key !== 'page' && value !== 'all' && value !== '') {
        urlFilters[key] = value;
      }
    });

    return urlFilters;
  });

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (num) => {
    setPageSize(num);
    setPage(1);
  };

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  const { data, isLoading } = useTotalHolidaysQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const hasNoData = !isLoading && (data?.rows?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('navigation.totalHolidays')}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <TotalHolidaysFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          getDepartmentLabel={(d) =>
            preferArabic
              ? d?.name_ar || d?.name_en || d?.name
              : d?.name_en || d?.name_ar || d?.name
          }
        />
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('emptyStates.noHolidayDataFound')}
          description={t('emptyStates.noHolidayDataDesc')}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
          </div>

          <TotalHolidaysTable
            data={data?.rows ?? []}
            loading={isLoading}
          />

          <Pagination
            currentPage={page}
            totalPages={data?.meta?.last_page || 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
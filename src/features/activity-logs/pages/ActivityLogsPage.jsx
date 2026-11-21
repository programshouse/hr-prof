import { useState } from 'react';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import ActivityLogsFilters from '../components/ActivityLogsFilters';
import ActivityLogsTable from '../components/ActivityLogsTable';
import ActivityLogDetailsModal from '../components/ActivityLogDetailsModal';
import { useActivityLogsQuery } from '../hooks/useActivityLogsQuery';
import { useTranslation } from 'react-i18next';

export default function ActivityLogsPage() {
  const { t } = useTranslation();

  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useActivityLogsQuery({
    ...filters,
    page,
    limit: pageSize,
  });

  const rows = data?.rows ?? [];
  const hasNoData = !isLoading && rows.length === 0;

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    const size = Number(value) || 10;
    setPageSize(size);
    setPage(1);
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open) => {
    setIsModalOpen(open);
    if (!open) setSelectedLog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-lg">
          <ActivityLogsFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="shrink-0">
          <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
        </div>
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('activityLogs.empty.title')}
          description={t('activityLogs.empty.description')}
        />
      ) : (
        <ActivityLogsTable
          data={rows}
          loading={isLoading}
          onView={handleViewLog} // Pass the handler
        />
      )}

      {!hasNoData && (
        <Pagination
          currentPage={page}
          totalPages={data?.meta?.last_page || 1}
          onPageChange={setPage}
        />
      )}

      {/* Modal */}
      <ActivityLogDetailsModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        log={selectedLog}
      />
    </div>
  );
}
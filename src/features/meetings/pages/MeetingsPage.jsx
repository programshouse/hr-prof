// src/features/meetings/pages/MeetingsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useUIStore } from '@/stores/useUIStore';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { Pagination } from '@/components/ui/Pagination';

import MeetingStatsGrid from '../components/MeetingStatsGrid';
import MeetingsFilters from '../components/MeetingsFilters';
import MeetingsTable from '../components/MeetingsTable';
import MeetingsHeaderActions from '../components/MeetingsHeaderActions';
import MeetingsFullCalendar from '../components/MeetingsFullCalendar';
import AddMeetingModal from '../components/AddMeetingModal';
import ViewMeetingModal from '../components/ViewMeetingModal';
import { DeleteMeetingDialog } from '../components/DeleteMeetingDialog';

import { useMeetingsQuery } from '../hooks/useMeetingsQuery';
import { useCreateMeeting, useUpdateMeeting, useDeleteMeeting } from '../hooks/useMeetingMutations';
import { toast } from 'sonner';

export default function MeetingsPage() {
  const { t } = useTranslation();
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [calendarView, setCalendarView] = useState('timeGridWeek');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);
  const [deletingMeeting, setDeletingMeeting] = useState(null);

  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // ✅ Make meetings page open as table view by default
  useEffect(() => {
    setViewMode('table');
  }, [setViewMode]);

  const queryArgs = useMemo(
    () => ({
      ...filters,
      page,
      limit: pageSize,
    }),
    [filters, page, pageSize]
  );

  const { data, isLoading } = useMeetingsQuery(queryArgs);

  const createMut = useCreateMeeting();
  const updateMut = useUpdateMeeting();
  const deleteMut = useDeleteMeeting();

  const isSaving = createMut.isPending || updateMut.isPending || deleteMut.isPending;

  const hasNoData = !isLoading && (data?.data?.length ?? 0) === 0;

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters || {});
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    const num = Number(value) || 10;
    setPageSize(num);
    setPage(1);
  };

  const handleAdd = () => {
    setEditingMeeting(null);
    setIsModalOpen(true);
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleView = (meeting) => {
    setViewingMeeting(meeting);
  };

  const handleDelete = (meeting) => {
    if (!meeting?.id) return;
    setDeletingMeeting(meeting);
  };

  const handleConfirmDelete = () => {
    if (!deletingMeeting?.id) return;

    deleteMut.mutate(deletingMeeting.id, {
      onSuccess: () => {
        toast.success(t('meetings.notifications.deleted'));
        setDeletingMeeting(null);

        if (viewingMeeting?.id === deletingMeeting.id) {
          setViewingMeeting(null);
        }
      },
    });
  };

  const handleModalSubmit = (payload) => {
    createMut.mutate(payload, {
      onSuccess: () => {
        toast.success(t('meetings.notifications.created'));
        setIsModalOpen(false);
        setEditingMeeting(null);
      },
    });
  };

  const handleModalUpdate = ({ id, payload }) => {
    updateMut.mutate(
      { id, payload },
      {
        onSuccess: () => {
          toast.success(t('meetings.notifications.updated'));
          setIsModalOpen(false);
          setEditingMeeting(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <MeetingStatsGrid filters={filters} />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1 xl:max-w-5xl">
          <MeetingsFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        <MeetingsHeaderActions onAdd={handleAdd} viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <div className="flex items-center justify-between">
        <PageSizeSelect value={pageSize} onChange={handlePageSizeChange} />
      </div>

      {hasNoData ? (
        <EmptyState
          title={t('meetings.empty.title')}
          description={t('meetings.empty.description')}
          action={
            <Button onClick={handleAdd}>
              <Plus className="mr-2 size-4" />
              {t('meetings.addMeetingButton')}
            </Button>
          }
        />
      ) : viewMode === 'calendar' ? (
        <MeetingsFullCalendar
          data={data?.data ?? []}
          calendarView={calendarView}
          onCalendarViewChange={setCalendarView}
          onEventClick={handleView}
          onEventEdit={handleEdit}
          onEventDelete={handleDelete}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="text-center text-gray-500">{t('meetings.cardView.comingSoon')}</div>
        </div>
      ) : (
        <MeetingsTable
          data={data?.data ?? []}
          loading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}

      {!hasNoData && viewMode !== 'calendar' && (
        <Pagination
          currentPage={page}
          totalPages={data?.meta?.last_page || 1}
          onPageChange={setPage}
        />
      )}

      <AddMeetingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleModalSubmit}
        onUpdate={handleModalUpdate}
        loading={isSaving}
        editingMeeting={editingMeeting}
      />

      <ViewMeetingModal
        open={!!viewingMeeting}
        onOpenChange={(open) => !open && setViewingMeeting(null)}
        meeting={viewingMeeting}
      />

      <DeleteMeetingDialog
        open={!!deletingMeeting}
        onOpenChange={(open) => !open && setDeletingMeeting(null)}
        meeting={deletingMeeting}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMut.isPending}
      />
    </div>
  );
}
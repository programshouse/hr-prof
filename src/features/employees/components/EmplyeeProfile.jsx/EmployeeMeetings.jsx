import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Users, Clock, Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axiosClient from '@/services/http/axiosClient';
import AddMeetingModal from '@/features/meetings/components/AddMeetingModal';
import { DeleteMeetingDialog } from '@/features/meetings/components/DeleteMeetingDialog';
import { useCreateMeeting, useUpdateMeeting, useDeleteMeeting } from '@/features/meetings/hooks/useMeetingMutations';
import { toast } from 'sonner';
import { meetingsApi } from '@/features/meetings/api/meetings.api';
import { useAuthStore } from '@/services/auth/auth.store';

function SectionHeader({ icon: Icon, title, isRTL }) {
  return (
    <div className={`mb-4 flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
      <Icon className="h-5 w-5 text-slate-600" />
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    </div>
  );
}

export default function EmployeeMeetings({ employeeId, isLoading }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [deleteMeetingState, setDeleteMeetingState] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();
  const createMeeting = useCreateMeeting();
  const isEmployeePortal = useAuthStore((state) => state.authSource === 'employee-login');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!employeeId) return;

      try {
        setMeetingsLoading(true);
        const response = isEmployeePortal
          ? await meetingsApi.getAll({ employee_id: employeeId, limit: 10000 })
          : await axiosClient.get(`/${employeeId}/meetings`);
        const rows = response?.data?.data ?? response?.data ?? [];
        setMeetings(Array.isArray(rows) ? rows.filter((meeting) => {
          const ids = Array.isArray(meeting?.employees)
            ? meeting.employees.map((item) => String(item?.id ?? item?.employee_id ?? item))
            : [meeting?.employee_id, ...(meeting?.employee_ids || [])].filter(Boolean).map(String);
          return !isEmployeePortal || ids.length === 0 || ids.includes(String(employeeId));
        }) : []);
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
        setMeetings([]);
      } finally {
        setMeetingsLoading(false);
      }
    };

    fetchMeetings();
  }, [employeeId]);

  if (isLoading || meetingsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const handleUpdate = (meeting) => {
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
  };

  const handleUpdateSubmit = async ({ id, payload }) => {
    await updateMeeting.mutateAsync({ id, payload });
    toast.success(t('employees.profile.meetings.toastMessages.updateSuccess'));

    handleModalClose();

    if (employeeId) {
      const response = isEmployeePortal
        ? await meetingsApi.getAll({ employee_id: employeeId, limit: 10000 })
        : await axiosClient.get(`/${employeeId}/meetings`);
      const rows = response?.data?.data ?? response?.data ?? [];
      setMeetings(Array.isArray(rows) ? rows : []);
    }
  };

  const handleDeleteClick = (meeting) => {
    setDeleteMeetingState(meeting);
    setIsDeleteDialogOpen(true);
  };

  const refetchMeetings = async () => {
    if (!employeeId) return;
    try {
      const response = isEmployeePortal
        ? await meetingsApi.getAll({ employee_id: employeeId, limit: 10000 })
        : await axiosClient.get(`/${employeeId}/meetings`);
      const rows = response?.data?.data ?? response?.data ?? [];
      setMeetings(Array.isArray(rows) ? rows : []);
    } catch {
      // silent
    }
  };

  const handleCreateSubmit = async (payload) => {
    try {
      await createMeeting.mutateAsync(payload);
      toast.success(t('employees.profile.meetings.toastMessages.createSuccess', 'Meeting created successfully'));
      setIsAddModalOpen(false);
      refetchMeetings();
    } catch {
      toast.error(t('employees.profile.meetings.toastMessages.createError', 'Failed to create meeting'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteMeetingState) return;

    try {
      await deleteMeeting.mutateAsync(deleteMeetingState.id);
      toast.success(t('employees.profile.meetings.toastMessages.deleteSuccess'));
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== deleteMeetingState.id));
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      toast.error(t('employees.profile.meetings.toastMessages.deleteError'));
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteMeetingState(null);
    }
  };

  const getStatusLabel = (status) => {
    return t(`employees.profile.meetings.statusLabels.${status}`) || status;
  };

  return (
    <Card className="border shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <SectionHeader icon={Calendar} title={t('employees.profile.meetings.title')} isRTL={isRTL} />
          {!isEmployeePortal && (
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              {t('meetings.addMeeting.title', 'Add Meeting')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {meetings.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('employees.profile.meetings.tableHeaders.meetingName')}
                  </TableHead>

                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('employees.profile.meetings.tableHeaders.date')}
                  </TableHead>

                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('employees.profile.meetings.tableHeaders.time')}
                  </TableHead>

                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('employees.profile.meetings.tableHeaders.status')}
                  </TableHead>

                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('employees.profile.meetings.tableHeaders.notes')}
                  </TableHead>

                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>
                    {t('employees.profile.meetings.tableHeaders.attendees')}
                  </TableHead>

                  <TableHead className={isRTL ? 'text-left' : 'text-right'}>
                    {t('employees.profile.meetings.tableHeaders.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                      {meeting.name}
                    </TableCell>

                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div
                        className={`flex items-center gap-1 ${
                          isRTL ? 'justify-start flex-row-reverse' : ''
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        {meeting.date}
                      </div>
                    </TableCell>

                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <div
                        className={`flex items-center gap-1 ${
                          isRTL ? 'justify-start flex-row-reverse' : ''
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        {meeting.from} - {meeting.to}
                      </div>
                    </TableCell>

                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      <Badge
                        className={
                          meeting.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : meeting.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }
                      >
                        {getStatusLabel(meeting.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className={`max-w-xs truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                      {meeting.notes || '-'}
                    </TableCell>

                    <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                      {meeting.employees && meeting.employees.length > 0 ? (
                        <div
                          className={`flex items-center gap-1 ${
                            isRTL ? 'justify-start flex-row-reverse' : ''
                          }`}
                        >
                          <Users className="h-4 w-4" />
                          <span>{meeting.employees.length}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                      <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdate(meeting)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(meeting)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            title={t('employees.profile.meetings.emptyState.title')}
            description={t('employees.profile.meetings.emptyState.description')}
          />
        )}
      </CardContent>

      {/* Add Meeting — HR only */}
      {!isEmployeePortal && (
        <AddMeetingModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSubmit={handleCreateSubmit}
          loading={createMeeting.isPending}
        />
      )}

      {/* Edit Meeting */}
      <AddMeetingModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onUpdate={handleUpdateSubmit}
        loading={updateMeeting.isPending}
        editingMeeting={selectedMeeting}
      />

      <DeleteMeetingDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        meeting={deleteMeetingState}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMeeting.isPending}
      />
    </Card>
  );
}
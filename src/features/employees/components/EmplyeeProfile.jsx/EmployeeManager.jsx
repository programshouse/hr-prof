import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  CreditCard,
  Home,
  Clock,
  GitBranch,
  LogOut,
  Edit,
  Trash2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { employeesApi } from '@/features/employees/api/employees.api';
import { attendanceApi } from '@/features/attendance/api/attendance.api';
import { Pagination } from '@/components/ui/Pagination';
import OverviewTable from '@/features/attendanceOverview/components/OverviewTable';
import { formatDateToLocal } from '@/shared/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/services/auth/auth.store';
import {
  formatRequestTime,
  getRequestStatusColorClass,
  translateRequestStatus,
} from '@/utils/requestLabels';
import { formatMinutesDurationLong } from '@/utils/durationLabels';
import EmployeeTable from '@/features/employees/components/EmployeeTable';
import ManagerTeamKpiSection from '@/features/kpi/components/ManagerTeamKpiSection';
import AddInterviewModal from '@/features/interviews/components/AddInterviewModal';
import EditRequestDialog from './EditRequestDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import PenaltyModal from '@/features/penalties/components/PenaltyModal';
import DeletePenaltyModal from '@/features/penalties/components/DeletePenaltyModal';
import RewardModal from '@/features/rewards/components/RewardModal';
import DeleteRewardModal from '@/features/rewards/components/DeleteRewardModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// =========================
// Charts
// =========================
function TeamMembersChart({ employeeId }) {
  const { data: teamMembersData, isLoading } = useQuery({
    queryKey: ['manager-team-members', employeeId],
    queryFn: () => employeesApi.getManagerTeamMembers(employeeId),
    enabled: !!employeeId,
  });

  const chartData = React.useMemo(() => {
    const members = teamMembersData?.employees || [];

    const deptCounts = members.reduce((acc, member) => {
      const dept = member.department?.name_en || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deptCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [teamMembersData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members Distribution by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
          Chart placeholder
        </div>
      </CardContent>
    </Card>
  );
}

function TeamRequestsChart({ employeeId }) {
  const { data: teamRecordsData, isLoading } = useQuery({
    queryKey: ['team-records-chart', employeeId],
    queryFn: () => employeesApi.getTeamRecords(employeeId),
    enabled: !!employeeId,
  });

  const chartData = React.useMemo(() => {
    const records = teamRecordsData?.data || [];

    const moduleCounts = records.reduce((acc, record) => {
      const module = record.module || 'Unknown';
      acc[module] = (acc[module] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(moduleCounts).map(([module, count]) => ({
      module: module.charAt(0).toUpperCase() + module.slice(1),
      count,
    }));
  }, [teamRecordsData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Requests Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Requests by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
          Chart placeholder
        </div>
      </CardContent>
    </Card>
  );
}

function TeamAttendanceChart({ employeeId }) {
  const { data: teamRecordsData, isLoading } = useQuery({
    queryKey: ['team-records-attendance-chart', employeeId],
    queryFn: () => employeesApi.getTeamRecords(employeeId, 'attendance'),
    enabled: !!employeeId,
  });

  const chartData = React.useMemo(() => {
    const records = teamRecordsData?.data || [];

    const statusCounts = records.reduce((acc, record) => {
      const status = record.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
    }));
  }, [teamRecordsData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Attendance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Attendance by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
          Chart placeholder
        </div>
      </CardContent>
    </Card>
  );
}

// =========================
// Requests helpers
// =========================
function RequestInnerTabButton({ tab, isActive, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(tab.id)}
      className={[
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-all',
        isActive
          ? 'border-primary bg-white text-primary shadow-sm'
          : 'border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white',
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
      <span>{tab.label}</span>
    </button>
  );
}

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const colorClass = getRequestStatusColorClass(status);

  return (
    <span
      className={`inline-flex min-w-[84px] items-center justify-center rounded-md px-3 py-1 text-xs font-medium ${colorClass}`}
    >
      {translateRequestStatus(t, status || 'waiting')}
    </span>
  );
}

function EmployeeCell({ item }) {
  const name =
    item?.employee?.applicant?.first_name && item?.employee?.applicant?.last_name
      ? `${item.employee.applicant.first_name} ${item.employee.applicant.middle_name || ''} ${item.employee.applicant.last_name}`.trim()
      : item?.applicant?.first_name && item?.applicant?.last_name
        ? `${item.applicant.first_name} ${item.applicant.middle_name || ''} ${item.applicant.last_name}`.trim()
        : item?.employee_name ||
          item?.employee?.name ||
          item?.employee?.full_name ||
          item?.name ||
          'Employee';

  const department =
    item?.employee_department ||
    item?.department?.name ||
    item?.employee?.department?.name ||
    item?.job_title ||
    item?.position ||
    '';

  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return 'EM';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const avatar = item?.employee_avatar || item?.employee?.avatar || item?.avatar;

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-medium text-gray-600">
            {getInitials(
              item?.employee?.applicant?.first_name || item?.applicant?.first_name || 'Employee',
              item?.employee?.applicant?.last_name || item?.applicant?.last_name || 'Member'
            )}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{name}</p>
        {department ? <p className="truncate text-xs text-blue-600">{department}</p> : null}
      </div>
    </div>
  );
}

function RequestsTable({ rows = [], columns = [], isLoading = false, emptyText, onEdit, onDelete, t }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 p-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-12 w-full animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
            {columns.map((col) => (
              <TableHead key={col.key} className="h-11 px-4 text-xs font-semibold text-slate-600">
                {col.label}
              </TableHead>
            ))}
            <TableHead className="h-11 px-4 text-xs font-semibold text-slate-600">
              {t('employees.profile.manager.tableHeaders.action')}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length ? (
            rows.map((item, index) => (
              <TableRow
                key={item?.id ?? item?.penalty_id ?? item?.reward_id ?? index}
                className="border-slate-100"
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-4 py-4 text-sm text-slate-900">
                    {col.render ? col.render(item, index) : item?.[col.key] ?? '-'}
                  </TableCell>
                ))}

                <TableCell className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(item)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-primary"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.(item)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="py-10 text-center text-sm text-slate-500">
                {emptyText || 'No requests found.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TeamRequestsSection({
  employeeId,
  page,
  pageSize,
  onPageChange,
  search,
  defaultTab = 'leaves',
}) {
  const { t } = useTranslation();
  const [activeRequestTab, setActiveRequestTab] = useState(defaultTab);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const queryClient = useQueryClient();

  const requestTabs = [
    { id: 'leaves', label: t('employees.profile.manager.requestTabs.leaves'), icon: FileText },
    { id: 'loans', label: t('employees.profile.manager.requestTabs.loans'), icon: CreditCard },
    { id: 'remotely', label: t('employees.profile.manager.requestTabs.remotely'), icon: Home },
    { id: 'overtimes', label: t('employees.profile.manager.requestTabs.overtimes'), icon: Clock },
    { id: 'branch-transfers', label: t('employees.profile.manager.requestTabs.branchTransfers'), icon: GitBranch },
    { id: 'resignations', label: t('employees.profile.manager.requestTabs.resignations'), icon: LogOut },
  ];

  const moduleMapping = useMemo(
    () => ({
      leaves: 'leave',
      loans: 'loan',
      remotely: 'remotely',
      overtimes: 'overtime',
      'branch-transfers': 'branch_transfer',
      resignations: 'resignation',
      rewards: 'reward',
      penalties: 'penalty',
    }),
    []
  );

  const { data: teamRecordsData, isLoading: isTeamRecordsLoading } = useQuery({
    queryKey: ['team-records', employeeId],
    queryFn: () => employeesApi.getTeamRecords(employeeId),
    enabled: !!employeeId,
  });

  const invalidateTeamRecords = async () => {
    await queryClient.invalidateQueries({ queryKey: ['team-records', employeeId] });
  };

  const isPenaltyTab = activeRequestTab === 'penalties';
  const isRewardTab = activeRequestTab === 'rewards';
  const usesCustomRewardPenaltyModal = isPenaltyTab || isRewardTab;

  const updateLeaveMutation = useMutation({
    mutationFn: employeesApi.updateLeaveRequest,
    onSuccess: async () => {
      toast.success('Leave request updated successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update leave request');
      console.error('Update leave error:', error);
    },
  });

  const updateLoanMutation = useMutation({
    mutationFn: employeesApi.updateLoanRequest,
    onSuccess: async () => {
      toast.success('Loan request updated successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update loan request');
      console.error('Update loan error:', error);
    },
  });

  const updateRemotelyMutation = useMutation({
    mutationFn: employeesApi.updateRemotelyRequest,
    onSuccess: async () => {
      toast.success('Remote work request updated successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update remote work request');
      console.error('Update remotely error:', error);
    },
  });

  const updateOvertimeMutation = useMutation({
    mutationFn: employeesApi.updateOvertimeRequest,
    onSuccess: async () => {
      toast.success('Overtime request updated successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update overtime request');
      console.error('Update overtime error:', error);
    },
  });

  const updateBranchTransferMutation = useMutation({
    mutationFn: employeesApi.updateBranchTransferRequest,
    onSuccess: async () => {
      toast.success('Branch transfer request updated successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update branch transfer request');
      console.error('Update branch transfer error:', error);
    },
  });

  const updateResignationMutation = useMutation({
    mutationFn: employeesApi.updateResignationRequest,
    onSuccess: async () => {
      toast.success('Resignation request updated successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update resignation request');
      console.error('Update resignation error:', error);
    },
  });

  const deleteLeaveMutation = useMutation({
    mutationFn: employeesApi.deleteLeaveRequest,
    onSuccess: async () => {
      toast.success('Leave request deleted successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete leave request');
      console.error('Delete leave error:', error);
    },
  });

  const deleteLoanMutation = useMutation({
    mutationFn: employeesApi.deleteLoanRequest,
    onSuccess: async () => {
      toast.success('Loan request deleted successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete loan request');
      console.error('Delete loan error:', error);
    },
  });

  const deleteRemotelyMutation = useMutation({
    mutationFn: employeesApi.deleteRemotelyRequest,
    onSuccess: async () => {
      toast.success('Remote work request deleted successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete remote work request');
      console.error('Delete remotely error:', error);
    },
  });

  const deleteOvertimeMutation = useMutation({
    mutationFn: employeesApi.deleteOvertimeRequest,
    onSuccess: async () => {
      toast.success('Overtime request deleted successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete overtime request');
      console.error('Delete overtime error:', error);
    },
  });

  const deleteBranchTransferMutation = useMutation({
    mutationFn: employeesApi.deleteBranchTransferRequest,
    onSuccess: async () => {
      toast.success('Branch transfer request deleted successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete branch transfer request');
      console.error('Delete branch transfer error:', error);
    },
  });

  const deleteResignationMutation = useMutation({
    mutationFn: employeesApi.deleteResignationRequest,
    onSuccess: async () => {
      toast.success('Resignation request deleted successfully');
      await invalidateTeamRecords();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete resignation request');
      console.error('Delete resignation error:', error);
    },
  });

  const getFilteredData = useCallback(() => {
    if (!teamRecordsData?.data) return [];
    const currentModule = moduleMapping[activeRequestTab];
    return teamRecordsData.data.filter((record) => record.module === currentModule);
  }, [teamRecordsData, activeRequestTab, moduleMapping]);

  const filteredRows = useMemo(() => {
    const rows = getFilteredData();
    const q = search?.trim().toLowerCase() || '';

    if (!q) return rows;

    return rows.filter((item) => {
      const employeeName =
        item?.employee?.applicant?.first_name ||
        item?.employee_name ||
        item?.employee?.name ||
        '';

      const status = item?.status || '';
      const id = String(
        item?.employee?.code || item?.id || item?.penalty_id || item?.reward_id || ''
      );

      return [employeeName, status, id, item?.type, item?.amount, item?.date].some((value) =>
        String(value || '').toLowerCase().includes(q)
      );
    });
  }, [getFilteredData, search]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const handleEdit = (item) => {
    setSelectedRequest(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item) => {
    setRequestToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handlePenaltyEditSuccess = async () => {
    setEditDialogOpen(false);
    setSelectedRequest(null);
    await invalidateTeamRecords();
  };

  const handlePenaltyDeleteSuccess = async () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
    await invalidateTeamRecords();
  };

  const handleRewardEditSuccess = async () => {
    setEditDialogOpen(false);
    setSelectedRequest(null);
    await invalidateTeamRecords();
  };

  const handleRewardDeleteSuccess = async () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
    await invalidateTeamRecords();
  };

  const handleUpdate = async (id, data) => {
    const payload = { id, data };

    switch (activeRequestTab) {
      case 'leaves':
        return await updateLeaveMutation.mutateAsync(payload);
      case 'loans':
        return await updateLoanMutation.mutateAsync(payload);
      case 'remotely':
        return await updateRemotelyMutation.mutateAsync(payload);
      case 'overtimes':
        return await updateOvertimeMutation.mutateAsync(payload);
      case 'branch-transfers':
        return await updateBranchTransferMutation.mutateAsync(payload);
      case 'resignations':
        return await updateResignationMutation.mutateAsync(payload);
      default:
        throw new Error('Unknown or unsupported request type');
    }
  };

  const confirmDelete = () => {
    if (!requestToDelete) return;

    switch (activeRequestTab) {
      case 'leaves':
        deleteLeaveMutation.mutate(requestToDelete.id);
        break;
      case 'loans':
        deleteLoanMutation.mutate(requestToDelete.id);
        break;
      case 'remotely':
        deleteRemotelyMutation.mutate(requestToDelete.id);
        break;
      case 'overtimes':
        deleteOvertimeMutation.mutate(requestToDelete.id);
        break;
      case 'branch-transfers':
        deleteBranchTransferMutation.mutate(requestToDelete.id);
        break;
      case 'resignations':
        deleteResignationMutation.mutate(requestToDelete.id);
        break;
      default:
        toast.error('Unknown or unsupported request type');
        return;
    }

    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  const employeeIdColumn = {
    key: 'code',
    label: t('employees.profile.manager.tableHeaders.employeeId'),
    render: (item) => item?.employee?.code || '-',
  };

  const commonEmployeeColumn = {
    key: 'employee',
    label: t('employees.profile.manager.tableHeaders.employee'),
    render: (item) => <EmployeeCell item={item} />,
  };

  const currentConfig = useMemo(() => {
    const filteredData = getFilteredData();

    switch (activeRequestTab) {
      case 'leaves':
        return {
          title: t('requests.table.titles.leaveRequests'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'date', label: t('employees.profile.manager.tableHeaders.date'), render: (i) => i?.date || '-' },
            { key: 'status', label: t('employees.profile.manager.tableHeaders.status'), render: (i) => <StatusBadge status={i?.status} /> },
          ],
        };

      case 'loans':
        return {
          title: t('requests.table.titles.loanRequests'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'date', label: t('employees.profile.manager.tableHeaders.date'), render: (i) => i?.date || '-' },
            { key: 'amount', label: t('employees.profile.manager.tableHeaders.amount'), render: (i) => i?.amount || '-' },
            { key: 'status', label: t('employees.profile.manager.tableHeaders.status'), render: (i) => <StatusBadge status={i?.status} /> },
          ],
        };

      case 'remotely':
        return {
          title: t('requests.table.titles.remoteWorkRequests'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'from', label: 'From', render: (i) => i?.from || '-' },
            { key: 'to', label: 'To', render: (i) => i?.to || '-' },
            { key: 'status', label: 'Status', render: (i) => <StatusBadge status={i?.status} /> },
          ],
        };

      case 'overtimes':
        return {
          title: t('requests.table.titles.overtimeRequests'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'date', label: t('employees.profile.manager.tableHeaders.date'), render: (i) => i?.date || '-' },
            { key: 'from', label: t('employees.profile.manager.tableHeaders.from'), render: (i) => i?.from || '-' },
            { key: 'to', label: t('employees.profile.manager.tableHeaders.to'), render: (i) => i?.to || '-' },
            { key: 'status', label: t('employees.profile.manager.tableHeaders.status'), render: (i) => <StatusBadge status={i?.status} /> },
          ],
        };

      case 'branch-transfers':
        return {
          title: t('requests.table.titles.branchTransferRequests'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'date', label: 'Date', render: (i) => i?.date || '-' },
            {
              key: 'from_branch',
              label: t('employees.profile.manager.tableHeaders.from'),
              render: (i) => i?.current_branch?.name_en || '-',
            },
            {
              key: 'to_branch',
              label: t('employees.profile.manager.tableHeaders.to'),
              render: (i) => i?.requested_branch?.name_en || '-',
            },
          ],
        };

      case 'resignations':
        return {
          title: t('requests.table.titles.resignationRequests'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'date', label: t('employees.profile.manager.tableHeaders.date'), render: (i) => i?.date || '-' },
            { key: 'reason', label: t('employees.profile.manager.tableHeaders.reason'), render: (i) => i?.reason || '-' },
            { key: 'status', label: t('employees.profile.manager.tableHeaders.status'), render: (i) => <StatusBadge status={i?.status} /> },
          ],
        };

      case 'rewards':
        return {
          title: t('employees.profile.manager.tableHeaders.rewards'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'date', label: t('employees.profile.manager.tableHeaders.date'), render: (i) => i?.date || '-' },
            { key: 'type', label: t('employees.profile.manager.tableHeaders.type'), render: (i) => i?.type || '-' },
            { key: 'amount', label: t('employees.profile.manager.tableHeaders.amount'), render: (i) => i?.amount || '-' },
          ],
        };

      case 'penalties':
        return {
          title: t('employees.profile.manager.tableHeaders.penalties'),
          rows: filteredData,
          columns: [
            employeeIdColumn,
            commonEmployeeColumn,
            { key: 'date', label: t('employees.profile.manager.tableHeaders.date'), render: (i) => i?.date || '-' },
            { key: 'type', label: t('employees.profile.manager.tableHeaders.type'), render: (i) => i?.type || '-' },
            { key: 'amount', label: t('employees.profile.manager.tableHeaders.amount'), render: (i) => i?.amount || '-' },
          ],
        };

      default:
        return { rows: [], columns: [] };
    }
  }, [activeRequestTab, getFilteredData]);

  return (
    <div className="space-y-4">
      {/* Only show inner tabs if not using a specific default tab */}
      {!['rewards', 'penalties'].includes(defaultTab) && (
        <div className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {requestTabs.map((tab) => (
              <RequestInnerTabButton
                key={tab.id}
                tab={tab}
                isActive={activeRequestTab === tab.id}
                onClick={setActiveRequestTab}
              />
            ))}
          </div>
        </div>
      )}

      <RequestsTable
        rows={paginatedRows}
        columns={currentConfig.columns}
        isLoading={isTeamRecordsLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        t={t}
      />

      {usesCustomRewardPenaltyModal ? (
        <>
          {isPenaltyTab && (
            <>
              <PenaltyModal
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                penalty={selectedRequest}
                onSuccess={handlePenaltyEditSuccess}
              />

              <DeletePenaltyModal
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                penalty={requestToDelete}
                onSuccess={handlePenaltyDeleteSuccess}
              />
            </>
          )}

          {isRewardTab && (
            <>
              <RewardModal
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                reward={selectedRequest}
                onSuccess={handleRewardEditSuccess}
              />

              <DeleteRewardModal
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                reward={requestToDelete}
                onSuccess={handleRewardDeleteSuccess}
              />
            </>
          )}
        </>
      ) : (
        <>
          <EditRequestDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            request={selectedRequest}
            requestType={activeRequestTab}
            onUpdate={handleUpdate}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
            isLoading={
              updateLeaveMutation.isPending ||
              updateLoanMutation.isPending ||
              updateRemotelyMutation.isPending ||
              updateOvertimeMutation.isPending ||
              updateBranchTransferMutation.isPending ||
              updateResignationMutation.isPending ||
              deleteLeaveMutation.isPending ||
              deleteLoanMutation.isPending ||
              deleteRemotelyMutation.isPending ||
              deleteOvertimeMutation.isPending ||
              deleteBranchTransferMutation.isPending ||
              deleteResignationMutation.isPending
            }
            itemType={`${activeRequestTab.replace('-', ' ')} request`}
          />
        </>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
}

// =========================
// Attendance
// =========================
function TeamAttendanceSection({ employeeId, dateFilters }) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const fallbackFilters = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      from: formatDateToLocal(startOfMonth),
      to: formatDateToLocal(endOfMonth),
    };
  }, []);

  const filters = useMemo(
    () => ({
      from: dateFilters?.from || fallbackFilters.from,
      to: dateFilters?.to || fallbackFilters.to,
    }),
    [dateFilters?.from, dateFilters?.to, fallbackFilters.from, fallbackFilters.to]
  );

  const { data: monthlyReportData, isLoading: isMonthlyReportLoading } = useQuery({
    queryKey: ['team-attendance-monthly-report', employeeId, filters, currentPage, pageSize],
    queryFn: () =>
      attendanceApi.getTeamAttendance(
        employeeId, // Use employeeId as managerId
        filters.from,
        filters.to,
        filters.from?.slice(0, 7) // month from date
      ),
    enabled: !!employeeId,
  });

  const formatMinutes = (minutes) => formatMinutesDurationLong(t, minutes);

  const getApiRows = (res) => {
    if (!res) return [];
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const getApiMeta = (res) => {
    if (!res) return null;
    if (res?.meta && typeof res.meta === 'object') return res.meta;
    if (
      res?.data &&
      typeof res.data === 'object' &&
      !Array.isArray(res.data) &&
      (res.data.current_page || res.data.last_page || res.data.per_page || res.data.total)
    ) {
      return {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        per_page: res.data.per_page,
        total: res.data.total,
      };
    }
    return null;
  };

  const apiRowsRaw = getApiRows(monthlyReportData);
  const apiMeta = getApiMeta(monthlyReportData);

  const rows = apiRowsRaw.map((item) => {
    const incompleteDays =
      item.late_days ?? item.days_with_incomplete_shifts ?? item.incomplete_days ?? 0;

    const incompleteMinutes =
      item.total_late_minutes ?? item.total_incomplete_shifts ?? item.incomplete_minutes ?? 0;

    const overtimeDays =
      item.overtime_days ?? item.days_with_overtime ?? item.overtime_count ?? 0;

    const overtimeMinutes =
      item.total_overtime ?? item.total_overtime_minutes ?? item.overtime_minutes ?? 0;

    return {
      id: item.employee_code ?? item.employee_id,
      employeeId: item.employee_id,
      name: item.employee_name,
      role: item.employee_position,
      attendanceDays: item.present_days ?? item.attendance_days ?? 0,
      absenceDays: item.absent_days ?? item.absence_days ?? 0,
      incompleteShifts: {
        value: incompleteDays,
        duration: formatMinutes(incompleteMinutes),
      },
      overtimeWorked: {
        value: overtimeDays,
        duration: formatMinutes(overtimeMinutes),
      },
    };
  });

  const fallbackTotal = rows.length;
  const fallbackPerPage = pageSize;
  const fallbackCurrentPage = currentPage;
  const fallbackTotalPages = Math.max(
    1,
    Math.ceil((Number(fallbackTotal) || 0) / (Number(fallbackPerPage) || 1))
  );

  const total = apiMeta?.total ?? fallbackTotal;
  const perPage = apiMeta?.per_page ?? fallbackPerPage;
  const currentPageNum = apiMeta?.current_page ?? fallbackCurrentPage;
  const totalPages = apiMeta?.last_page ?? fallbackTotalPages;
  const isApiPaginated = Boolean(apiMeta?.last_page || apiMeta?.current_page || apiMeta?.per_page);

  const paginatedRows = isApiPaginated
    ? rows
    : rows.slice((currentPageNum - 1) * pageSize, (currentPageNum - 1) * pageSize + pageSize);

  const getMonthFromDateRange = () => {
    if (filters.from) {
      const date = new Date(filters.from);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const month = getMonthFromDateRange();

  const handlePageChange = (nextPage) => {
    const safe = Math.min(Math.max(1, nextPage), totalPages || 1);
    setCurrentPage(safe);
  };

  return (
    <div className="space-y-4">
      <Card>
        <OverviewTable
          rows={paginatedRows}
          isLoading={isMonthlyReportLoading}
          month={month}
          fromDate={filters.from}
          toDate={filters.to}
        />
      </Card>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPageNum}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// =========================
// Main
// =========================
export default function EmployeeManager({ employeeId, isLoading, dateFilters }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role, isManager } = useAuthStore();
  const isEmployeePortalManager = role === 'employee' && isManager;

  // Manager-team endpoints are scoped by the logged-in manager employee id.
  // Example: GET /team-members/196 for employee/manager 196.
  // Do NOT use user.manager_id here; that field is the current employee's
  // own manager, not the id whose direct reports we want to load.
  const loggedInEmployeeId = String(user?.employee_id ?? user?.id ?? employeeId ?? '');
  const managerScopeId = isEmployeePortalManager
    ? loggedInEmployeeId
    : String(employeeId ?? '');
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl = searchParams.get('tab') === 'teams' ? searchParams.get('subtab') : null;
  const [activeSubTab, setActiveSubTab] = useState(subtabFromUrl || 'members');
  const [teamMembers, setTeamMembers] = useState([]);
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduleInterviewModalOpen, setScheduleInterviewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [membersPage, setMembersPage] = useState(1);
  const [membersPageSize] = useState(10);
  const [membersSearch] = useState('');

  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPageSize] = useState(10);
  const [requestsSearch] = useState('');

  const fetchManagerData = useCallback(async () => {
    setLoading(true);
    try {
      const teamData = await employeesApi
        .getManagerTeamMembers(managerScopeId, 1, 1000, membersSearch)
        .catch(() => ({ employees: [], meta: { total: 0, last_page: 1 } }));

      const allEmployees = Array.isArray(teamData?.employees)
        ? teamData.employees
        : Array.isArray(teamData?.data?.employees)
          ? teamData.data.employees
          : Array.isArray(teamData?.data?.data)
            ? teamData.data.data
            : Array.isArray(teamData?.data)
              ? teamData.data
              : Array.isArray(teamData)
                ? teamData
                : [];
      setAllTeamMembers(allEmployees);

      const startIndex = (membersPage - 1) * membersPageSize;
      const endIndex = startIndex + membersPageSize;
      const paginatedEmployees = allEmployees.slice(startIndex, endIndex);

      setTeamMembers(paginatedEmployees);
    } catch (error) {
      console.error('Failed to fetch manager data:', error);
      toast.error('Failed to load manager data');
      setTeamMembers([]);
      setAllTeamMembers([]);
    } finally {
      setLoading(false);
    }
  }, [managerScopeId, membersPage, membersPageSize, membersSearch]);

  const handleScheduleInterview = useCallback((employee) => {
    setSelectedEmployee(employee);
    setScheduleInterviewModalOpen(true);
  }, []);

  const handleSaveInterview = useCallback(async () => {
    try {
      toast.success('Interview scheduled successfully!');
      setScheduleInterviewModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      toast.error('Failed to schedule interview');
    }
  }, []);

  const handleMembersPageChange = useCallback((newPage) => {
    setMembersPage(newPage);
  }, []);

  const handleRequestsPageChange = useCallback((newPage) => {
    setRequestsPage(newPage);
  }, []);

  useEffect(() => {
    if (managerScopeId) {
      fetchManagerData();
    }
  }, [managerScopeId, fetchManagerData]);

  useEffect(() => {
    if (subtabFromUrl && subtabFromUrl !== activeSubTab) {
      setActiveSubTab(subtabFromUrl);
    }
  }, [subtabFromUrl, activeSubTab]);

  const handleSubTabChange = useCallback(
    (tab) => {
      setActiveSubTab(tab);

      if (isEmployeePortalManager) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('tab', 'teams');
          next.set('subtab', tab);
          return next;
        }, { replace: true });
      }
    },
    [isEmployeePortalManager, setSearchParams]
  );

  const openMemberKpiPage = useCallback(
    (member, { openAddKpi = false } = {}) => {
      const targetId = member?.employee_id ?? member?.id;
      if (!targetId) return;

      navigate(`/kpi-performance/${targetId}`, {
        state: {
          fromTeam: true,
          openAddKpi,
          employee: {
            ...member,
            employee_id: targetId,
            employee_name: member?.employee_name || member?.full_name || member?.name || '',
            employee_code: member?.employee_code || member?.code || '',
            position: member?.position || member?.position_name || member?.employee_position || '',
            position_id: member?.position_id || member?.position?.id || null,
            department_id: member?.department_id || member?.department?.id || null,
          },
        },
      });
    },
    [navigate]
  );

  const handleManageKpi = useCallback(
    (member) => openMemberKpiPage(member),
    [openMemberKpiPage]
  );

  // Opens the exact same KPI setup page/modal used by HR, but scoped to the
  // selected member of this manager's team.
  const handleAddKpi = useCallback(
    (member) => openMemberKpiPage(member, { openAddKpi: true }),
    [openMemberKpiPage]
  );

  const subTabs = isEmployeePortalManager
    ? [
        { key: 'members', label: t('employees.profile.manager.tabs.members') },
        { key: 'attendance', label: t('employees.profile.manager.tabs.attendance') },
        { key: 'requests', label: t('employees.profile.manager.tabs.requests') },
        // Manager-only KPI tab for direct team members.
        { key: 'kpi', label: t('employees.profile.tabs.kpiPerformance', 'KPI') },
      ]
    : [
        { key: 'members', label: t('employees.profile.manager.tabs.members') },
        { key: 'attendance', label: t('employees.profile.manager.tabs.attendance') },
        { key: 'requests', label: t('employees.profile.manager.tabs.requests') },
        { key: 'rewards', label: t('employees.profile.manager.tabs.rewards') },
        { key: 'penalties', label: t('employees.profile.manager.tabs.penalties') },
      ];

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-6 h-32 rounded-lg bg-gray-200" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-lg bg-slate-100 p-1">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleSubTabChange(tab.key)}
            className={[
              'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeSubTab === tab.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:bg-slate-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="p-6">
              <EmployeeTable
                data={teamMembers}
                loading={loading}
                hideDepartment={false}
                onRefresh={fetchManagerData}
                onScheduleInterview={handleScheduleInterview}
                portalManagerMode={isEmployeePortalManager}
                onManageKpi={handleManageKpi}
                onAddKpi={handleAddKpi}
              />
            </div>
          </div>

          <div className="mt-4">
            {allTeamMembers.length > membersPageSize && (
              <Pagination
                currentPage={membersPage}
                totalPages={Math.max(1, Math.ceil(allTeamMembers.length / membersPageSize))}
                onPageChange={handleMembersPageChange}
              />
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'kpi' && isEmployeePortalManager && (
        <ManagerTeamKpiSection managerId={managerScopeId} />
      )}

      {activeSubTab === 'requests' && (
        <TeamRequestsSection
          employeeId={managerScopeId}
          page={requestsPage}
          pageSize={requestsPageSize}
          onPageChange={handleRequestsPageChange}
          search={requestsSearch}
        />
      )}

      {activeSubTab === 'attendance' && (
        <TeamAttendanceSection employeeId={managerScopeId} dateFilters={dateFilters} />
      )}

      {activeSubTab === 'rewards' && (
        <TeamRequestsSection
          employeeId={managerScopeId}
          page={requestsPage}
          pageSize={requestsPageSize}
          onPageChange={handleRequestsPageChange}
          search={requestsSearch}
          defaultTab="rewards"
        />
      )}

      {activeSubTab === 'penalties' && (
        <TeamRequestsSection
          employeeId={managerScopeId}
          page={requestsPage}
          pageSize={requestsPageSize}
          onPageChange={handleRequestsPageChange}
          search={requestsSearch}
          defaultTab="penalties"
        />
      )}

      {!isEmployeePortalManager && (
        <AddInterviewModal
          open={scheduleInterviewModalOpen}
          onOpenChange={setScheduleInterviewModalOpen}
          onSave={handleSaveInterview}
        />
      )}
    </div>
  );
}
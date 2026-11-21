// EmployeeRequestsModal.jsx
// Self-contained "requests" viewer used from the Overtime Sheet page.
// Unlike EmployeeAllRequests (which syncs its active tab to the URL's
// ?tab=requests&subtab=... params — params already used on this page for
// month/year/pagination), this modal keeps its active tab in local state so
// it never touches the page's own search params.
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CreditCard, Home, Clock, GitBranch, LogOut, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesApi } from '@/features/employees/api/employees.api';
import { leavesApi } from '@/features/leaves/api/leaves.api';
import { loansApi } from '@/features/loans/api/loans.api';
import { remotelyApi } from '@/features/remotely/api/remotely.api';
import { overtimeApi } from '@/features/overtime/api/overtime.api';
import { branchTransfersApi } from '@/features/branch-transfers/api/branch-transfers.api';
import { resignationsApi } from '@/features/resignations/api/resignations.api';
import { useTranslation } from 'react-i18next';
import {
  formatRequestTime,
  getRequestStatusColorClass,
  translateLeaveType,
  translateRequestStatus,
} from '@/utils/requestLabels';
import { formatCountWithUnit } from '@/utils/durationLabels';
import { extractListRows, REQUEST_LIST_KEYS } from '@/utils/extractListRows';
import EditRequestDialog from '@/features/employees/components/EmplyeeProfile.jsx/EditRequestDialog';
import DeleteConfirmDialog from '@/features/employees/components/EmplyeeProfile.jsx/DeleteConfirmDialog';

// The endpoints above list every employee's requests; `employee_id` filters
// them server-side where supported, but not every one of the six may honor
// it. Drop any row that's clearly for a different employee, once we can
// identify who it belongs to, so this modal never shows another employee's
// requests.
const filterOwnRequests = (rows, employeeId) =>
  rows.filter((item) => {
    const rowEmployeeId =
      item?.employee_id ?? item?.employee?.id ?? item?.employee?.employee_id ?? null;

    if (rowEmployeeId === null || rowEmployeeId === undefined) return true;

    return String(rowEmployeeId) === String(employeeId);
  });

const requestTabs = [
  { id: 'leaves', labelKey: 'requests.table.types.leaves', icon: FileText },
  { id: 'loans', labelKey: 'requests.table.types.loans', icon: CreditCard },
  { id: 'remotely', labelKey: 'requests.table.types.remotely', icon: Home },
  { id: 'overtimes', labelKey: 'requests.table.types.overtimes', icon: Clock },
  { id: 'branch-transfers', labelKey: 'requests.table.types.branchTransfers', icon: GitBranch },
  { id: 'resignations', labelKey: 'requests.table.types.resignations', icon: LogOut },
];

function RequestTabButton({ tab, isActive, onClick, t }) {
  const Icon = tab.icon;
  return (
    <Button
      type="button"
      variant={isActive ? 'default' : 'outline'}
      className={`h-9 rounded-md ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'border-slate-200 text-slate-600 hover:bg-primary'
      }`}
      onClick={() => onClick(tab.id)}
    >
      <Icon className="mr-2 h-4 w-4" />
      {t(tab.labelKey)}
    </Button>
  );
}

function RequestsTable({ title, data, columns, isLoading, onEdit, onDelete, t, activeRequestTab }) {
  if (isLoading) {
    return (
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
          </div>
          <div className="border-t border-slate-100">
            <div className="space-y-3 p-8">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
        </div>
        <div className="overflow-x-auto border-t border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-200">
                {columns.map((col) => (
                  <TableHead key={col.key} className="h-10 px-4 text-xs font-medium whitespace-nowrap text-slate-700">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="h-10 px-4 text-xs font-medium whitespace-nowrap text-slate-700">
                  {t('requests.table.headers.action')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={index} className="border-slate-100">
                    {columns.map((col) => (
                      <TableCell key={col.key} className="px-4 py-3 text-sm whitespace-nowrap text-slate-900">
                        {col.render ? col.render(item) : item[col.key]}
                      </TableCell>
                    ))}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-primary"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete && onDelete(item)}
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
                  <TableCell colSpan={columns.length + 1} className="py-8 text-center text-sm text-slate-500">
                    {activeRequestTab === 'leaves' && t('requests.table.noLeaves')}
                    {activeRequestTab === 'loans' && t('requests.table.noLoans')}
                    {activeRequestTab === 'remotely' && t('requests.table.noRemoteWork')}
                    {activeRequestTab === 'overtimes' && t('requests.table.noOvertimes')}
                    {activeRequestTab === 'branch-transfers' && t('requests.table.noBranchTransfers')}
                    {activeRequestTab === 'resignations' && t('requests.table.noResignations')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function RequestStatusCell({ status, t }) {
  const colorClass = getRequestStatusColorClass(status);

  return (
    <span
      className={`inline-flex min-w-[84px] items-center justify-center rounded-md px-3 py-1 text-xs font-medium ${colorClass}`}
    >
      {translateRequestStatus(t, status)}
    </span>
  );
}

/**
 * @param {boolean} open
 * @param {(open: boolean) => void} onOpenChange
 * @param {string|number} employeeId
 * @param {string} initialTab one of requestTabs[].id — which module to open on
 * @param {string} employeeName optional, shown in the dialog title
 */
export default function EmployeeRequestsModal({
  open,
  onOpenChange,
  employeeId,
  initialTab = 'leaves',
  employeeName = '',
}) {
  const { t, i18n } = useTranslation();
  const [activeRequestTab, setActiveRequestTab] = useState(initialTab);

  // Jump to whichever module button was clicked every time the modal opens.
  useEffect(() => {
    if (open) {
      setActiveRequestTab(initialTab);
    }
  }, [open, initialTab]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const queryClient = useQueryClient();

  const updateLeaveMutation = useMutation({
    mutationFn: employeesApi.updateLeaveRequest,
    onSuccess: () => {
      toast.success('Leave request updated successfully');
      queryClient.invalidateQueries(['employee-leaves', employeeId]);
    },
    onError: () => toast.error('Failed to update leave request'),
  });

  const updateLoanMutation = useMutation({
    mutationFn: employeesApi.updateLoanRequest,
    onSuccess: () => {
      toast.success('Loan request updated successfully');
      queryClient.invalidateQueries(['employee-loans', employeeId]);
    },
    onError: () => toast.error('Failed to update loan request'),
  });

  const updateRemotelyMutation = useMutation({
    mutationFn: employeesApi.updateRemotelyRequest,
    onSuccess: () => {
      toast.success('Remote work request updated successfully');
      queryClient.invalidateQueries(['employee-remotely', employeeId]);
    },
    onError: () => toast.error('Failed to update remote work request'),
  });

  const updateOvertimeMutation = useMutation({
    mutationFn: employeesApi.updateOvertimeRequest,
    onSuccess: () => {
      toast.success('Overtime request updated successfully');
      queryClient.invalidateQueries(['employee-overtimes', employeeId]);
    },
    onError: () => toast.error('Failed to update overtime request'),
  });

  const updateBranchTransferMutation = useMutation({
    mutationFn: employeesApi.updateBranchTransferRequest,
    onSuccess: () => {
      toast.success('Branch transfer request updated successfully');
      queryClient.invalidateQueries(['employee-branch-transfers', employeeId]);
    },
    onError: () => toast.error('Failed to update branch transfer request'),
  });

  const updateResignationMutation = useMutation({
    mutationFn: employeesApi.updateResignationRequest,
    onSuccess: () => {
      toast.success('Resignation request updated successfully');
      queryClient.invalidateQueries(['employee-resignations', employeeId]);
    },
    onError: () => toast.error('Failed to update resignation request'),
  });

  const deleteLeaveMutation = useMutation({
    mutationFn: employeesApi.deleteLeaveRequest,
    onSuccess: () => {
      toast.success('Leave request deleted successfully');
      queryClient.invalidateQueries(['employee-leaves', employeeId]);
    },
    onError: () => toast.error('Failed to delete leave request'),
  });

  const deleteLoanMutation = useMutation({
    mutationFn: employeesApi.deleteLoanRequest,
    onSuccess: () => {
      toast.success('Loan request deleted successfully');
      queryClient.invalidateQueries(['employee-loans', employeeId]);
    },
    onError: () => toast.error('Failed to delete loan request'),
  });

  const deleteRemotelyMutation = useMutation({
    mutationFn: employeesApi.deleteRemotelyRequest,
    onSuccess: () => {
      toast.success('Remote work request deleted successfully');
      queryClient.invalidateQueries(['employee-remotely', employeeId]);
    },
    onError: () => toast.error('Failed to delete remote work request'),
  });

  const deleteOvertimeMutation = useMutation({
    mutationFn: employeesApi.deleteOvertimeRequest,
    onSuccess: () => {
      toast.success('Overtime request deleted successfully');
      queryClient.invalidateQueries(['employee-overtimes', employeeId]);
    },
    onError: () => toast.error('Failed to delete overtime request'),
  });

  const deleteBranchTransferMutation = useMutation({
    mutationFn: employeesApi.deleteBranchTransferRequest,
    onSuccess: () => {
      toast.success('Branch transfer request deleted successfully');
      queryClient.invalidateQueries(['employee-branch-transfers', employeeId]);
    },
    onError: () => toast.error('Failed to delete branch transfer request'),
  });

  const deleteResignationMutation = useMutation({
    mutationFn: employeesApi.deleteResignationRequest,
    onSuccess: () => {
      toast.success('Resignation request deleted successfully');
      queryClient.invalidateQueries(['employee-resignations', employeeId]);
    },
    onError: () => toast.error('Failed to delete resignation request'),
  });

  const handleEdit = (item) => {
    setSelectedRequest(item);
    setEditDialogOpen(true);
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
        throw new Error('Unknown request type');
    }
  };

  const handleDelete = (item) => {
    setRequestToDelete(item);
    setDeleteDialogOpen(true);
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
        toast.error('Unknown request type');
    }

    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  // These used to call profile-scoped endpoints (`/{id}/all-leaves`, etc.)
  // that don't exist on the backend, so the modal always showed an empty
  // table. Use the same endpoints the standalone /leaves, /loans, etc. pages
  // use, filtered to this employee.
  const { data: leavesData, isLoading: isLeavesLoading } = useQuery({
    queryKey: ['employee-leaves', employeeId],
    queryFn: () => leavesApi.getLeaves({ employee_id: employeeId }),
    enabled: open && !!employeeId && activeRequestTab === 'leaves',
  });

  const { data: loansData, isLoading: isLoansLoading } = useQuery({
    queryKey: ['employee-loans', employeeId],
    queryFn: () => loansApi.getLoans({ employee_id: employeeId }),
    enabled: open && !!employeeId && activeRequestTab === 'loans',
  });

  const { data: remotelyData, isLoading: isRemotelyLoading } = useQuery({
    queryKey: ['employee-remotely', employeeId],
    queryFn: () => remotelyApi.getRemotelyList({ employee_id: employeeId }),
    enabled: open && !!employeeId && activeRequestTab === 'remotely',
  });

  const { data: overtimesData, isLoading: isOvertimesLoading } = useQuery({
    queryKey: ['employee-overtimes', employeeId],
    queryFn: () => overtimeApi.getOvertimeRequests({ employee_id: employeeId }),
    enabled: open && !!employeeId && activeRequestTab === 'overtimes',
  });

  const { data: branchTransfersData, isLoading: isBranchTransfersLoading } = useQuery({
    queryKey: ['employee-branch-transfers', employeeId],
    queryFn: () => branchTransfersApi.getBranchTransfers({ employee_id: employeeId }),
    enabled: open && !!employeeId && activeRequestTab === 'branch-transfers',
  });

  const { data: resignationsData, isLoading: isResignationsLoading } = useQuery({
    queryKey: ['employee-resignations', employeeId],
    queryFn: () => resignationsApi.getResignations({ employee_id: employeeId }),
    enabled: open && !!employeeId && activeRequestTab === 'resignations',
  });

  const leavesColumns = [
    { key: 'date', label: t('requests.table.headers.date') },
    {
      key: 'type',
      label: t('requests.table.headers.type'),
      render: (item) => translateLeaveType(t, item.type),
    },
    {
      key: 'status',
      label: t('requests.table.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
  ];

  const loansColumns = [
    { key: 'date', label: t('requests.table.headers.date') },
    { key: 'amount', label: t('requests.table.headers.amount') },
    {
      key: 'months',
      label: t('requests.table.headers.months'),
      render: (item) => formatCountWithUnit(t, item.months ?? 0, 'month'),
    },
    { key: 'monthly_amount', label: t('requests.table.headers.monthlyAmount') },
    {
      key: 'status',
      label: t('requests.table.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('requests.table.headers.reason'), render: (item) => item.reason || '-' },
  ];

  const remotelyColumns = [
    { key: 'from', label: t('requests.table.headers.fromDate') },
    { key: 'to', label: t('requests.table.headers.toDate') },
    {
      key: 'status',
      label: t('requests.table.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('requests.table.headers.reason'), render: (item) => item.reason || '-' },
  ];

  const overtimesColumns = [
    { key: 'date', label: t('requests.table.headers.date') },
    {
      key: 'from',
      label: t('requests.table.headers.from'),
      render: (item) => formatRequestTime(item.from, i18n.language),
    },
    {
      key: 'to',
      label: t('requests.table.headers.to'),
      render: (item) => formatRequestTime(item.to, i18n.language),
    },
    {
      key: 'status',
      label: t('requests.table.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('requests.table.headers.reason') },
  ];

  const branchTransfersColumns = [
    { key: 'date', label: t('requests.table.headers.date') },
    {
      key: 'current_branch',
      label: t('requests.table.headers.fromBranch'),
      render: (item) => item.current_branch?.name_en || '-',
    },
    {
      key: 'requested_branch',
      label: t('requests.table.headers.toBranch'),
      render: (item) => item.requested_branch?.name_en || '-',
    },
    {
      key: 'status',
      label: t('requests.table.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('requests.table.headers.reason'), render: (item) => item.reason || '-' },
  ];

  const resignationsColumns = [
    { key: 'date', label: t('requests.table.headers.date') },
    { key: 'reason', label: t('requests.table.headers.reason') },
    {
      key: 'status',
      label: t('requests.table.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
  ];

  const renderContent = () => {
    switch (activeRequestTab) {
      case 'leaves':
        return (
          <RequestsTable
            title={t('requests.table.titles.leaveRequests')}
            data={filterOwnRequests(extractListRows(leavesData, REQUEST_LIST_KEYS['leaves']), employeeId)}
            columns={leavesColumns}
            isLoading={isLeavesLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            t={t}
            activeRequestTab={activeRequestTab}
          />
        );
      case 'loans':
        return (
          <RequestsTable
            title={t('requests.table.titles.loanRequests')}
            data={filterOwnRequests(extractListRows(loansData, REQUEST_LIST_KEYS['loans']), employeeId)}
            columns={loansColumns}
            isLoading={isLoansLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            t={t}
            activeRequestTab={activeRequestTab}
          />
        );
      case 'remotely':
        return (
          <RequestsTable
            title={t('requests.table.titles.remoteWorkRequests')}
            data={filterOwnRequests(extractListRows(remotelyData, REQUEST_LIST_KEYS['remotely']), employeeId)}
            columns={remotelyColumns}
            isLoading={isRemotelyLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            t={t}
            activeRequestTab={activeRequestTab}
          />
        );
      case 'overtimes':
        return (
          <RequestsTable
            title={t('requests.table.titles.overtimeRequests')}
            data={filterOwnRequests(extractListRows(overtimesData, REQUEST_LIST_KEYS['overtimes']), employeeId)}
            columns={overtimesColumns}
            isLoading={isOvertimesLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            t={t}
            activeRequestTab={activeRequestTab}
          />
        );
      case 'branch-transfers':
        return (
          <RequestsTable
            title={t('requests.table.titles.branchTransferRequests')}
            data={filterOwnRequests(extractListRows(branchTransfersData, REQUEST_LIST_KEYS['branch-transfers']), employeeId)}
            columns={branchTransfersColumns}
            isLoading={isBranchTransfersLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            t={t}
            activeRequestTab={activeRequestTab}
          />
        );
      case 'resignations':
        return (
          <RequestsTable
            title={t('requests.table.titles.resignationRequests')}
            data={filterOwnRequests(extractListRows(resignationsData, REQUEST_LIST_KEYS['resignations']), employeeId)}
            columns={resignationsColumns}
            isLoading={isResignationsLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            t={t}
            activeRequestTab={activeRequestTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] !w-[1100px] !max-w-[92vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('requests.title')}
              {employeeName ? ` — ${employeeName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {requestTabs.map((tab) => (
                <RequestTabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeRequestTab === tab.id}
                  onClick={setActiveRequestTab}
                  t={t}
                />
              ))}
            </div>

            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>

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
          deleteLeaveMutation.isLoading ||
          deleteLoanMutation.isLoading ||
          deleteRemotelyMutation.isLoading ||
          deleteOvertimeMutation.isLoading ||
          deleteBranchTransferMutation.isLoading ||
          deleteResignationMutation.isLoading
        }
        itemType={`${activeRequestTab.replace('-', ' ')} request`}
      />
    </>
  );
}

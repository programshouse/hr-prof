import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/features/employees/api/employees.api';
import { FileText, CreditCard, Home, Clock, GitBranch, LogOut, Edit, Trash } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  formatRequestTime,
  formatRequestTimeRange,
  translateLeaveType,
  translateRequestStatus,
} from '@/utils/requestLabels';
import { formatCountWithUnit } from '@/utils/durationLabels';

function getRequestTabs(t) {
  return [
    { id: 'leaves', label: t('requests.types.leaves'), icon: FileText },
    { id: 'loans', label: t('requests.types.loans'), icon: CreditCard },
    { id: 'remotely', label: t('requests.types.remotely'), icon: Home },
    { id: 'overtimes', label: t('requests.types.overtimes'), icon: Clock },
    { id: 'branch-transfers', label: t('requests.types.branchTransfers'), icon: GitBranch },
    { id: 'resignations', label: t('requests.types.resignations'), icon: LogOut },
  ];
}

function RequestTabButton({ tab, isActive, onClick }) {
  const Icon = tab.icon;
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      className={`h-9 rounded-md ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'border-slate-200 text-slate-600 hover:bg-primary'
      }`}
      onClick={() => onClick(tab.id)}
    >
      <Icon className="mr-2 h-4 w-4" />
      {tab.label}
    </Button>
  );
}

function RequestsTable({ title, data, columns, isLoading, t }) {
  if (isLoading) {
    return (
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
          </div>
          <div className="border-t border-slate-100">
            <div className="p-8 space-y-3">
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
        <div className="border-t border-slate-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-200">
                {columns.map((col) => (
                  <TableHead key={col.key} className="h-10 px-4 text-xs font-medium text-slate-700">
                    {col.label}
                  </TableHead>
                ))}
                <TableHead key="actions" className="h-10 px-4 text-xs font-medium text-slate-700">
                  {t('requests.table.headers.action')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={index} className="border-slate-100">
                    {columns.map((col) => (
                      <TableCell key={col.key} className="py-3 px-4 text-sm text-slate-900">
                        {col.render ? col.render(item) : item[col.key]}
                      </TableCell>
                    ))}
                    <TableCell key="actions" className="py-3 px-4 text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="py-8 text-center text-sm text-slate-500">
                    {t('requests.table.noData', { type: title.toLowerCase() })}
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
  const normalized = String(status || '').toLowerCase();
  const ringClass =
    normalized === 'pending'
      ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
      : normalized === 'approved'
        ? 'bg-green-50 text-green-800 ring-green-600/20'
        : 'bg-red-50 text-red-800 ring-red-600/20';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${ringClass}`}
    >
      {translateRequestStatus(t, status)}
    </span>
  );
}

export default function EmployeeRequestsPage() {
  const { t, i18n } = useTranslation();
  const [activeRequestTab, setActiveRequestTab] = useState('leaves');
  
  const requestTabs = getRequestTabs(t);

  // Mock data fetching - replace with actual API calls
  const { data: leavesData, isLoading: isLeavesLoading } = useQuery({
    queryKey: ['employee-leaves'],
    queryFn: () => employeesApi.getEmployeeLeaves(),
    enabled: activeRequestTab === 'leaves',
  });

  const { data: loansData, isLoading: isLoansLoading } = useQuery({
    queryKey: ['employee-loans'],
    queryFn: () => employeesApi.getEmployeeLoans(),
    enabled: activeRequestTab === 'loans',
  });

  const { data: remotelyData, isLoading: isRemotelyLoading } = useQuery({
    queryKey: ['employee-remotely'],
    queryFn: () => employeesApi.getEmployeeRemotely(),
    enabled: activeRequestTab === 'remotely',
  });

  const { data: overtimesData, isLoading: isOvertimesLoading } = useQuery({
    queryKey: ['employee-overtimes'],
    queryFn: () => employeesApi.getEmployeeOvertimes(),
    enabled: activeRequestTab === 'overtimes',
  });

  const { data: branchTransfersData, isLoading: isBranchTransfersLoading } = useQuery({
    queryKey: ['employee-branch-transfers'],
    queryFn: () => employeesApi.getEmployeeBranchTransfers(),
    enabled: activeRequestTab === 'branch-transfers',
  });

  const { data: resignationsData, isLoading: isResignationsLoading } = useQuery({
    queryKey: ['employee-resignations'],
    queryFn: () => employeesApi.getEmployeeResignations(),
    enabled: activeRequestTab === 'resignations',
  });

  const leavesColumns = [
    { key: 'id', label: t('tables.headers.id'), render: (item) => `#${item.id}` },
    { key: 'employee_name', label: t('tables.headers.employee'), render: (item) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-sm font-medium text-slate-600">{item.employee_name?.charAt(0) || 'E'}</span>
        </div>
        <div className="text-sm font-medium text-slate-900">
          {item.employee_name}
          <p className="text-xs text-slate-500">{item.employee_department}</p>
        </div>
      </div>
    ) },
    { key: 'type', label: t('tables.headers.type'), render: (item) => (
      <div>
        <div>{translateLeaveType(t, item.type)}</div>
        {item.sub_type ? (
          <div className="text-xs text-slate-500">{translateLeaveType(t, item.sub_type)}</div>
        ) : null}
      </div>
    ) },
    { key: 'date', label: t('tables.headers.date') },
    {
      key: 'time',
      label: t('tables.headers.time'),
      render: (item) =>
        formatRequestTimeRange(item.from || item.time_from, item.to || item.time_to, i18n.language),
    },
    { key: 'replacement', label: t('tables.headers.replacement'), render: (item) => item.replacement || '-' },
    { 
      key: 'status', 
      label: t('tables.headers.status'), 
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
  ];

  const loansColumns = [
    { key: 'employee_name', label: t('tables.headers.employee'), render: (item) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-sm font-medium text-slate-600">{item.employee_name?.charAt(0) || 'E'}</span>
        </div>
        <div className="text-sm font-medium text-slate-900">
          {item.employee_name}
          <p className="text-xs text-slate-500">{item.employee_department}</p>
        </div>
      </div>
    ) },
    { key: 'date', label: t('tables.headers.date') },
    { key: 'amount', label: t('tables.headers.amount') },
    {
      key: 'months',
      label: t('requests.table.headers.months'),
      render: (item) => formatCountWithUnit(t, item.months ?? 0, 'month'),
    },
    { key: 'monthly_amount', label: t('requests.table.headers.monthlyAmount') },
    {
      key: 'status',
      label: t('tables.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('tables.headers.reason'), render: (item) => item.reason || '-' },
  ];

  const remotelyColumns = [
    { key: 'employee_name', label: t('tables.headers.employee'), render: (item) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-sm font-medium text-slate-600">{item.employee_name?.charAt(0) || 'E'}</span>
        </div>
        <div className="text-sm font-medium text-slate-900">
          {item.employee_name}
          <p className="text-xs text-slate-500">{item.employee_department}</p>
        </div>
      </div>
    ) },
    { key: 'from', label: t('requests.table.headers.fromDate') },
    { key: 'to', label: t('requests.table.headers.toDate') },
    {
      key: 'status',
      label: t('tables.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('tables.headers.reason'), render: (item) => item.reason || '-' },
  ];

  const overtimesColumns = [
    { key: 'employee_name', label: t('tables.headers.employee'), render: (item) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-sm font-medium text-slate-600">{item.employee_name?.charAt(0) || 'E'}</span>
        </div>
        <div className="text-sm font-medium text-slate-900">
          {item.employee_name}
          <p className="text-xs text-slate-500">{item.employee_department}</p>
        </div>
      </div>
    ) },
    { key: 'date', label: t('tables.headers.date') },
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
      label: t('tables.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('tables.headers.reason') },
  ];

  const branchTransfersColumns = [
    { key: 'employee_name', label: t('tables.headers.employee'), render: (item) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-sm font-medium text-slate-600">{item.employee_name?.charAt(0) || 'E'}</span>
        </div>
        <div className="text-sm font-medium text-slate-900">
          {item.employee_name}
          <p className="text-xs text-slate-500">{item.employee_department}</p>
        </div>
      </div>
    ) },
    { key: 'date', label: t('tables.headers.date') },
    { key: 'current_branch', label: t('requests.table.headers.fromBranch'), render: (item) => item.current_branch?.name_en || '-' },
    { key: 'requested_branch', label: t('requests.table.headers.toBranch'), render: (item) => item.requested_branch?.name_en || '-' },
    {
      key: 'status',
      label: t('tables.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
    { key: 'reason', label: t('tables.headers.reason'), render: (item) => item.reason || '-' },
  ];

  const resignationsColumns = [
    { key: 'employee_name', label: t('tables.headers.employee'), render: (item) => (
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <span className="text-sm font-medium text-slate-600">{item.employee_name?.charAt(0) || 'E'}</span>
        </div>
        <div className="text-sm font-medium text-slate-900">
          {item.employee_name}
          <p className="text-xs text-slate-500">{item.employee_department}</p>
        </div>
      </div>
    ) },
    { key: 'date', label: t('tables.headers.date') },
    { key: 'reason', label: t('tables.headers.reason') },
    {
      key: 'status',
      label: t('tables.headers.status'),
      render: (item) => <RequestStatusCell status={item.status} t={t} />,
    },
  ];

  const renderContent = () => {
    switch (activeRequestTab) {
      case 'leaves':
        return (
          <RequestsTable
            title={t('requests.table.titles.leaveRequests')}
            data={leavesData?.data || []}
            columns={leavesColumns}
            isLoading={isLeavesLoading}
            t={t}
          />
        );
      case 'loans':
        return (
          <RequestsTable
            title={t('requests.table.titles.loanRequests')}
            data={loansData?.data || []}
            columns={loansColumns}
            isLoading={isLoansLoading}
            t={t}
          />
        );
      case 'remotely':
        return (
          <RequestsTable
            title={t('requests.table.titles.remoteWorkRequests')}
            data={remotelyData?.data || []}
            columns={remotelyColumns}
            isLoading={isRemotelyLoading}
            t={t}
          />
        );
      case 'overtimes':
        return (
          <RequestsTable
            title={t('requests.table.titles.overtimeRequests')}
            data={overtimesData?.data || []}
            columns={overtimesColumns}
            isLoading={isOvertimesLoading}
            t={t}
          />
        );
      case 'branch-transfers':
        return (
          <RequestsTable
            title={t('requests.table.titles.branchTransferRequests')}
            data={branchTransfersData?.data || []}
            columns={branchTransfersColumns}
            isLoading={isBranchTransfersLoading}
            t={t}
          />
        );
      case 'resignations':
        return (
          <RequestsTable
            title={t('requests.table.titles.resignationRequests')}
            data={resignationsData?.data || []}
            columns={resignationsColumns}
            isLoading={isResignationsLoading}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">{t('requests.title')}</h1>
      
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {requestTabs.map((tab) => (
          <RequestTabButton
            key={tab.id}
            tab={tab}
            isActive={activeRequestTab === tab.id}
            onClick={setActiveRequestTab}
          />
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

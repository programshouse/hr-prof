// EmployeeAllRequests.jsx
//
// The "Requests" tab on an employee profile. Six sub-tabs, each a list of that
// employee's requests with full create / edit / delete.
//
// All six share one dialog (RequestFormDialog) and one set of mutations
// (useEmployeeRequestMutations). What differs between them — required fields,
// value formats, endpoints — lives in requestTypes.config.js. The employee is
// fixed to whoever's profile we're on and is never picked from a dropdown.

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { employeesApi } from '@/features/employees/api/employees.api';
import { useEmployeeRequestMutations } from '@/features/employees/hooks/useEmployeeRequestMutations';
import {
  formatRequestTime,
  getRequestStatusColorClass,
  translateLeaveType,
  translateRequestStatus,
} from '@/utils/requestLabels';
import { formatCountWithUnit } from '@/utils/durationLabels';
import { extractListRows, REQUEST_LIST_KEYS } from '@/utils/extractListRows';

import RequestFormDialog from './RequestFormDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import {
  REQUEST_TYPES,
  REQUEST_TYPE_IDS,
  getRecordId,
  getRequestTypeConfig,
} from './requestTypes.config';

/** Profile-scoped list endpoints, one per tab. */
const LIST_FETCHERS = {
  leaves: employeesApi.getEmployeeLeaves,
  loans: employeesApi.getEmployeeLoans,
  remotely: employeesApi.getEmployeeRemotely,
  overtimes: employeesApi.getEmployeeOvertimes,
  'branch-transfers': employeesApi.getEmployeeBranchTransfers,
  resignations: employeesApi.getEmployeeResignations,
};

const EMPTY_STATE_KEYS = {
  leaves: 'requests.table.noLeaves',
  loans: 'requests.table.noLoans',
  remotely: 'requests.table.noRemoteWork',
  overtimes: 'requests.table.noOvertimes',
  'branch-transfers': 'requests.table.noBranchTransfers',
  resignations: 'requests.table.noResignations',
};

const TABLE_TITLE_KEYS = {
  leaves: 'requests.table.titles.leaveRequests',
  loans: 'requests.table.titles.loanRequests',
  remotely: 'requests.table.titles.remoteWorkRequests',
  overtimes: 'requests.table.titles.overtimeRequests',
  'branch-transfers': 'requests.table.titles.branchTransferRequests',
  resignations: 'requests.table.titles.resignationRequests',
};

function RequestTabButton({ tab, isActive, onClick, t }) {
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
      {t(tab.tabLabelKey, { defaultValue: tab.tabLabelFallback })}
    </Button>
  );
}

function RequestStatusCell({ status, t }) {
  // A request that has not been acted on yet is pending, so a blank/missing
  // status from the API renders as pending rather than as an empty chip.
  const value = status || 'pending';

  return (
    <span
      className={`inline-flex min-w-[84px] items-center justify-center rounded-md px-3 py-1 text-xs font-medium ${getRequestStatusColorClass(
        value
      )}`}
    >
      {translateRequestStatus(t, value)}
    </span>
  );
}

function RequestsTable({
  title,
  data,
  columns,
  isLoading,
  onCreate,
  onEdit,
  onDelete,
  emptyMessage,
  createLabel,
  t,
}) {
  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 p-4">
          <p className="text-sm font-semibold text-slate-900">{title}</p>

          <Button size="sm" className="h-9" onClick={onCreate} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            {createLabel}
          </Button>
        </div>

        <div className="border-t border-slate-100">
          {isLoading ? (
            <div className="space-y-3 p-8">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className="h-10 px-4 text-xs font-medium text-slate-700"
                    >
                      {col.label}
                    </TableHead>
                  ))}

                  <TableHead className="h-10 px-4 text-xs font-medium text-slate-700">
                    {t('requests.table.headers.action')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data?.length > 0 ? (
                  data.map((item, index) => (
                    <TableRow key={getRecordId(item) ?? index} className="border-slate-100">
                      {columns.map((col) => (
                        <TableCell key={col.key} className="px-4 py-3 text-sm text-slate-900">
                          {col.render ? col.render(item) : item[col.key]}
                        </TableCell>
                      ))}

                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-primary"
                            title={t('common.edit', { defaultValue: 'Edit' })}
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title={t('common.delete', { defaultValue: 'Delete' })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EmployeeAllRequests({ employeeId, employee, isLoading = false }) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const subtabFromUrl = searchParams.get('subtab');
  const [activeRequestTab, setActiveRequestTabState] = useState(subtabFromUrl || 'leaves');

  useEffect(() => {
    if (subtabFromUrl && subtabFromUrl !== activeRequestTab) {
      setActiveRequestTabState(subtabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtabFromUrl]);

  const setActiveRequestTab = (tab) => {
    setActiveRequestTabState(tab);

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'requests');
        next.set('subtab', tab);
        return next;
      },
      { replace: true }
    );
  };

  const [formOpen, setFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const config = getRequestTypeConfig(activeRequestTab);

  const employeeName = useMemo(
    () =>
      employee?.name ||
      employee?.employee_name ||
      employee?.full_name ||
      employee?.basic?.full_name ||
      '',
    [employee]
  );

  // One query for whichever tab is active — the key matches what the
  // mutations invalidate, so lists refresh straight after a write.
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: config ? config.queryKey(employeeId) : ['employee-requests', 'none'],
    queryFn: () => LIST_FETCHERS[activeRequestTab](employeeId),
    enabled: Boolean(employeeId && config),
  });

  const { create, update, remove, isMutating } = useEmployeeRequestMutations(
    activeRequestTab,
    employeeId
  );

  // Every row the endpoint returned for this employee, whatever envelope it
  // arrived in (bare array, { data }, paginator, or a named collection).
  // See utils/extractListRows.js — reading `.data` directly used to leave the
  // table empty for the shapes it did not happen to match.
  const rows = useMemo(
    () => extractListRows(listData, REQUEST_LIST_KEYS[activeRequestTab] || []),
    [listData, activeRequestTab]
  );

  const handleCreate = () => {
    setSelectedRequest(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedRequest(item);
    setFormOpen(true);
  };

  const handleSubmit = async ({ payload }) => {
    try {
      if (selectedRequest) {
        const id = getRecordId(selectedRequest);

        if (!id) {
          throw new Error('Missing request id');
        }

        await update.mutateAsync({ id, values: payload });
      } else {
        await create.mutateAsync(payload);
      }

      setFormOpen(false);
      setSelectedRequest(null);
    } catch {
      // Toast already raised by the mutation's onError; keep the dialog open
      // so the user can correct the field the API complained about.
    }
  };

  const handleDelete = (item) => {
    setRequestToDelete(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const id = getRecordId(requestToDelete);

    if (!id) return;

    try {
      await remove.mutateAsync(id);
    } finally {
      setDeleteOpen(false);
      setRequestToDelete(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /* columns                                                           */
  /* ---------------------------------------------------------------- */

  const statusColumn = {
    key: 'status',
    label: t('requests.table.headers.status'),
    render: (item) => <RequestStatusCell status={item.status} t={t} />,
  };

  const columnsByType = {
    leaves: [
      { key: 'date', label: t('requests.table.headers.date') },
      {
        key: 'type',
        label: t('requests.table.headers.type'),
        render: (item) => translateLeaveType(t, item.type),
      },
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
      statusColumn,
    ],

    loans: [
      { key: 'date', label: t('requests.table.headers.date') },
      { key: 'amount', label: t('requests.table.headers.amount') },
      {
        key: 'months',
        label: t('requests.table.headers.months'),
        render: (item) => formatCountWithUnit(t, item.months ?? 0, 'month'),
      },
      { key: 'monthly_amount', label: t('requests.table.headers.monthlyAmount') },
      statusColumn,
      {
        key: 'reason',
        label: t('requests.table.headers.reason'),
        render: (item) => item.reason || '-',
      },
    ],

    remotely: [
      { key: 'from', label: t('requests.table.headers.fromDate') },
      { key: 'to', label: t('requests.table.headers.toDate') },
      statusColumn,
      {
        key: 'reason',
        label: t('requests.table.headers.reason'),
        render: (item) => item.reason || '-',
      },
    ],

    overtimes: [
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
      statusColumn,
      {
        key: 'reason',
        label: t('requests.table.headers.reason'),
        render: (item) => item.reason || '-',
      },
    ],

    'branch-transfers': [
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
      statusColumn,
      {
        key: 'reason',
        label: t('requests.table.headers.reason'),
        render: (item) => item.reason || '-',
      },
    ],

    resignations: [
      { key: 'date', label: t('requests.table.headers.date') },
      {
        key: 'reason',
        label: t('requests.table.headers.reason'),
        render: (item) => item.reason || '-',
      },
      statusColumn,
    ],
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  const typeLabel = config
    ? t(config.singularKey, { defaultValue: config.singularFallback })
    : 'request';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {REQUEST_TYPE_IDS.map((id) => (
          <RequestTabButton
            key={id}
            tab={REQUEST_TYPES[id]}
            isActive={activeRequestTab === id}
            onClick={setActiveRequestTab}
            t={t}
          />
        ))}
      </div>

      <RequestsTable
        title={t(TABLE_TITLE_KEYS[activeRequestTab])}
        data={rows}
        columns={columnsByType[activeRequestTab] || []}
        isLoading={isListLoading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={t(EMPTY_STATE_KEYS[activeRequestTab])}
        createLabel={t('requests.form.new', {
          type: typeLabel,
          defaultValue: 'New {{type}}',
        })}
        t={t}
      />

      <RequestFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedRequest(null);
        }}
        requestType={activeRequestTab}
        request={selectedRequest}
        employeeId={employeeId}
        employeeName={employeeName}
        onSubmit={handleSubmit}
        isSubmitting={create.isPending || update.isPending}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        isLoading={isMutating}
        itemType={typeLabel.toLowerCase()}
      />
    </div>
  );
}

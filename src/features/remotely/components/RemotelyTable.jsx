// src/features/remotely/components/RemotelyTable.jsx
import { useMemo, useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import DeleteRemotelyModal from './DeleteRemotelyModal';
import { useTranslation } from 'react-i18next';
import {
  getRequestStatusColorClass,
  translateRequestStatus,
} from '@/utils/requestLabels';

const getDepartmentValue = (row) =>
  row?.employee?.department_id ??
  row?.employee?.department?.id ??
  row?.department_id ??
  row?.department?.id ??
  null;

const normalizeDepartmentLabel = (value, preferArabic) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();

  if (typeof value === 'object') {
    return preferArabic
      ? normalizeDepartmentLabel(
          value.name_ar ??
            value.department_name_ar ??
            value.title_ar ??
            value.name ??
            value.department_name ??
            value.name_en ??
            value.department_name_en ??
            value.title_en ??
            value.title,
          preferArabic
        )
      : normalizeDepartmentLabel(
          value.name_en ??
            value.department_name_en ??
            value.title_en ??
            value.name ??
            value.department_name ??
            value.title ??
            value.name_ar ??
            value.department_name_ar ??
            value.title_ar,
          preferArabic
        );
  }

  return String(value).trim();
};

const getDepartmentName = (department, preferArabic) => {
  if (!department) return '';
  return normalizeDepartmentLabel(department, preferArabic);
};

const normalizeRenderableText = (value, fallback = '') => {
  if (value == null) return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => normalizeRenderableText(item, ''))
      .filter(Boolean)
      .join(', ')
      .trim();
    return joined || fallback;
  }

  if (typeof value === 'object') {
    return normalizeRenderableText(
      value.full_name ??
        value.name ??
        value.name_en ??
        value.name_ar ??
        value.department_name ??
        value.title ??
        value.id,
      fallback
    );
  }

  return String(value).trim() || fallback;
};

export default function RemotelyTable({ data = [], loading, onEdit }) {
  const { t, i18n } = useTranslation();
  const preferArabic = i18n.language?.startsWith('ar');
  const { data: departments = [] } = useAllDepartments();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [remoteToDelete, setRemoteToDelete] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('remotely.headers.id'),
        cell: ({ row }) => (
          <span className="font-medium">#{normalizeRenderableText(row.original.employee?.code, '—')}</span>
        ),
      },
      {
        accessorKey: 'employeeName',
        header: t('remotely.headers.employee'),
        cell: ({ row }) => {
          const emp = row.original.employee;
          const departmentValue = getDepartmentValue(row.original);
          const department = departments.find(
            (item) =>
              String(item?.id ?? '') === String(departmentValue ?? '') ||
              String(item?.department_id ?? '') === String(departmentValue ?? '')
          );

          const deptName =
            normalizeDepartmentLabel(departmentValue, preferArabic) ||
            getDepartmentName(department, preferArabic) ||
            getDepartmentName(emp?.department, preferArabic) ||
            getDepartmentName(row.original.department, preferArabic) ||
            '—';
          const fullName = normalizeRenderableText(
            emp?.full_name ?? row.original.employeeName,
            'Unknown Employee'
          );

          // #region debug-point A:remote-render-inputs
          (()=>fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"remote-department-render",runId:"pre",hypothesisId:"A",location:"RemotelyTable.jsx:employee-cell",msg:"[DEBUG] remote render values",data:{departmentValueType:typeof departmentValue,departmentValue:departmentValue&&typeof departmentValue==="object"?{id:departmentValue.id??null,name:departmentValue.name??null,keys:Object.keys(departmentValue).slice(0,5)}:departmentValue,department:department&&typeof department==="object"?{id:department.id??null,name:department.name??department.name_en??department.name_ar??null,keys:Object.keys(department).slice(0,5)}:department,empDepartment:emp?.department&&typeof emp.department==="object"?{id:emp.department.id??null,name:emp.department.name??emp.department.name_en??emp.department.name_ar??null,keys:Object.keys(emp.department).slice(0,5)}:emp?.department,rowDepartment:row.original.department&&typeof row.original.department==="object"?{id:row.original.department.id??null,name:row.original.department.name??row.original.department.name_en??row.original.department.name_ar??null,keys:Object.keys(row.original.department).slice(0,5)}:row.original.department,deptNameType:typeof deptName,deptName:deptName&&typeof deptName==="object"?{id:deptName.id??null,name:deptName.name??null,keys:Object.keys(deptName).slice(0,5)}:deptName,fullNameType:typeof emp?.full_name,fullName:emp?.full_name&&typeof emp.full_name==="object"?{id:emp.full_name.id??null,name:emp.full_name.name??null,keys:Object.keys(emp.full_name).slice(0,5)}:emp?.full_name},ts:Date.now()})}).catch(()=>{}))();
          // #endregion

          return (
            <div className="flex items-center gap-3">
              <img
                src={row.original.avatarUrl || `https://ui-avatars.com/api/?name=${fullName || 'Employee'}`}
                alt={fullName || 'Employee'}
                className="size-9 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {fullName}
                </span>
                <span className="text-primary text-xs font-medium">{deptName}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'from',
        header: t('remotely.headers.from'),
        cell: ({ row }) => <span>{row.original.from || '—'}</span>,
      },
      {
        accessorKey: 'to',
        header: t('remotely.headers.to'),
        cell: ({ row }) => <span>{row.original.to || '—'}</span>,
      },
      {
        accessorKey: 'status',
        header: t('remotely.headers.status'),
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          const colorClass = getRequestStatusColorClass(status);

          return (
            <span
              className={`inline-flex min-w-24 justify-center rounded-md px-2 py-1 text-xs font-medium md:rounded-lg md:px-3 md:py-1.5 md:text-sm ${colorClass}`}
            >
              {translateRequestStatus(t, status)}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: t('remotely.headers.action'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              className="bg-tertiary text-primary flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => onEdit(row.original)}
            >
              <Pencil className="size-4" />
            </button>

            <button
              className="bg-light-error text-pink flex size-8 cursor-pointer items-center justify-center rounded-full border border-gray-200"
              onClick={() => {
                setRemoteToDelete(row.original);
                setDeleteModalOpen(true);
              }}
            >
              <Trash className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEdit, departments, t, preferArabic]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx} className="border-b last:border-0">
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <TableCell key={idx}>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="border-b last:border-0 hover:bg-gray-50/60">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {t('remotely.noRemotelyFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/*  Delete Confirmation Modal */}
      <DeleteRemotelyModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        remote={remoteToDelete}
      />
    </div>
  );
}

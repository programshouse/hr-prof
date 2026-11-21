import { useQuery } from '@tanstack/react-query';
import { activityLogsApi } from '../api/activityLogsApi';

function getTargetEntity(log) {
  return (
    log?.new_values?.employee ||
    log?.old_values?.employee ||
    log?.new_values?.applicant ||
    log?.old_values?.applicant ||
    null
  );
}

function getTargetName(log) {
  const entity = getTargetEntity(log);

  if (entity?.full_name) return entity.full_name;

  const firstName = entity?.first_name || '';
  const middleName = entity?.middle_name || '';
  const lastName = entity?.last_name || '';

  const combinedName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
  if (combinedName) return combinedName;

  if (log?.old_values?.full_name) return log.old_values.full_name;
  if (log?.new_values?.full_name) return log.new_values.full_name;
  if (log?.old_values?.name) return log.old_values.name;
  if (log?.new_values?.name) return log.new_values.name;

  return '—';
}

function getTargetCode(log) {
  const entity = getTargetEntity(log);

  if (entity?.code) return entity.code;
  if (log?.old_values?.code) return log.old_values.code;
  if (log?.new_values?.code) return log.new_values.code;

  return '';
}

export function useActivityLogsQuery(filters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? filters.pageSize ?? 10;

  return useQuery({
    queryKey: ['activity-logs', { ...filters, page, limit }],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(filters.admin_id ? { admin_id: filters.admin_id } : {}),
        ...(filters.date ? { date: filters.date } : {}),
      };

      const result = await activityLogsApi.getActivityLogs(params);

      const rows = (result.rows || []).map((log) => ({
        ...log,
        adminName: log.hr?.name || '—',
        adminEmail: log.hr?.email || '—',
        targetEmployeeName: getTargetName(log),
        targetEmployeeCode: getTargetCode(log),
      }));

      return {
        rows,
        meta: result.meta,
      };
    },
  });
}
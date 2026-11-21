function formatDateForApi(dateString) {
  if (!dateString) return undefined;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toISOString().split('T')[0];
}

export function resolveEmployeeIds(task) {
  if (!task) return [];

  if (Array.isArray(task.employee_ids) && task.employee_ids.length > 0) {
    return task.employee_ids.map(Number).filter((id) => !Number.isNaN(id));
  }

  if (Array.isArray(task.employees) && task.employees.length > 0) {
    return task.employees
      .map((employee) =>
        Number(
          employee?.employee_id ??
            employee?.id ??
            employee?.pivot?.employee_id
        )
      )
      .filter((id) => !Number.isNaN(id));
  }

  const singleId = task.employee_id ?? task.employee?.id;
  if (singleId != null && singleId !== '') {
    const id = Number(singleId);
    return Number.isNaN(id) ? [] : [id];
  }

  return [];
}

/** PUT /employee-tasks/:id expects the same fields as create/edit (not status-only). */
export function buildEmployeeTaskUpdatePayload(task, overrides = {}) {
  const employee_ids = resolveEmployeeIds(task);
  const name = task?.name || task?.task_name || task?.title || task?.taskName;

  const payload = {
    task_number: task?.task_number ?? task?.taskNumber ?? undefined,
    name,
    description: task?.description || undefined,
    employee_ids,
    start_date: formatDateForApi(task?.start_date ?? task?.startDate),
    due_date: formatDateForApi(task?.due_date ?? task?.dueDate),
    priority: task?.priority,
    status: overrides.status ?? task?.status,
  };

  if (employee_ids.length > 0) {
    payload.employee_id = employee_ids[0];
  }

  return payload;
}

export function getEmployeeTaskErrorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || null;

  if (typeof data.message === 'string' && data.message) {
    return data.message;
  }

  if (data.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    const first = data.errors[firstKey];
    if (Array.isArray(first) && first[0]) return first[0];
    if (typeof first === 'string') return first;
  }

  return null;
}

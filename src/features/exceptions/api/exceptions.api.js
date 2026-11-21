import axiosClient from '@/services/http/axiosClient';

export const exceptionsApi = {
  getExceptions: async (_params = {}) => {
   
    const requestedPage = Number(_params.page) > 0 ? Number(_params.page) : 1;
    const requestedPageSize = Number(_params.pageSize) > 0 ? Number(_params.pageSize) : 20;

    const apiParams = {
      page: 1,
      // big limit to get enough employees; local pagination is applied after flatten
      limit: 10000,
      keyword: _params.search,
      department_id:
        _params.company && _params.company !== 'all'
          ? _params.company
          : undefined,
      branch_id:
        _params.branch && _params.branch !== 'all'
          ? _params.branch
          : undefined,
      shift_id:
        _params.shift && _params.shift !== 'all'
          ? _params.shift
          : undefined,
      position_id:
        _params.position && _params.position !== 'all'
          ? _params.position
          : undefined,
      employee_id: _params.employee_id || undefined,
      month: _params.month,
    };

    Object.keys(apiParams).forEach((key) => {
      if (
        apiParams[key] === undefined ||
        apiParams[key] === null ||
        apiParams[key] === ''
      ) {
        delete apiParams[key];
      }
    });

    const response = await axiosClient.get('/employees-with-schedule-overrides', {
      params: {
        ...apiParams,
        _: Date.now(),
      },
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    const payload = response.data ?? {};
    const employees = payload.data ?? [];
    const meta = payload.meta ?? {};

    const flattened = employees.flatMap((employee) => {
      const overrides = employee?.schedule_overrides ?? [];
      const applicant = employee?.applicant ?? {};
      const employeeDisplayName =
        applicant.full_name ||
        applicant.full_name_ar ||
        [applicant.first_name, applicant.middle_name, applicant.last_name]
          .map((part) => String(part || '').trim())
          .filter(Boolean)
          .join(' ') ||
        employee.name ||
        'Unknown Employee';

      return overrides.map((override) => ({
        id:
          override.id ??
          override.schedule_override_id ??
          override.override_id ??
          override.schedule_override?.id,

        employee_id: override.employee_id ?? employee.id,

        employee: {
          id: employee.id,
          name: employeeDisplayName,
          full_name: applicant.full_name || employeeDisplayName,
          full_name_ar: applicant.full_name_ar || '',
          employee_name: employeeDisplayName,
          applicant,
          position: employee.position || null,
          position_id: employee.position_id ?? employee.position?.id ?? null,
          code: employee.code,
        },

        date: override.date,
        from_date: override.from_date || override.fromDate || override.date,
        to_date: override.to_date || override.toDate || override.date,
        start_time: override.start_time,
        end_time: override.end_time,
        reason: override.reason ?? '',
        status: override.status || 'pending',
        created_at: override.created_at,
        updated_at: override.updated_at,
      }));
    });

    const employeeScoped = _params.employee_id
      ? flattened.filter((item) => String(item.employee_id) === String(_params.employee_id))
      : flattened;

    // Manual pagination: return already paginated overrides.
    const total = employeeScoped.length;
    const lastPage = Math.max(1, Math.ceil(total / requestedPageSize));
    const safePage = Math.min(Math.max(1, requestedPage), lastPage);

    const start = (safePage - 1) * requestedPageSize;
    const end = start + requestedPageSize;
    const paged = employeeScoped.slice(start, end);

    return {
      data: paged,
      meta: {
        current_page: safePage,
        last_page: lastPage,
        per_page: requestedPageSize,
        total,

        // keep original backend meta (useful for debugging, not relied on by UI)
        source_meta: meta,
      },
    };
  },

  getExceptionById: async (id) => {
    const response = await axiosClient.get(`/schedule-overrides/${id}`);
    return response.data;
  },

  createException: async (data) => {
    if (Array.isArray(data.employee_ids) && data.employee_ids.length > 0) {
      const promises = data.employee_ids.map((employeeId) => {
        const payload = {
          employee_id: Number(employeeId),
          from_date: data.from_date,
          to_date: data.to_date,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason ?? '',
          status: data.status || 'pending',
        };

        return axiosClient.post('/schedule-overrides', payload);
      });

      const responses = await Promise.all(promises);
      return responses.map((res) => res.data);
    }

    const payload = {
      employee_id: Number(data.employee_ids),
      from_date: data.from_date,
      to_date: data.to_date,
      start_time: data.start_time,
      end_time: data.end_time,
      reason: data.reason ?? '',
      status: data.status || 'pending',
    };

    const response = await axiosClient.post('/schedule-overrides', payload);
    return response.data;
  },

  updateException: async ({ employee_id, employee_ids, from_date, to_date, data }) => {
    const targetEmployeeIds =
      Array.isArray(employee_ids) && employee_ids.length > 0
        ? employee_ids
        : employee_id
          ? [employee_id]
          : [];

    if (!targetEmployeeIds.length) {
      throw new Error('employee_id is required');
    }

    if (!from_date || !to_date) {
      throw new Error('from_date and to_date are required');
    }

    const promises = targetEmployeeIds.map((empId) =>
      axiosClient.patch(
        `/schedule-overrides?from_date=${encodeURIComponent(
          from_date
        )}&to_date=${encodeURIComponent(to_date)}`,
        {
          employee_id: Number(empId),
          start_time: data?.start_time ?? '',
          end_time: data?.end_time ?? '',
          reason: data?.reason ?? '',
          status: data?.status || 'pending',
        }
      )
    );

    const responses = await Promise.all(promises);
    return responses.map((res) => res.data);
  },

  deleteException: async ({ employee_id, employee_ids, from_date, to_date }) => {
    const targetEmployeeIds =
      Array.isArray(employee_ids) && employee_ids.length > 0
        ? employee_ids
        : employee_id
          ? [employee_id]
          : [];

    if (!targetEmployeeIds.length) {
      throw new Error('employee_id is required');
    }

    if (!from_date || !to_date) {
      throw new Error('from_date and to_date are required');
    }

    const promises = targetEmployeeIds.map((empId) =>
      axiosClient.delete(
        `/schedule-overrides/${encodeURIComponent(
          empId
        )}?from_date=${encodeURIComponent(from_date)}&to_date=${encodeURIComponent(to_date)}`
      )
    );

    const responses = await Promise.all(promises);
    return responses.map((res) => res.data);
  },
};

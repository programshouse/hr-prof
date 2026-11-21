import axiosClient from '@/services/http/axiosClient';

export const salariesApi = {
  // summary endpoint supports year/month/department_id
  getSalarySummary: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.year) params.append('year', filters.year);
    if (filters.month) params.append('month', filters.month);

    if (filters.department_id && filters.department_id !== 'all') {
      params.append('department_id', filters.department_id);
    }

    const response = await axiosClient.get(`/salary/summary?${params.toString()}`);
    return response.data;
  },

  getSalariesTable: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.year) params.append('year', filters.year);
    if (filters.month) params.append('month', filters.month);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('limit', filters.pageSize);
    if (filters.search) params.append('keyword', filters.search);

    if (filters.shift_id && filters.shift_id !== 'all') {
      params.append('shift', filters.shift_id);
    }

    if (filters.position_id && filters.position_id !== 'all') {
      params.append('position', filters.position_id);
    }

    if (filters.department_id && filters.department_id !== 'all') {
      params.append('department', filters.department_id);
    }

    if (filters.branch_id && filters.branch_id !== 'all') {
      params.append('branch', filters.branch_id);
    }

    const response = await axiosClient.get(
      `/salaries-employee-table?${params.toString()}`
    );

    return response.data;
  },
  getEmployeeRewards: async (employeeId, year, month) => {
    const params = new URLSearchParams();

    if (year) params.append('year', year);
    if (month) params.append('month', month);

    const response = await axiosClient.post(`/sheet-rewards/${employeeId}?${params.toString()}`);
    return response.data;
  },

  getEmployeePenalties: async (employeeId, year, month) => {
    const params = new URLSearchParams();

    if (year) params.append('year', year);
    if (month) params.append('month', month);

    const response = await axiosClient.post(`/sheet-penalties/${employeeId}?${params.toString()}`);
    return response.data;
  },

  getEmployeeDeductions: async (employeeId, year, month) => {
    const params = new URLSearchParams();

    if (employeeId) params.append('employee_id', employeeId);
    if (year && month) {
      params.append('month', `${year}-${String(month).padStart(2, '0')}`);
    }

    const response = await axiosClient.get(`/deductions?${params.toString()}`);
    return response.data;
  },

  getEmployeePayrollSheet: async (employeeId, year, month) => {
    const params = new URLSearchParams();

    if (year) params.append('year', year);
    if (month) params.append('month', month);

    const response = await axiosClient.get(
      `/salary/${employeeId}/payroll-sheet?${params.toString()}`
    );

    return response.data;
  },

  getAcceptedOvertime: async (year, month, employeeId) => {
    const params = new URLSearchParams();

    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (employeeId) params.append('employee_ids[]', employeeId);

    const response = await axiosClient.get(`/accepted-overtime-sheet?${params.toString()}`);
    return response.data;
  },

  getKpiSheet: async (year, month, employeeId) => {
    const params = new URLSearchParams();

    if (year) params.append('year', year);
    if (month) params.append('month', month);

    if (employeeId) {
      params.append('employee_ids[]', employeeId);
    }

    const response = await axiosClient.get(`/kpi-sheet?${params.toString()}`);
    return response.data;
  },

  postSalaryAdjustment: async (employeeId, data) => {
    const formData = new FormData();

    formData.append('month', data.month);
    formData.append('bonus', Number(data.bonus ?? 0));
    formData.append('deduction', Number(data.deduction ?? 0));

    if (data.note) {
      formData.append('note', data.note);
    }

    const response = await axiosClient.post(`/${employeeId}/salary-adjustment`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getAllSalaryUpdates: async () => {
    const response = await axiosClient.get('/salary-changes/all-employees');
    return response.data;
  },

  getSalaryChanges: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('keyword', filters.search);

    if (filters.department_id && filters.department_id !== 'all') {
      params.append('department_id', filters.department_id);
    }

    if (filters.company_id && filters.company_id !== 'all') {
      params.append('company_id', filters.company_id);
    }

    if (filters.branch_id && filters.branch_id !== 'all') {
      params.append('branch_id', filters.branch_id);
    }

    if (filters.shift_id && filters.shift_id !== 'all') {
      params.append('shift_id', filters.shift_id);
    }

    if (filters.month) {
      params.append('month', filters.month);
    }

    const response = await axiosClient.get(
      `/salary-changes/all-employees?${params.toString()}`
    );

    return response.data;
  },

  createSalaryChange: async (data, employeeId) => {
    const response = await axiosClient.post(`/${employeeId}/salary-changes`, data);
    return response.data;
  },

  updateSalaryChange: async (id, data) => {
    const response = await axiosClient.put(`/salary-changes/${id}`, data);
    return response.data;
  },

  deleteSalaryChange: async (id) => {
    const response = await axiosClient.delete(`/salary-changes/${id}`);
    return response.data;
  },

  getSalaryChange: async (id) => {
    const response = await axiosClient.get(`/salary-changes/${id}`);
    return response.data;
  },

  getEmployeeSalaryHistory: async (employeeId, filters = {}) => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const query = params.toString();

    const response = await axiosClient.get(
      `/${employeeId}/salary-history${query ? `?${query}` : ''}`
    );

    return response.data;
  },

  getSalarySheet: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.year) params.append('year', filters.year);
    if (filters.month) params.append('month', filters.month);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('per_page', filters.pageSize);
    if (filters.search) params.append('keyword', filters.search);

    if (filters.shift_id && filters.shift_id !== 'all') {
      params.append('shift_id', filters.shift_id);
    }

    if (filters.position_id && filters.position_id !== 'all') {
      params.append('position_id', filters.position_id);
    }

    if (filters.department_id && filters.department_id !== 'all') {
      params.append('department_id', filters.department_id);
    }

    if (filters.branch_id && filters.branch_id !== 'all') {
      params.append('branch_id', filters.branch_id);
    }

    if (filters.contract_type && filters.contract_type !== 'all') {
      params.append('contract_type', filters.contract_type);
    }

    const response = await axiosClient.get(`/account-payroll-sheet?${params.toString()}`);
    return response.data;
  },

  lockMonth: async ({ year, month }) => {
    const response = await axiosClient.post('/month-lock', {
      year,
      month,
    });

    return response.data;
  },

  publishMonth: async ({
    year,
    month,
    companyId,
    company_id,
    departmentId,
    department_id,
    departmentIds,
    department_ids,
    day,
    publish_day,
    date,
    publish_date,
    publishDate,
    exceptEmployees = [],
    except_employee_ids,
    autoLock = true,
  }) => {
    const resolvedCompanyId = company_id ?? companyId;
    const resolvedDepartmentId = department_id ?? departmentId;
    const resolvedDepartmentIds = department_ids ?? departmentIds;
    const resolvedPublishDate =
      publish_date ??
      publishDate ??
      date ??
      (day && year && month
        ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        : undefined);

    const resolvedExceptIds = (except_employee_ids ?? exceptEmployees ?? [])
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0);

    const payload = {
      year: Number(year),
      month: Number(month),
      company_id: resolvedCompanyId ? Number(resolvedCompanyId) : 1,
      publish_date: resolvedPublishDate,
      except_employee_ids: resolvedExceptIds,
    };

      if (
        Array.isArray(resolvedDepartmentIds) &&
        resolvedDepartmentIds.length > 0 &&
        !resolvedDepartmentIds.includes('all')
      ) {
        payload.department_ids = resolvedDepartmentIds.map(Number);
        if (resolvedDepartmentIds.length === 1) {
          payload.department_id = Number(resolvedDepartmentIds[0]);
        }
      } else if (resolvedDepartmentId && resolvedDepartmentId !== 'all') {
        payload.department_id = Number(resolvedDepartmentId);
      }

      const tryLockMonth = async () => {
        try {
          await axiosClient.post('/month-lock', {
            year: Number(year),
            month: Number(month),
            company_id: resolvedCompanyId ? Number(resolvedCompanyId) : 1,
          });
          return true;
        } catch (lockError) {
          console.warn('Auto lockMonth failed:', lockError);
          return false;
        }
      };

      let response;
      try {
        const res = await axiosClient.post('month-publish', payload);
        response = res.data;
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || '';

        if (autoLock && /month record not found/i.test(message)) {
          const locked = await tryLockMonth();
          if (locked) {
            const retryRes = await axiosClient.post('month-publish', payload);
            return retryRes.data;
          }
        }
        throw err;
      }

      if (
        response?.status === false &&
        autoLock &&
        /month record not found/i.test(response?.message || '')
      ) {
        const locked = await tryLockMonth();
        if (locked) {
          const retryRes = await axiosClient.post('month-publish', payload);
          return retryRes.data;
        }
      }

      return response;
    },
    // Freelance hourly payroll sheet
    getAccountPayrollFreelanceSheet: async ({
      year,
      month,
      page = 1,
      pageSize = 50,
      search = '',
      department_id = '',
      payment_date = '',
    } = {}) => {
      const response = await axiosClient.get('/account-payroll-freelance-sheet', {
        params: {
          year,
          month,
          page,
          per_page: pageSize,
          search: search || undefined,
          payment_date: payment_date || undefined,
          department_id:
            department_id && department_id !== 'all' ? department_id : undefined,
        },
      });

      return response.data;
    },

      // Freelance task-based payroll sheet
      getFreelanceTasksSheet: async ({
        year,
        month,
        search = '',
        department_id = '',
        payment_date = '',
      } = {}) => {
        const params = {
          year: Number(year),
          month: Number(month),
        };

        if (search) {
          params.keyword = search;
        }

        if (department_id && department_id !== 'all') {
          params.department_id = department_id;
        }

        if (payment_date) {
          params.payment_date = payment_date;
        }

        const response = await axiosClient.get('/account-payroll-tasks-sheet', {
          params,
        });

        return response.data;
      },

        // Single freelance employee monthly tasks
        getFreelanceEmployeeMonthlyTasks: async ({
          employeeId,
          year,
          month,
        } = {}) => {
          const response = await axiosClient.get('/freelance-employee-tasks/monthly', {
            params: {
              year: Number(year),
              month: Number(month),
              employee_id: employeeId,
            },
          });

          return response.data;
        },

          // Salary overtime summary
          getOvertimeSummary: async ({
            year,
            month,
            companyId = '',
          } = {}) => {
            const response = await axiosClient.get('/payroll/overtime-summary', {
              params: {
                year: Number(year),
                month: Number(month),
                company_id: companyId ? Number(companyId) : undefined,
              },
            });

            return response.data;
          },

            adjustTotalPayroll: async ({ year, month, amount }) => {
              const response = await axiosClient.post('/adjust-total-payroll', {
                year: Number(year),
                month: Number(month),
                amount: Number(amount),
              });

              return response.data;
            },
};
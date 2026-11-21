import axiosClient from '@/services/http/axiosClient';
import { buildEmployeeFormData } from '../utils/buildEmployeeFormData';
import { useAuthStore } from '@/services/auth/auth.store';

const isEmployeePortalLogin = () =>
  useAuthStore.getState()?.authSource === 'employee-login';

export const employeesApi = {
getEmployees: async (params = {}) => {
  const {
    page,
    limit,
    search,
    end_date_from,
    end_date_to,
    join_date_from,
    join_date_to,
    ...rest
  } = params;


  const apiParams = {
    ...(page && { page }),
    ...(limit && { limit }),

    // Search
    ...(search && {
      keyword: search,
    }),

    // End date filter
    ...(end_date_from && {
      end_date_from,
    }),

    ...(end_date_to && {
      end_date_to,
    }),

    // Join date filter
    ...(join_date_from && {
      join_date_from,
    }),

    ...(join_date_to && {
      join_date_to,
    }),

    // Remaining filters
    ...rest,
  };


  const response = await axiosClient.get(
    '/employees',
    {
      params: apiParams,
    }
  );


  return response.data;
},

  // getEmployee: async (id) => {
  //   const response = await axiosClient.get(`/employees/${id}`);
  //   return response.data;
  // },

  getPersonalData: async (id) => {
    const response = await axiosClient.get(`/personal-data/${id}`);
    return response.data?.data;
  },

  updatePersonalData: async ({ id, values }) => {
    const formData = buildEmployeeFormData(values);
    formData.append('_method', 'PATCH');

    const response = await axiosClient.post(`/personal-data/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  createEmployee: async (values) => {
    const formData = buildEmployeeFormData(values);

    const response = await axiosClient.post('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  updateEmployee: async ({ id, values }) => {
    const formData = buildEmployeeFormData(values);
    formData.append('_method', 'PUT');

    const response = await axiosClient.post(`/employees/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await axiosClient.delete(`/employees/${id}`);
    return response.data;
  },

getProfileCards: async (employeeId, filters = {}) => {
  try {
    const from = filters?.from || '';
    const to = filters?.to || '';

    const endpoint = isEmployeePortalLogin()
      ? '/profile-cards'
      : `/profile-cards/${employeeId}`;

    if (from || to) {
      const response = await axiosClient.get(endpoint, {
        params: { from, to },
      });

      console.log('Profile cards response:', response.data);

      return response.data;
    }

    const now = new Date();

    const year =
      filters?.year ??
      now.getFullYear();

    const month =
      filters?.month ??
      now.getMonth() + 1;

    const response = await axiosClient.get(endpoint, {
      params: {
        year,
        month,
      },
    });

    console.log(
      'Profile cards response (fallback):',
      response.data
    );

    return response.data;
  } catch (error) {
    console.error(
      'Profile cards API error:',
      error
    );

    throw error;
  }
},

  getHolidays: async (employeeId) => {
    if (isEmployeePortalLogin()) {
      const response = await axiosClient.get('/holidays', {
        params: { employee_id: employeeId, limit: 10000 },
      });
      return response.data;
    }

    try {
      const response = await axiosClient.get(`/holidays/${employeeId}/contract`);
      console.log('Holidays API response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Contract endpoint failed, trying standard holidays endpoint');
      const response = await axiosClient.get(`/holidays/${employeeId}`);
      console.log('Standard holidays API response:', response.data);
      return response.data;
    }
  },

  getHolidayDetails: async (employeeId) => {
    const response = await axiosClient.get(`/sheet_holidays/${employeeId}`);
    console.log('Holiday details API response:', response.data);
    return response.data;
  },

  getExceptionalHolidaysHistory: async (employeeId) => {
    const response = await axiosClient.get(`/exceptional-holidays-history/${employeeId}`);
    console.log('Exceptional holidays history API response:', response.data);
    return response.data;
  },

  getSettleHolidaysHistory: async (employeeId) => {
    const response = await axiosClient.get(`/settle-holidays-history/${employeeId}`);
    console.log('Settle holidays history API response:', response.data);
    return response.data;
  },

  addSettleCashout: async (employeeId, formData) => {
    const response = await axiosClient.post(`/add-settle-cashout/${employeeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Add settle cashout API response:', response.data);
    return response.data;
  },

  deleteExceptionalHoliday: async (employeeId, holidayId) => {
    const response = await axiosClient.delete(`/leave-adjustments/${employeeId}/${holidayId}`);
    console.log('Delete exceptional holiday API response:', response.data);
    return response.data;
  },

  deleteSettleHoliday: async (employeeId, holidayId) => {
    const response = await axiosClient.delete(`/leave-adjustments/${employeeId}/${holidayId}`);
    console.log('Delete settle holiday API response:', response.data);
    return response.data;
  },

  makeEmployeeInactive: async (employeeId) => {
    const response = await axiosClient.patch(`${employeeId}/inactivate`);
    return response.data;
  },

  makeEmployeeActive: async (employeeId) => {
    const response = await axiosClient.patch(`${employeeId}/activate`);
    return response.data;
  },

  getInactiveEmployees: async (params) => {
    const response = await axiosClient.get('/inactive-employees', { params });
    return response.data;
  },

  getTotalEmployees: async (params) => {
    const response = await axiosClient.get('/total-employees', { params });
    return response.data;
  },

getEmployeeTotalHolidays: async (employeeId) => {
  // Employee Portal
  if (isEmployeePortalLogin()) {
    const response = await axiosClient.get('/total-holidays');

    console.log(
      'Employee portal total holidays API response:',
      response.data
    );

    return response.data;
  }

  // HR / Admin
  const response = await axiosClient.get(
    `/${employeeId}/employee-total-holidays`
  );

  console.log(
    'HR employee total holidays API response:',
    response.data
  );

  return response.data;
},

  getEmployeeKpiMonths: async (employeeId) => {
    const response = await axiosClient.get(`/${employeeId}/kpi-months`);
    console.log('Employee KPI months API response:', response.data);
    return response.data;
  },

  // Employee portal request lists use the normal collection GET endpoints,
  // scoped to the authenticated employee. HR keeps the existing profile routes.
  getEmployeeLeaves: async (employeeId) => {
    if (isEmployeePortalLogin()) {
      const { leavesApi } = await import('@/features/leaves/api/leaves.api');
      return leavesApi.getLeaves({ employee_id: employeeId, limit: 10000 });
    }
    const response = await axiosClient.get(`/${employeeId}/all-leaves`);
    return response.data;
  },

  getEmployeeLoans: async (employeeId) => {
    if (isEmployeePortalLogin()) {
      const { loansApi } = await import('@/features/loans/api/loans.api');
      return loansApi.getLoans({ employee_id: employeeId, limit: 10000 });
    }
    const response = await axiosClient.get(`/${employeeId}/all-loans`);
    return response.data;
  },

  getEmployeeRemotely: async (employeeId) => {
    if (isEmployeePortalLogin()) {
      const { remotelyApi } = await import('@/features/remotely/api/remotely.api');
      return remotelyApi.getRemotelyList({ employee_id: employeeId, limit: 10000 });
    }
    const response = await axiosClient.get(`/${employeeId}/all-remote-days`);
    return response.data;
  },

  getEmployeeOvertimes: async (employeeId) => {
    if (isEmployeePortalLogin()) {
      const { overtimeApi } = await import('@/features/overtime/api/overtime.api');
      return overtimeApi.getOvertimeRequests({ employee_id: employeeId, limit: 10000 });
    }
    const response = await axiosClient.get(`/${employeeId}/all-over-times`);
    return response.data;
  },

  getEmployeeBranchTransfers: async (employeeId) => {
    if (isEmployeePortalLogin()) {
      const { branchTransfersApi } = await import('@/features/branch-transfers/api/branch-transfers.api');
      return branchTransfersApi.getBranchTransfers({ employee_id: employeeId, limit: 10000 });
    }
    const response = await axiosClient.get(`/${employeeId}/all-branch-transfers`);
    return response.data;
  },

  getEmployeeResignations: async (employeeId) => {
    if (isEmployeePortalLogin()) {
      const { resignationsApi } = await import('@/features/resignations/api/resignations.api');
      return resignationsApi.getResignations({ employee_id: employeeId, limit: 10000 });
    }
    const response = await axiosClient.get(`/${employeeId}/all-resignations`);
    return response.data;
  },

  getEmployeeSalary: async (employeeId) => {
    const response = await axiosClient.get(`/${employeeId}/all-salary-months`);
    console.log('Employee salary API response:', response.data);
    return response.data;
  },

  getEmployeeImage: async (id) => {
    if (!id) throw new Error('Employee id is required');
    const res = await axiosClient.get(`/employees/${id}/image`);
    return res.data;
  },

  getManagerTeamMembers: async (manager_id, page = 1, perPage = 10, search = '') => {
    const params = {
      page,
      per_page: perPage,
    };

    if (search) params.search = search;

    const response = await axiosClient.get(`/team-members/${manager_id}`);
    return response.data;
  },

  uploadEmployeeImage: async (id, file) => {
    if (!id) throw new Error('Employee id is required');
    if (!file) throw new Error('Image file is required');

    const formData = new FormData();
    formData.append('image', file);

    const res = await axiosClient.post(`/upload-image/${id}`, formData);
    return res.data;
  },

  getTeamRecords: async (managerId, module = null) => {
    const params = { manager_id: managerId };
    if (module) params.module = module;

    const response = await axiosClient.get('/team-records', { params });
    console.log(`Team records API response (module: ${module || 'all'}):`, response.data);
    return response.data;
  },

  // =========================
  // Fixed update methods
  // React Query mutationFn receives ONE object only
  // =========================
  updateLeaveRequest: async ({ id, data }) => {
    const response = await axiosClient.patch(`/leaves/${id}`, data);
    console.log('Update leave request API response:', response.data);
    return response.data;
  },

  deleteLeaveRequest: async (id) => {
    const response = await axiosClient.delete(`/leaves/${id}`);
    console.log('Delete leave request API response:', response.data);
    return response.data;
  },

  updateLoanRequest: async ({ id, data }) => {
    const response = await axiosClient.patch(`/loans/${id}`, data);
    console.log('Update loan request API response:', response.data);
    return response.data;
  },

  deleteLoanRequest: async (id) => {
    const response = await axiosClient.delete(`/loans/${id}`);
    console.log('Delete loan request API response:', response.data);
    return response.data;
  },

  updateRemotelyRequest: async ({ id, data }) => {
    const response = await axiosClient.patch(`/remotely/${id}`, data);
    console.log('Update remotely request API response:', response.data);
    return response.data;
  },

  deleteRemotelyRequest: async (id) => {
    const response = await axiosClient.delete(`/remotely/${id}`);
    console.log('Delete remotely request API response:', response.data);
    return response.data;
  },

  updateOvertimeRequest: async ({ id, data }) => {
    const response = await axiosClient.patch(`/overtime/${id}`, data);
    console.log('Update overtime request API response:', response.data);
    return response.data;
  },

  deleteOvertimeRequest: async (id) => {
    const response = await axiosClient.delete(`/overtime/${id}`);
    console.log('Delete overtime request API response:', response.data);
    return response.data;
  },

  updateBranchTransferRequest: async ({ id, data }) => {
    const response = await axiosClient.patch(`/branch-transfers/${id}`, data);
    console.log('Update branch transfer request API response:', response.data);
    return response.data;
  },

  deleteBranchTransferRequest: async (id) => {
    const response = await axiosClient.delete(`/branch-transfers/${id}`);
    console.log('Delete branch transfer request API response:', response.data);
    return response.data;
  },

  updateResignationRequest: async ({ id, data }) => {
    const response = await axiosClient.patch(`/resignations/${id}`, data);
    console.log('Update resignation request API response:', response.data);
    return response.data;
  },

  deleteResignationRequest: async (id) => {
    const response = await axiosClient.delete(`/resignations/${id}`);
    console.log('Delete resignation request API response:', response.data);
    return response.data;
  },

  updateMeetingRequest: async ({ id, data }) => {
    const response = await axiosClient.patch(`/meetings/${id}`, data);
    console.log('Update meeting request API response:', response.data);
    return response.data;
  },

  deleteMeetingRequest: async (id) => {
    const response = await axiosClient.delete(`/meetings/${id}`);
    console.log('Delete meeting request API response:', response.data);
    return response.data;
  },
};
// src/features/attendance/api/attendanceApi.js
import axiosClient from '@/services/http/axiosClient';
import { getDeviceLocation } from '@/features/attendance/utils/getDeviceLocation';

function formatDate(date) {
  if (!date) return undefined;

  if (typeof date === 'string') {
    return date.includes('T') ? date.slice(0, 10) : date;
  }

  return date.toISOString().slice(0, 10);
}

/**
 * Gets the device's current GPS position including altitude.
 * Uses watchPosition-based detection so altitude has time to arrive.
 */
async function getCurrentPosition() {
  const pos = await getDeviceLocation();
  return {
    lat: pos.lat,
    lng: pos.lng,
    accuracy: pos.accuracy,
    altitude: pos.altitude,
    altitude_accuracy: pos.altitudeAccuracy,
  };
}

export const attendanceApi = {
  getDailyReport: async (
    date,
    page = 1,
    department = '',
    keyword = '',
    branch = '',
    perPage = 10
  ) => {
    const params = {
      day: date,
      page,
      department: department !== 'all' ? department : undefined,
      keyword: keyword || undefined,
      branch: branch && branch !== 'all' ? branch : undefined,
      limit: perPage, // Backend expects limit for this endpoint
      per_page: perPage, // Try both limit and per_page
      size: perPage, // Also try size parameter
    };
    
    console.log('🔍 Attendance API call params:', params);
    
    const response = await axiosClient.get('/daily-report', {
      params,
    });
    console.log(' Attendance API response:', response.data);
    console.log(' Response data length:', response.data?.data?.length || response.data?.attendances?.data?.length || 'N/A');
    return response.data;
  },

  getMonthlyReport: async (
    month,
    from,
    to,
    company = '',
    branch = '',
    keyword = '',
    name_code_phone = '',
    page = 1,
    perPage = 10
  ) => {
    const response = await axiosClient.get(`/monthly-report/${month}`, {
      params: {
        month: month || undefined,
        from: formatDate(from),
        to: formatDate(to),
        department_id: company && company !== 'all' ? company : undefined,
        // Backend filters by `branch` on some deployments; keep `branch_id` for compatibility.
        branch: branch && branch !== 'all' ? branch : undefined,
        branch_id: branch && branch !== 'all' ? branch : undefined,
        keyword: keyword || undefined,
        name_code_phone: name_code_phone || undefined,
        page,
        limit: perPage, // Changed from per_page to limit
      },
    });
    return response.data;
  },
  getPartTimeMonthlyReport: async (
    month,
    from,
    to,
    company = '',
    branch = '',
    keyword = '',
    name_code_phone = '',
    page = 1,
    perPage = 10
  ) => {
    const response = await axiosClient.get(`/part-time-monthly-report/${month}`, {
      params: {
        month: month || undefined,
        from: formatDate(from),
        to: formatDate(to),
        department_id: company && company !== 'all' ? company : undefined,
        // Backend filters by `branch` on some deployments; keep `branch_id` for compatibility.
        branch: branch && branch !== 'all' ? branch : undefined,
        branch_id: branch && branch !== 'all' ? branch : undefined,
        keyword: keyword || undefined,
        name_code_phone: name_code_phone || undefined,
        page,
        limit: perPage, // Changed from per_page to limit
      },
    });
    return response.data;
  },

  createAttendance: async (data) => {
    const response = await axiosClient.post('/attendances', data);
    return response.data;
  },
  // POST /check-in — sends the live lat/lng exactly as the backend
  // expects (multipart/form-data, `lat` & `lng` field names). The
  // check-in date/time itself is computed by the server; `date`/`time`
  // are passed along only as extra context and are safe to omit.
  // If lat/lng/altitude are not provided, they are fetched automatically
  // from the browser's Geolocation API.
  checkIn: async ({
    employee_id,
    date,
    time,
    lat,
    lng,
    accuracy,
    altitude,
    altitude_accuracy,
  } = {}) => {
    // Need live location; if the caller did not pass both coords, fetch and
    // hydrate them. Altitude is optional, but when we can resolve it we include it.
    if (lat == null || lng == null) {
      const pos = await getCurrentPosition();
      lat = lat ?? pos.lat;
      lng = lng ?? pos.lng;
      accuracy = accuracy ?? pos.accuracy;
      altitude = altitude ?? pos.altitude;
      altitude_accuracy = altitude_accuracy ?? pos.altitude_accuracy;
    }

    const formData = new FormData();

    if (employee_id !== undefined && employee_id !== null) {
      formData.append('employee_id', employee_id);
    }
    if (date) formData.append('date', date);
    if (time) formData.append('time', time);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (accuracy !== undefined && accuracy !== null) {
      formData.append('accuracy', accuracy);
    }
    if (altitude !== undefined && altitude !== null) {
      formData.append('altitude', altitude);
    }
    if (altitude_accuracy !== undefined && altitude_accuracy !== null) {
      formData.append('altitude_accuracy', altitude_accuracy);
    }

    const response = await axiosClient.post('/check-in', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  // POST /check-out — same contract as check-in above.
  checkOut: async ({
    employee_id,
    date,
    time,
    lat,
    lng,
    accuracy,
    altitude,
    altitude_accuracy,
  } = {}) => {
    // Need live location; if the caller did not pass both coords, fetch and
    // hydrate them. Altitude is optional, but when we can resolve it we include it.
    if (lat == null || lng == null) {
      const pos = await getCurrentPosition();
      lat = lat ?? pos.lat;
      lng = lng ?? pos.lng;
      accuracy = accuracy ?? pos.accuracy;
      altitude = altitude ?? pos.altitude;
      altitude_accuracy = altitude_accuracy ?? pos.altitude_accuracy;
    }

    const formData = new FormData();

    if (employee_id !== undefined && employee_id !== null) {
      formData.append('employee_id', employee_id);
    }
    if (date) formData.append('date', date);
    if (time) formData.append('time', time);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (accuracy !== undefined && accuracy !== null) {
      formData.append('accuracy', accuracy);
    }
    if (altitude !== undefined && altitude !== null) {
      formData.append('altitude', altitude);
    }
    if (altitude_accuracy !== undefined && altitude_accuracy !== null) {
      formData.append('altitude_accuracy', altitude_accuracy);
    }

    const response = await axiosClient.post('/check-out', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
  updateAttendance: async ({ id, data }) => {
    const response = await axiosClient.patch(`/attendances/${id}`, data);
    return response.data;
  },

  deleteAttendance: async ({ employee_id, date, delete_logs = false }) => {
    const response = await axiosClient.delete(`/attendances`, {
      data: { employee_id, date, delete_logs },
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  // Daily summary cards (present/away/absent) for a date range
  getDailySummaryCards: async ({ from, to, branch = '' } = {}) => {
    const response = await axiosClient.get('/attendance/daily-summary-cards', {
      params: {
        from,
        to,
        branch: branch && branch !== 'all' ? branch : undefined,
      },
    });
    return response.data;
  },

  // Monthly attendance summary for one employee (Daily Attendance Details table).
  // GET /summury-monthly-sheet?employee_id={id}&month=YYYY-MM
  // Response: { data: { employee_id, month, from, to, total_days, summary, rows } }
  getMonthlySummary: async (employeeId, month) => {
    const response = await axiosClient.get('/summury-monthly-sheet', {
      params: { employee_id: employeeId, month },
    });
    return response.data;
  },

  // Get team attendance data for a manager
  // GET /attendance?manager_id={id}&from={date}&to={date}&month={YYYY-MM}
  getTeamAttendance: async (
    managerId,
    from,
    to,
    month,
    page = undefined,
    perPage = undefined
  ) => {
    const params = {
      manager_id: managerId,
      from: formatDate(from),
      to: formatDate(to),
      month: month || undefined,
    };

    if (page !== undefined && page !== null) {
      params.page = page;
    }
    if (perPage !== undefined && perPage !== null) {
      params.limit = perPage;
    }
    
    const response = await axiosClient.get('/attendance', { params });
    return response.data;
  },

  // Get overtime sheet data
  // GET /attendance/overtime-sheet?year={year}&month={month}&page={page}&pageSize={pageSize}&filters...
getMonthAttendanceDetails: async ({
  employee_id,
  month,
  page = 1,
  pageSize = 20,
  ...filters
}) => {
  const params = {
    employee_id,
    month,
    page,
    pageSize,
    ...filters,
  };

  const response = await axiosClient.get('/month-attendance-details', { params });
  return response.data;
},

// Get overtime sheet data for all employees
// GET /month-attendance-details?year={year}&month={month}&page={page}&pageSize={pageSize}&filters...
getOvertimeSheet: async ({
  year,
  month,
  page = 1,
  pageSize = 20,
  ...filters
}) => {
  const params = {
    year,
    month: String(month).padStart(2, '0'),
    page,
    pageSize,
    ...filters,
  };

  const response = await axiosClient.get('/month-attendance-details', { params });
  return response.data;
},

  // Import fingerprint data from Excel file
  // POST /attendance/import-fingerprint with multipart/form-data
  importFingerprint: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post('/attendance/import-fingerprint', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

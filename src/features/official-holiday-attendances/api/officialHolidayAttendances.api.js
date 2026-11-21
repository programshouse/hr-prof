import axiosClient from '@/services/http/axiosClient';

const RESOURCE = '/official-holiday-attendances';

export const officialHolidayAttendancesApi = {
  getAll: async () => {
    const { data } = await axiosClient.get(RESOURCE);
    return data;
  },

  create: async ({ employee_ids, start_date, end_date, company_id, notes = '' }) => {
    const { data } = await axiosClient.post(
      RESOURCE,
      {
        employee_ids,
        start_date,
        end_date,
        company_id,
        notes,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return data;
  },

  update: async (id, { employee_ids, start_date, end_date, notes = '' }) => {
    const { data } = await axiosClient.put(
      `${RESOURCE}/${id}`,
      {
        employee_ids,
        start_date,
        end_date,
        notes,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return data;
  },

  delete: async (id) => {
    const { data } = await axiosClient.delete(`${RESOURCE}/${id}`);
    return data;
  },
};

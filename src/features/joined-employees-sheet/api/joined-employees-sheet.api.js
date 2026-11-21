import axiosClient from '@/services/http/axiosClient';
import { formatFilterDate } from '@/features/sheets/utils/dateFilter';

export const joinedEmployeesSheetApi = {
  get: async (params={}) => {
    const res = await axiosClient.get('/employees/joined-during-period', { params: {
      from_date: formatFilterDate(params.from) || undefined,
      to_date: formatFilterDate(params.to) || undefined,
      keyword: params.search || params.keyword || undefined,
      branch_id: params.branch_id || params.branch || undefined,
      department_id: params.department_id || params.department || undefined,
      position_id: params.position_id || params.position || undefined,
      shift_id: params.shift_id || params.shift || undefined,
      page: params.page || 1,
      per_page: params.per_page || 10,
    }});
    return res.data;
  },
};

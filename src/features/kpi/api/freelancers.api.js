import axiosClient from '@/services/http/axiosClient';

export const freelancersApi = {
  getFreelancersReport: async (params) => {
    const res = await axiosClient.get('/freelancer-employees', { params });
    return res.data; 
  },
  addFreelancersWorkedHours: async (data) => {
    const formData = new FormData();
    formData.append('employee_id', data.employee_id);
    formData.append('year', data.year);
    formData.append('month', data.month);
    formData.append('worked_hours', data.worked_hours);

    const res = await axiosClient.post('/add-freelancers-worked-hours', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

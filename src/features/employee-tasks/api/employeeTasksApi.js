import axiosClient from '@/services/http/axiosClient';

export const employeeTasksApi = {
  // Get all employee tasks with filters (supports shift_id, department_id, branch_id, keyword)
  getEmployeeTasks: async (filters = {}) => {
    const { data } = await axiosClient.get('/employee-tasks', { params: filters });
    return data;
  },

  // Get single employee task by ID
  getEmployeeTaskById: async (id) => {
    const { data } = await axiosClient.get(`/employee-tasks/${id}`);
    return data;
  },

  // Create new employee task (supports employee_ids array)
  createEmployeeTask: async (taskData) => {
    const { data } = await axiosClient.post('/employee-tasks', taskData);
    return data;
  },

  // Update employee task (JSON or multipart). Laravel often ignores multipart
  // bodies on real PUT; POST + _method=PUT is the standard workaround for files.
  updateEmployeeTask: async (id, taskData) => {
    if (typeof FormData !== 'undefined' && taskData instanceof FormData) {
      if (![...taskData.keys()].includes('_method')) {
        taskData.append('_method', 'PUT');
      }
      const { data } = await axiosClient.post(`/employee-tasks/${id}`, taskData);
      return data;
    }

    const { data } = await axiosClient.patch(`/employee-tasks/${id}`, taskData);
    return data;
  },

  // Delete employee task
  deleteEmployeeTask: async (id) => {
    const { data } = await axiosClient.delete(`/employee-tasks/${id}`);
    return data;
  },

  // Bulk update employee tasks
  bulkUpdateEmployeeTasks: async (tasks) => {
    const { data } = await axiosClient.put('/employee-tasks/bulk', { tasks });
    return data;
  },

  // Get employee task statistics
  getEmployeeTaskStats: async (filters = {}) => {
    const { data } = await axiosClient.get('/employee-tasks/stats', { params: filters });
    return data;
  },
};

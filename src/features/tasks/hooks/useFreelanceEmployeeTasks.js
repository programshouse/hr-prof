import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freelanceEmployeeTasksApi } from '../api/freelanceEmployeeTasksApi';
import { toast } from 'sonner';

export const freelanceEmployeeTasksKeys = {
  all: ['freelanceEmployeeTasks'],
  lists: () => [...freelanceEmployeeTasksKeys.all, 'list'],
  list: (filters) => [...freelanceEmployeeTasksKeys.lists(), filters],
  details: () => [...freelanceEmployeeTasksKeys.all, 'detail'],
  detail: (id) => [...freelanceEmployeeTasksKeys.details(), id],
};

export function useFreelanceEmployeeTasks(filters = {}) {
  return useQuery({
    queryKey: freelanceEmployeeTasksKeys.list(filters),
    queryFn: () => freelanceEmployeeTasksApi.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFreelanceEmployeeTask(id) {
  return useQuery({
    queryKey: freelanceEmployeeTasksKeys.detail(id),
    queryFn: () => freelanceEmployeeTasksApi.getTask(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateFreelanceEmployeeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: freelanceEmployeeTasksApi.createTask,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: freelanceEmployeeTasksKeys.lists() });
      toast.success(response?.message || 'Task added successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to add task');
    },
  });
}

export function useUpdateFreelanceEmployeeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => freelanceEmployeeTasksApi.updateTask(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: freelanceEmployeeTasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: freelanceEmployeeTasksKeys.detail(response.data?.id) });
      toast.success(response?.message || 'Task updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update task');
    },
  });
}

export function useDeleteFreelanceEmployeeTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: freelanceEmployeeTasksApi.deleteTask,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: freelanceEmployeeTasksKeys.lists() });
      toast.success(response?.message || 'Task deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete task');
    },
  });
}

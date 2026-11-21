import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasksApi';
import { toast } from 'sonner';

export const tasksKeys = {
  all: ['tasks'],
  lists: () => [...tasksKeys.all, 'list'],
  list: (filters) => [...tasksKeys.lists(), filters],
  details: () => [...tasksKeys.all, 'detail'],
  detail: (id) => [...tasksKeys.details(), id],
  comments: (id) => [...tasksKeys.detail(id), 'comments'],
};

export function useTasks(filters = {}) {
  return useQuery({
    queryKey: tasksKeys.list(filters),
    queryFn: () => tasksApi.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: tasksKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTaskComments(id) {
  return useQuery({
    queryKey: tasksKeys.comments(id),
    queryFn: () => tasksApi.getTaskComments(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      toast.success(response?.message || 'Task created successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => tasksApi.updateTask(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(response.data?.id) });
      toast.success(response?.message || 'Task updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update task');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      toast.success(response?.message || 'Task deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete task');
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => tasksApi.updateTaskStatus(id, status),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(response.data?.id) });
      toast.success(response?.message || 'Task status updated successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update task status');
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, assigneeId }) => tasksApi.assignTask(id, assigneeId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tasksKeys.detail(response.data?.id) });
      toast.success(response?.message || 'Task assigned successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to assign task');
    },
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }) => tasksApi.addTaskComment(id, comment),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.comments(response.data?.id) });
      toast.success(response?.message || 'Comment added successfully');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to add comment');
    },
  });
}

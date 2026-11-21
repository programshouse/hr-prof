import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeAssetsApi, employeeAssetsKeys } from "../api/employeeAssets.api";

export const useEmployeeAssets = (params = {}) => {
  return useQuery({
    queryKey: employeeAssetsKeys.list(params),
    queryFn: () => employeeAssetsApi.getAll(params),
    select: (data) => {
      const employeeAssets = data?.data || [];
      
      // If API doesn't include nested employee/asset data, we need to handle it here
      // For now, return as-is assuming backend will include the nested objects
      return employeeAssets;
    },
    keepPreviousData: true,
  });
};

export const useEmployeeAsset = (id) => {
  return useQuery({
    queryKey: employeeAssetsKeys.detail(id),
    queryFn: () => employeeAssetsApi.getById(id),
    enabled: !!id,
    select: (data) => data?.data,
  });
};

export const useCreateEmployeeAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeAssetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeAssetsKeys.lists() });
    },
  });
};

export const useUpdateEmployeeAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...payload }) => employeeAssetsApi.update(id, payload),
    onSuccess: () => {
      console.log('Update successful, invalidating cache...');
      // Invalidate all employee assets queries to force refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          // Invalidate any query that starts with "employeeAssets"
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'employeeAssets';
        }
      });
      console.log('Cache invalidated');
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });
};

export const useDeleteEmployeeAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeAssetsApi.delete,
    onSuccess: () => {
      // Invalidate all employee assets queries to force refetch
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          // Invalidate any query that starts with "employeeAssets"
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'employeeAssets';
        }
      });
    },
    onError: (error) => {
      console.error('Delete failed:', error);
    }
  });
};

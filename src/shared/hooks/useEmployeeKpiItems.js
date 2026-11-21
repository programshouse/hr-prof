import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { employeeKpiApi } from '@/features/kpi/api/employeeKpi.api';

export function useEmployeeKpiItems(employeeId) {
  const [kpiItems, setKpiItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKpiItems = async () => {
    if (!employeeId) {
      setKpiItems([]);
      return;
    }

    setIsLoading(true);
    try {
      // For now, we'll use the employee's kpi_items from the employee data
      // In the future, this could be a separate API call if needed
      // const response = await employeeKpiApi.getEmployeeKpiItems(employeeId);
      // const items = response?.data?.data || [];
      // setKpiItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to fetch employee KPI items:', err);
      setError(err);
      toast.error('Failed to load KPI items');
      setKpiItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createKpiItem = async (data) => {
    try {
      const response = await employeeKpiApi.createEmployeeKpiItem(employeeId, data);
      await fetchKpiItems();
      return response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to create employee KPI item:', err);
      throw err;
    }
  };

  const updateKpiItem = async (kpiItemId, data) => {
    try {
      const response = await employeeKpiApi.updateKpiItem(employeeId, kpiItemId, data);
      await fetchKpiItems();
      return response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to update employee KPI item:', err);
      throw err;
    }
  };

  const deleteKpiItem = async (kpiItemId) => {
    try {
      await employeeKpiApi.excludeKpiItem(employeeId, kpiItemId);
      await fetchKpiItems();
    } catch (err) {
      console.error('Failed to delete employee KPI item:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchKpiItems();
  }, [employeeId]);

  // Ensure we always return an array, even if kpiItems is undefined
  const safeKpiItems = Array.isArray(kpiItems) ? kpiItems : [];
  
  return {
    kpiItems: safeKpiItems,
    isLoading,
    error,
    createKpiItem,
    updateKpiItem,
    deleteKpiItem,
    refresh: fetchKpiItems
  };
}

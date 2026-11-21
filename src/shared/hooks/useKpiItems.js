import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import kpiApi from '@/features/settings/api/kpi.api';

export function useKpiItems(positionId) {
  const [kpiItems, setKpiItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKpiItems = async () => {
    if (!positionId) {
      setKpiItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await kpiApi.getAll(positionId);
      const items = response?.data?.data || [];
      setKpiItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to fetch KPI items:', err);
      setError(err);
      toast.error('Failed to load KPI items');
      setKpiItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createKpiItem = async (data) => {
    try {
      const response = await kpiApi.create({
        ...data,
        position_id: positionId
      });
      await fetchKpiItems();
      return response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to create KPI item:', err);
      throw err;
    }
  };

  const updateKpiItem = async (id, data) => {
    try {
      const response = await kpiApi.update(id, data);
      await fetchKpiItems();
      return response.data?.data || response.data;
    } catch (err) {
      console.error('Failed to update KPI item:', err);
      throw err;
    }
  };

  const deleteKpiItem = async (id) => {
    try {
      await kpiApi.delete(id);
      await fetchKpiItems();
    } catch (err) {
      console.error('Failed to delete KPI item:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchKpiItems();
  }, [positionId]);

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

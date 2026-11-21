import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { employeesApi } from '@/features/employees/api/employees.api';

export function useHolidays(employeeId) {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHolidays = useCallback(async () => {
    if (!employeeId) {
      setHolidays([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await employeesApi.getHolidays(employeeId);
      const data = response?.data?.data || [];
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
      setError(err);
      toast.error('Failed to load holidays');
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return {
    holidays,
    isLoading,
    error,
    refresh: fetchHolidays
  };
}

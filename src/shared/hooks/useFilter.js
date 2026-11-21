import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from './useDebounce';
import { formatDateToLocal } from '../utils/dateUtils';

function parseParamsToFilters(searchParams) {
  const obj = {};

  for (const [k, v] of searchParams.entries()) {
    if (v !== '' && v != null && v !== 'undefined') {
      obj[k] = v;
    }
  }

  return obj;
}

function writeFiltersToParams(filters) {
  const params = new URLSearchParams();

  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === 'undefined') return;
    if (v === '' || v === 'all') return;

    params.set(k, String(v));
  });

  return params;
}

export function useFilter(
  filtersProp,
  onFiltersChangeProp,
  searchKey = 'keyword',
  initialFilters = {}
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filtersRef = useRef(filtersProp);
  const onFiltersChangeRef = useRef(onFiltersChangeProp);
  const initialFiltersRef = useRef(initialFilters);

  useEffect(() => {
    filtersRef.current = filtersProp;
    onFiltersChangeRef.current = onFiltersChangeProp;
    initialFiltersRef.current = initialFilters;
  }, [filtersProp, onFiltersChangeProp, initialFilters]);

  const urlFilters = useMemo(() => parseParamsToFilters(searchParams), [searchParams]);
  const filters = filtersProp ?? urlFilters;

  const onFiltersChange = useCallback(
    (next) => {
      setSearchParams(writeFiltersToParams(next), { replace: true });

      if (onFiltersChangeRef.current) {
        onFiltersChangeRef.current(next);
      }
    },
    [setSearchParams]
  );

  const externalSearchValue = filters?.[searchKey] || '';
  const [searchTerm, setSearchTerm] = useState(externalSearchValue);

  useEffect(() => {
    setSearchTerm(externalSearchValue);
  }, [externalSearchValue]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;

    const latestFilters = filtersRef.current ?? urlFilters;
    const current = latestFilters?.[searchKey] || '';

    if (debouncedSearchTerm === current) return;

    const updatedFilters = {
      ...latestFilters,
      [searchKey]: debouncedSearchTerm,
      page: 1,
    };

    onFiltersChange(updatedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, searchTerm, searchKey]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);

    if (value.trim() === '') {
      const latestFilters = filtersRef.current ?? urlFilters;

      onFiltersChange({
        ...latestFilters,
        [searchKey]: '',
        page: 1,
      });
    }
  };

  const handleChange = (key, value) => {
    const latestFilters = filtersRef.current ?? urlFilters;

    onFiltersChange({
      ...(latestFilters || {}),
      [key]: value === 'all' || value === 'undefined' ? '' : value,
      page: 1,
    });
  };

  const handleDateChange = (key, date) => {
    const latestFilters = filtersRef.current ?? urlFilters;

    onFiltersChange({
      ...(latestFilters || {}),
      [key]: date ? formatDateToLocal(date) : '',
      page: 1,
    });
  };

  const handleReset = () => {
    const resetFilters = {
      ...initialFiltersRef.current,
      [searchKey]: '',
    };

    // Clear all filter values to empty strings for non-search keys
    Object.keys(resetFilters).forEach(key => {
      if (key !== searchKey) {
        resetFilters[key] = '';
      }
    });

    setSearchTerm('');
    onFiltersChange(resetFilters);
  };

  return {
    searchTerm,
    handleSearchChange,
    handleChange,
    handleDateChange,
    handleReset,
  };
}
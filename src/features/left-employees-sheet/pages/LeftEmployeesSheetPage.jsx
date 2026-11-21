import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

import { useMemo, useState, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/Pagination';

import PageSizeSelect from '@/components/shared/PageSizeSelect';
import { EmptyState } from '@/components/feedback/EmptyState';

import { MonthNavigation } from '@/features/fingerprintIssues/components/MonthNavigation.jsx';

import SheetFilters from '../../../features/sheets/components/SheetFilters.jsx';
import {
  formatFilterDate,
  getInitialSheetFilters,
  getMonthDateRange,
} from '@/features/sheets/utils/dateFilter';
import { leftEmployeesSheetApi } from '../api/left-employees-sheet.api';


const DEFAULT_FILTERS = {
  search: '',
  branch: 'all',
  department: 'all',
  position: 'all',
  shift: 'all',
  from: null,
  to: null,
};


const getMonthDate = (searchParams) => {
  const year =
    Number(searchParams.get('year')) ||
    new Date().getFullYear();

  const month =
    Number(searchParams.get('month')) ||
    new Date().getMonth() + 1;

  return new Date(year, month - 1, 1);
};


export default function LeftEmployeesSheetPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] =
    useSearchParams();


  const [filters, setFilters] = useState(() =>
    getInitialSheetFilters(searchParams, DEFAULT_FILTERS)
  );


  const page =
    Number(searchParams.get('page')) || 1;


  const pageSize =
    Number(searchParams.get('per_page')) || 10;


  const date = useMemo(
    () => getMonthDate(searchParams),
    [searchParams]
  );


  const changeDate = (newDate) => {
    const params =
      new URLSearchParams(searchParams);


    params.set(
      'month',
      newDate.getMonth() + 1
    );


    params.set(
      'year',
      newDate.getFullYear()
    );


    params.delete('page');

    setSearchParams(params);
  };


  const changePageSize = (value) => {
    const params =
      new URLSearchParams(searchParams);


    params.set(
      'per_page',
      value
    );


    params.delete('page');

    setSearchParams(params);
  };


  const changeFilter = useCallback(
    (key, value) => {
      const normalizedValue =
        key === 'from' || key === 'to'
          ? formatFilterDate(value) || null
          : value;

      setFilters((prev) => ({
        ...prev,
        [key]: normalizedValue,
      }));


      const params =
        new URLSearchParams(searchParams);


      if (normalizedValue && normalizedValue !== 'all') {
        params.set(key, normalizedValue);
      } else {
        params.delete(key);
      }


      params.delete('page');

      setSearchParams(params);

    },
    [searchParams, setSearchParams]
  );


  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({});
  };

  const monthRange = useMemo(
    () => getMonthDateRange(date),
    [date]
  );


  const { data, isLoading } = useQuery({

    queryKey: [
      'left-employees-sheet',
      page,
      pageSize,
      filters,
      date,
    ],


    queryFn: () =>
      leftEmployeesSheetApi.get({

        page,

        per_page: pageSize,


        from:
          formatFilterDate(filters.from) ||
          monthRange.from,


        to:
          formatFilterDate(filters.to) ||
          monthRange.to,


        keyword: filters.search,


        branch:
          filters.branch === 'all'
            ? ''
            : filters.branch,


        department:
          filters.department === 'all'
            ? ''
            : filters.department,


        position:
          filters.position === 'all'
            ? ''
            : filters.position,


        shift:
          filters.shift === 'all'
            ? ''
            : filters.shift,

      }),

  });


  const rows = data?.data || [];

  const meta = data?.meta || {};


  return (
    <div className="space-y-8">

      <MonthNavigation
        date={date}
        onDateChange={changeDate}
      />


      <SheetFilters
        filters={filters}
        onFilterChange={changeFilter}
        onReset={resetFilters}
      />


      <PageSizeSelect
        value={pageSize}
        onChange={changePageSize}
      />


      <div className="overflow-hidden rounded-xl border bg-white">

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>
                {t('leftEmployeesSheet.columns.employee')}
              </TableHead>


              <TableHead>
                {t('leftEmployeesSheet.columns.endDate')}
              </TableHead>


            

            </TableRow>

          </TableHeader>


          <TableBody>

            {isLoading && (

              <TableRow>

                <TableCell colSpan={5}>
                  Loading...
                </TableCell>

              </TableRow>

            )}


            {!isLoading && rows.length === 0 && (

              <TableRow>

                <TableCell colSpan={5}>

                  <EmptyState
                    title={t("leftEmployeesSheet.noData.title")}
                    description={t("leftEmployeesSheet.noData.description")}
                  />

                </TableCell>

              </TableRow>

            )}


            {!isLoading &&
              rows.map((row, idx) => (

                <TableRow
                  key={row.employee_id ?? row.id ?? idx}
                >

                  <TableCell>

                    <div className="flex items-center gap-2">

                      <Avatar>
                        <AvatarFallback>{getInitials(row.employee_name || row.name)}</AvatarFallback>
                      </Avatar>


                      <div>

                        <div>
                          {row.employee_name || row.name}
                        </div>


                        <div className="text-xs text-muted-foreground">
                          {row.code}
                        </div>

                      </div>

                    </div>

                  </TableCell>


                  <TableCell>
                    {row.end_date || '-'}
                  </TableCell>

                </TableRow>

              ))}

          </TableBody>

        </Table>

      </div>


      <Pagination

        currentPage={
          Number(meta.current_page || 1)
        }


        totalPages={
          Number(meta.last_page || 1)
        }


        onPageChange={(newPage) => {

          const params =
            new URLSearchParams(searchParams);


          params.set(
            'page',
            newPage
          );


          setSearchParams(params);

        }}

      />

    </div>
  );
}
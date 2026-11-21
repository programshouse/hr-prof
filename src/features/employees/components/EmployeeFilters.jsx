// src/features/employees/components/EmployeeFilters.jsx

import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';

import {
  Search,
  X,
  CalendarIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { useMemo, useState } from 'react';

import { format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';


import { useAllShifts } from '@/shared/hooks/useAllShifts';
import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllBranches } from '@/shared/hooks/useAllBranches';

import { useFilter } from '@/shared/hooks/useFilter';



function SearchableSelect({
  value,
  onValueChange,
  options = [],
  placeholder,
  allOption,
}) {

  const { t, i18n } = useTranslation();

  const isRTL = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);


  const getLabel = (option) => {

    if (isRTL) {
      return (
        option.title_ar ||
        option.name_ar ||
        option.title_en ||
        option.name_en ||
        option.name ||
        option.title ||
        '—'
      );
    }

    return (
      option.title_en ||
      option.name_en ||
      option.title_ar ||
      option.name_ar ||
      option.name ||
      option.title ||
      '—'
    );
  };


  const filteredOptions = useMemo(() => {

    const q = searchTerm
      .trim()
      .toLowerCase();

    if (!q) return options;

    return options.filter((option) =>
      getLabel(option)
        .toLowerCase()
        .includes(q)
    );

  }, [options, searchTerm]);


  return (

    <Select
      dir={isRTL ? 'rtl' : 'ltr'}
      value={value ?? 'all'}

      open={isOpen}

      onOpenChange={(open) => {

        setIsOpen(open);

        if (!open) {
          setSearchTerm('');
        }

      }}

      onValueChange={onValueChange}
    >

      <SelectTrigger
        className={cn(
          'h-10 w-full border-gray-200 bg-white text-sm text-gray-500 shadow-sm',

          isRTL
            ? 'text-right [&>span]:text-right'
            : 'text-left [&>span]:text-left'
        )}
      >

        <SelectValue placeholder={placeholder} />

      </SelectTrigger>


      <SelectContent
        dir={isRTL ? 'rtl' : 'ltr'}
      >

        <div className="border-b bg-white p-2">

          <div className="relative">

            <Search
              className="
              absolute start-2 top-1/2
              size-4 -translate-y-1/2
              text-gray-400
              "
            />


            <Input

              placeholder={
                t('filters.searchPlaceholder')
              }

              value={searchTerm}

              onChange={(e) =>
                setSearchTerm(e.target.value)
              }

              className="h-8 ps-8 text-sm"

              onClick={(e) =>
                e.stopPropagation()
              }

            />

          </div>

        </div>



        <SelectItem value="all">

          {allOption || t('filters.all')}

        </SelectItem>



        {filteredOptions.map((option) => (

          <SelectItem

            key={option.id}

            value={String(option.id)}

          >

            {getLabel(option)}

          </SelectItem>

        ))}


      </SelectContent>

    </Select>

  );

}




function FilterDateRangePicker({
  fromValue,
  toValue,
  onChange,
  placeholder,
  isRTL,
}) {

  const [open, setOpen] = useState(false);


  const fromDate =
    fromValue
      ? new Date(fromValue)
      : undefined;


  const toDate =
    toValue
      ? new Date(toValue)
      : undefined;



  return (

    <Popover
      open={open}
      onOpenChange={setOpen}
    >

      <PopoverTrigger asChild>

        <Button

          variant="outline"

          className={cn(
            'h-10 w-full justify-start border-gray-200 bg-white text-sm font-normal text-gray-500 shadow-sm',

            isRTL && 'justify-end'
          )}

        >

          <CalendarIcon className="me-2 size-4" />

          {
            fromValue && toValue
              ? `${fromValue} → ${toValue}`
              : placeholder
          }

        </Button>

      </PopoverTrigger>


      <PopoverContent
        className="w-auto p-4"
        align={isRTL ? 'end' : 'start'}
      >

        <div className="grid gap-4 md:grid-cols-2">

          <div>

            <p className="mb-2 text-sm font-medium">
              {isRTL ? 'من' : 'From'}
            </p>


            <Calendar

              mode="single"

              selected={fromDate}

              onSelect={(date) =>
                onChange(
                  'from',
                  date
                    ? format(date,'yyyy-MM-dd')
                    : ''
                )
              }

            />

          </div>


          <div>

            <p className="mb-2 text-sm font-medium">
              {isRTL ? 'إلى' : 'To'}
            </p>


            <Calendar

              mode="single"

              selected={toDate}

              onSelect={(date) =>
                onChange(
                  'to',
                  date
                    ? format(date,'yyyy-MM-dd')
                    : ''
                )
              }

            />

          </div>


        </div>

      </PopoverContent>


    </Popover>

  );

}export default function EmployeeFilters({
  filters = {},
  onFiltersChange = () => {},
  hideDepartment = false,
  showStatus = false,
  hideType = false,
  hideDateFilters = false,
}) {

  const { t, i18n } = useTranslation();

  const isRTL = i18n.language?.startsWith('ar');


  const {
    searchTerm,
    handleSearchChange,
    handleChange,
  } = useFilter(
    filters,
    onFiltersChange,
    'search'
  );


  const { data: shifts = [] } = useAllShifts();
  const { data: positions = [] } = useAllPositions();
  const { data: departments = [] } = useAllDepartments();
  const { data: branches = [] } = useAllBranches();



  const setFilter = (key, value) => {

    handleChange(
      key,
      value === 'all'
        ? ''
        : value
    );

  };



  const handleDateRangeChange = (
    type,
    value,
    key
  ) => {

    onFiltersChange({

      ...filters,

      [`${key}_${type}`]: value,

      page: 1,

    });

  };



  const isActive = (value) =>
    value !== undefined &&
    value !== null &&
    value !== '' &&
    value !== 'all';



  const hasAnyFilter = Boolean(

    isActive(filters.search) ||

    isActive(filters.shift_id) ||

    isActive(filters.position_id) ||

    (!hideDepartment &&
      isActive(filters.department_id)
    ) ||

    isActive(filters.branch_id) ||

    (!hideType &&
      isActive(filters.employment_type)
    ) ||

    (showStatus &&
      isActive(filters.is_active)
    ) ||

    (!hideDateFilters &&
      (
        isActive(filters.join_date_from) ||
        isActive(filters.join_date_to) ||
        isActive(filters.end_date_from) ||
        isActive(filters.end_date_to)
      ))

  );



  const resetAll = () => {

    handleSearchChange('');

    onFiltersChange({

      ...filters,

      search: '',
      shift_id: '',
      position_id: '',
      department_id: '',
      branch_id: '',
      employment_type: '',

      join_date_from: '',
      join_date_to: '',

      end_date_from: '',
      end_date_to: '',

      ...(showStatus && {
        is_active: '',
      }),

      page: 1,

    });

  };



  return (

    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full"
    >

      <div className="space-y-3">


        {/* First Row - Always visible */}

        <div
          className="
          flex w-full flex-wrap
          items-center gap-2
          xl:flex-nowrap
          "
        >

          <div className="relative min-w-[140px] flex-1">

            <Search
              className="
              absolute start-3 top-1/2
              size-4 -translate-y-1/2
              text-gray-400
              "
            />

            <Input

              placeholder={t('filters.search')}

              value={searchTerm}

              onChange={(e)=>
                handleSearchChange(
                  e.target.value
                )
              }

              className={cn(
                'h-10 w-full border-gray-200 bg-white ps-9 text-sm shadow-sm',

                isRTL
                  ? 'text-right placeholder:text-right'
                  : 'text-left placeholder:text-left'
              )}

            />

          </div>



          <div className="min-w-[140px] flex-1">
            <SearchableSelect
              value={
                filters.shift_id
                  ? String(filters.shift_id)
                  : 'all'
              }
              onValueChange={(v)=>
                setFilter('shift_id',v)
              }
              options={shifts}
              placeholder={t('filters.shift')}
              allOption={t('filters.allShifts')}
            />
          </div>



          <div className="min-w-[140px] flex-1">
            <SearchableSelect
              value={
                filters.position_id
                  ? String(filters.position_id)
                  : 'all'
              }
              onValueChange={(v)=>
                setFilter('position_id',v)
              }
              options={positions}
              placeholder={t('filters.job')}
              allOption={t('filters.allPositions')}
            />
          </div>



          {!hideDepartment && (
            <div className="min-w-[140px] flex-1">

              <SearchableSelect
                value={
                  filters.department_id
                    ? String(filters.department_id)
                    : 'all'
                }
                onValueChange={(v)=>
                  setFilter('department_id',v)
                }
                options={departments}
                placeholder={t('filters.department')}
                allOption={t('filters.allDepartments')}
              />

            </div>
          )}



          <div className="min-w-[140px] flex-1">

            <SearchableSelect
              value={
                filters.branch_id
                  ? String(filters.branch_id)
                  : 'all'
              }
              onValueChange={(v)=>
                setFilter('branch_id',v)
              }
              options={branches}
              placeholder={t('filters.branch')}
              allOption={t('filters.allBranches')}
            />

          </div>



          {!hideType && (
            <div className="min-w-[140px] flex-1">

              <SearchableSelect

                value={
                  filters.employment_type || 'all'
                }

                onValueChange={(v)=>
                  setFilter('employment_type',v)
                }

                options={[
                  {
                    id:'job',
                    name:t('filters.jobType'),
                  },
                  {
                    id:'internship',
                    name:t('filters.internshipType'),
                  },
                ]}

                placeholder={t('filters.type')}

                allOption={t('filters.allTypes')}

              />

            </div>
          )}



          {showStatus && (

            <div className="min-w-[140px] flex-1">

              <Select

                value={
                  filters.is_active !== undefined &&
                  filters.is_active !== ''
                    ? String(filters.is_active)
                    : 'all'
                }

                onValueChange={(v)=>
                  setFilter('is_active',v)
                }

              >

                <SelectTrigger className="h-10 w-full border-gray-200 bg-white text-sm text-gray-500 shadow-sm">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    {t('filters.status')}
                  </SelectItem>

                  <SelectItem value="1">
                    {t('filters.active')}
                  </SelectItem>

                  <SelectItem value="0">
                    {t('filters.inactive')}
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

          )}

        </div>
                {/* Date Filters */}
        {!hideDateFilters && (

          <div
            className="
              flex flex-wrap
              items-center gap-3
            "
          >

            {/* Join Date */}

            <div className="w-full max-w-[260px]">

              <FilterDateRangePicker

                fromValue={
                  filters.join_date_from
                }

                toValue={
                  filters.join_date_to
                }

                placeholder={
                  t(
                    'filters.joinDate',
                    'Join Date'
                  )
                }

                isRTL={isRTL}

                onChange={(type, value) =>
                  handleDateRangeChange(
                    type,
                    value,
                    'join_date'
                  )
                }

              />

            </div>



            {/* End Date */}

            <div className="w-full max-w-[260px]">

              <FilterDateRangePicker

                fromValue={
                  filters.end_date_from
                }

                toValue={
                  filters.end_date_to
                }

                placeholder={
                  t(
                    'filters.endDate',
                    'End Date'
                  )
                }

                isRTL={isRTL}

                onChange={(type, value) =>
                  handleDateRangeChange(
                    type,
                    value,
                    'end_date'
                  )
                }

              />

            </div>


          </div>

        )}



        {/* Clear */}

        {hasAnyFilter && (

          <Button

            variant="ghost"

            onClick={resetAll}

            className="
              h-10
              shrink-0
              gap-1
              text-slate-400
              hover:text-red-500
            "

          >

            <X className="size-4" />

            <span>
              {t('filters.clear')}
            </span>

          </Button>

        )}


      </div>

    </div>

  );

}
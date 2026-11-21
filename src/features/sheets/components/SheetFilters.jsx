import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DatePicker } from '@/components/ui/DatePicker';
import {
  formatFilterDate,
  parseFilterDate,
} from '../utils/dateFilter';

import { Search, X } from 'lucide-react';

import { useAllPositions } from '@/shared/hooks/useAllPositions';
import { useAllDepartments } from '@/shared/hooks/useAllDepartments';
import { useAllBranches } from '@/shared/hooks/useAllBranches';
import { useAllShifts } from '@/shared/hooks/useAllShifts';


/* ---------------------------------------------
 Helpers
--------------------------------------------- */

function getOptionLabel(o, isArabic = false) {
  if (isArabic) {
    return (
      o?.title_ar ||
      o?.name_ar ||
      o?.title_en ||
      o?.name_en ||
      o?.name ||
      o?.label ||
      ''
    );
  }

  return (
    o?.title_en ||
    o?.name_en ||
    o?.name_ar ||
    o?.name ||
    o?.label ||
    ''
  );
}


function normalizeOptions(input) {
  if (Array.isArray(input)) return input;

  if (Array.isArray(input?.data)) {
    return input.data;
  }

  if (Array.isArray(input?.data?.data)) {
    return input.data.data;
  }

  return [];
}


/* ---------------------------------------------
 Searchable Select
--------------------------------------------- */

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
}) {

  const { t, i18n } = useTranslation();

  const isArabic = i18n.language?.startsWith('ar');

  const [searchTerm, setSearchTerm] = useState('');

  const [open, setOpen] = useState(false);


  const filteredOptions = useMemo(() => {

    const list = normalizeOptions(options);

    const q = searchTerm
      .toLowerCase()
      .trim();


    if (!q) return list;


    return list.filter((item) =>
      getOptionLabel(item, isArabic)
        .toLowerCase()
        .includes(q)
    );

  }, [
    options,
    searchTerm,
    isArabic,
  ]);



  return (

    <Select
      dir={isArabic ? 'rtl' : 'ltr'}
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          setSearchTerm('');
        }
      }}
      value={value || 'all'}
      onValueChange={onValueChange}
    >

      <SelectTrigger
        className={`
          h-10 rounded-md border-slate-200
          bg-white text-sm text-slate-600 shadow-sm
          ${
            isArabic
              ? 'text-right [&>span]:text-right'
              : 'text-left [&>span]:text-left'
          }
        `}
      >
        <SelectValue placeholder={placeholder}/>
      </SelectTrigger>


      <SelectContent
        dir={isArabic ? 'rtl' : 'ltr'}
        className="max-h-60"
      >

        <div className="sticky top-0 z-10 border-b bg-white p-2">

          <div className="relative">

            <Search
              className="
              absolute start-2 top-1/2
              h-4 w-4
              -translate-y-1/2
              text-slate-400
              "
            />


            <Input
              value={searchTerm}
              onChange={(e)=>
                setSearchTerm(e.target.value)
              }

              placeholder={
                t('filters.searchPlaceholder')
              }

              className={`
                h-8 ps-8 text-sm
                ${
                  isArabic
                    ? 'text-right placeholder:text-right'
                    : 'text-left'
                }
              `}
              onClick={(e)=>
                e.stopPropagation()
              }
            />

          </div>

        </div>



        <div className="max-h-48 overflow-y-auto">


          <SelectItem
            value="all"
            className={
              isArabic
                ? 'text-right [&>span]:text-right'
                : ''
            }
          >
            {allOption || t('filters.all')}
          </SelectItem>



          {filteredOptions.map((item)=>(

            <SelectItem

              key={
                item.id ??
                item.value
              }

              value={
                String(
                  item.id ??
                  item.value
                )
              }

              className={
                isArabic
                  ? 'text-right [&>span]:text-right'
                  : ''
              }

            >

              {
                getOptionLabel(
                  item,
                  isArabic
                ) || '--'
              }

            </SelectItem>

          ))}


        </div>


      </SelectContent>


    </Select>

  );
}



/* ---------------------------------------------
 Shared Sheet Filters
--------------------------------------------- */


export default function SheetFilters({

  filters,

  onFilterChange,

  onReset,

}) {


  const { t, i18n } = useTranslation();

  const isArabic =
    i18n.language?.startsWith('ar');



  const {
    data: positionsData = [],
  } = useAllPositions();



  const {
    data: departmentsData = [],
  } = useAllDepartments();



  const {
    data: branchesData = [],
  } = useAllBranches();



  const {
    data: shiftsData = [],
  } = useAllShifts();



  const positions =
    useMemo(
      () =>
        normalizeOptions(
          positionsData
        ),
      [positionsData]
    );



  const departments =
    useMemo(
      () =>
        normalizeOptions(
          departmentsData
        ),
      [departmentsData]
    );



  const branches =
    useMemo(
      () =>
        normalizeOptions(
          branchesData
        ),
      [branchesData]
    );



  const shifts =
    useMemo(
      () =>
        normalizeOptions(
          shiftsData
        ),
      [shiftsData]
    );



  const change = (
    key,
    value
  ) => {

    onFilterChange?.(
      key,
      value
    );

  };



  const hasFilters =
    filters.search ||
    filters.branch ||
    filters.department ||
    filters.position ||
    filters.shift ||
    filters.from ||
    filters.to;



  return (

    <div
      dir={
        isArabic
          ? 'rtl'
          : 'ltr'
      }

      className="
      grid gap-3 py-5
      xl:flex xl:flex-wrap
      xl:items-center
      "
    >


      {/* Search */}

      <div
        className="
        relative
        w-full
        xl:w-[320px]
        "
      >

        <Search
          className="
          absolute start-3 top-1/2
          size-4
          -translate-y-1/2
          text-slate-400
          "
        />


        <Input

          value={
            filters.search || ''
          }

          onChange={(e)=>
            change(
              'search',
              e.target.value
            )
          }


          placeholder={
            t('lateSheet.filters.search')
          }


          className={`
          h-10 ps-9
          ${
            isArabic
              ? 'text-right placeholder:text-right'
              : ''
          }
          `}

        />

      </div>



      {/* Branch */}

      <div className="w-full xl:w-[170px]">

        <SearchableSelect

          value={
            filters.branch
          }

          onValueChange={(v)=>
            change(
              'branch',
              v
            )
          }

          options={branches}

          placeholder={
            t('lateSheet.filters.allBranches')
          }

          allOption={
            t('lateSheet.filters.allBranches')
          }

        />

      </div>



      {/* Department */}

      <div className="w-full xl:w-[170px]">

        <SearchableSelect

          value={
            filters.department
          }

          onValueChange={(v)=>
            change(
              'department',
              v
            )
          }

          options={departments}

          placeholder={
            t('lateSheet.filters.allDepartments')
          }

          allOption={
            t('lateSheet.filters.allDepartments')
          }

        />

      </div>



      {/* Position */}

      <div className="w-full xl:w-[170px]">

        <SearchableSelect

          value={
            filters.position
          }

          onValueChange={(v)=>
            change(
              'position',
              v
            )
          }

          options={positions}

          placeholder={
            t('lateSheet.filters.allPositions')
          }

          allOption={
            t('lateSheet.filters.allPositions')
          }

        />

      </div>



      {/* Shift */}

      <div className="w-full xl:w-[140px]">

        <SearchableSelect

          value={
            filters.shift
          }

          onValueChange={(v)=>
            change(
              'shift',
              v
            )
          }

          options={shifts}

          placeholder={
            t('lateSheet.filters.allShifts')
          }

          allOption={
            t('lateSheet.filters.allShifts')
          }

        />

      </div>



      {/* From */}

      <div className="w-full xl:w-[150px]">

        <DatePicker

          value={
            parseFilterDate(filters.from)
          }

          onChange={(v)=>
            change(
              'from',
              formatFilterDate(v)
            )
          }

          placeholder={
            t('lateSheet.filters.fromDate')
          }

        />

      </div>



      {/* To */}

      <div className="w-full xl:w-[150px]">

        <DatePicker

          value={
            parseFilterDate(filters.to)
          }

          onChange={(v)=>
            change(
              'to',
              formatFilterDate(v)
            )
          }

          placeholder={
            t('lateSheet.filters.toDate')
          }

        />

      </div>



      {/* Clear */}

      {hasFilters && (

        <Button

          variant="ghost"

          onClick={onReset}

          className="
          h-10 px-3
          text-slate-500
          hover:text-red-500
          "
        >

          <X className="size-4"/>


          <span
            className={
              isArabic
                ? 'mr-1'
                : 'ml-1'
            }
          >

            {
              t(
                'lateSheet.filters.clear'
              )
            }

          </span>


        </Button>

      )}


    </div>

  );

}
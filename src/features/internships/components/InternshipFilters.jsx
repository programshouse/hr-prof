// src/features/internships/components/InternshipFilters.jsx

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

import { useTranslation } from 'react-i18next';

import { useState } from 'react';

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





/* ============================= */
/*      Searchable Select        */
/* ============================= */

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  allOption,
}) {

  const {
    t,
    i18n,
  } = useTranslation();


  const isArabic =
    i18n.language?.startsWith('ar');



  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');



  const [
    isOpen,
    setIsOpen,
  ] = useState(false);





  const getOptionLabel = (option) => {

    if (isArabic) {

      return (
        option.name_ar ||
        option.title_ar ||
        option.name_en ||
        option.title_en ||
        option.name ||
        option.title ||
        ''
      );

    }


    return (
      option.name_en ||
      option.title_en ||
      option.name_ar ||
      option.title_ar ||
      option.name ||
      option.title ||
      ''
    );

  };





  const filteredOptions =
    (options || []).filter((option) =>
      getOptionLabel(option)
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );





  return (

    <Select

      dir={
        isArabic
          ? 'rtl'
          : 'ltr'
      }


      open={isOpen}


      onOpenChange={(open)=>{

        setIsOpen(open);

        if (!open) {
          setSearchTerm('');
        }

      }}


      value={value}


      onValueChange={onValueChange}

    >



      <SelectTrigger

        className={`

          h-10 w-full
          border-gray-200
          bg-white
          text-sm text-gray-500
          shadow-sm


          ${
            isArabic
              ? 'text-right [&>span]:text-right'
              : 'text-left [&>span]:text-left'
          }

        `}

      >

        <SelectValue
          placeholder={placeholder}
        />

      </SelectTrigger>





      <SelectContent

        dir={
          isArabic
            ? 'rtl'
            : 'ltr'
        }

      >



        <div className="p-2">

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
                t(
                  'filters.searchPlaceholder'
                )
              }


              value={searchTerm}


              onChange={(e)=>
                setSearchTerm(
                  e.target.value
                )
              }


              className={`

                h-9 ps-8 text-sm


                ${
                  isArabic
                    ? 'text-right placeholder:text-right'
                    : 'text-left placeholder:text-left'
                }

              `}


              onClick={(e)=>
                e.stopPropagation()
              }

            />

          </div>

        </div>





        <SelectItem value="all">

          {
            allOption ||
            t('filters.all')
          }

        </SelectItem>





        {filteredOptions.map((option)=>(

          <SelectItem

            key={
              option.id ??
              option.value
            }


            value={
              String(
                option.id ??
                option.value
              )
            }


            className={
              isArabic
                ? 'text-right [&>span]:text-right'
                : 'text-left'
            }

          >

            {getOptionLabel(option)}

          </SelectItem>


        ))}


      </SelectContent>


    </Select>

  );

}/* ============================= */
/*        Date Range Picker       */
/* ============================= */

function FilterDateRangePicker({
  fromValue,
  toValue,
  onChange,
  label,
  isArabic,
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



  const displayValue =
    fromValue && toValue
      ? `${fromValue} → ${toValue}`
      : label;



  return (

    <Popover

      open={open}

      onOpenChange={setOpen}

    >


      <PopoverTrigger asChild>


        <Button

          variant="outline"

          className={`

            h-10 w-full
            justify-start
            border-gray-200
            bg-white
            text-sm
            font-normal
            text-gray-500
            shadow-sm


            ${
              isArabic
                ? 'justify-end text-right'
                : ''
            }

          `}

        >


          <CalendarIcon
            className="me-2 size-4"
          />



          {displayValue}



        </Button>


      </PopoverTrigger>





      <PopoverContent

        className="w-auto p-4"

        align={
          isArabic
            ? 'end'
            : 'start'
        }

      >


        <div
          className="
            grid gap-4
            md:grid-cols-2
          "
        >



          {/* FROM */}

          <div>

            <p
              className="
                mb-2 text-sm
                font-medium
              "
            >

              {
                isArabic
                  ? 'من'
                  : 'From'
              }


            </p>



            <Calendar

              mode="single"


              selected={fromDate}


              onSelect={(date)=>{

                onChange(

                  'from',

                  date
                    ? format(
                        date,
                        'yyyy-MM-dd'
                      )
                    : ''

                );

              }}


              initialFocus

            />


          </div>







          {/* TO */}

          <div>


            <p
              className="
                mb-2 text-sm
                font-medium
              "
            >

              {
                isArabic
                  ? 'إلى'
                  : 'To'
              }


            </p>




            <Calendar

              mode="single"


              selected={toDate}


              onSelect={(date)=>{

                onChange(

                  'to',

                  date
                    ? format(
                        date,
                        'yyyy-MM-dd'
                      )
                    : ''

                );

              }}


            />


          </div>



        </div>



      </PopoverContent>


    </Popover>

  );

}








export default function InternshipFilters({
  filters,
  onFiltersChange,
}) {


  const {
    t,
    i18n,
  } = useTranslation();



  const isArabic =
    i18n.language?.startsWith('ar');





  const { data: shifts = [] } =
    useAllShifts();


  const { data: positions = [] } =
    useAllPositions();


  const { data: departments = [] } =
    useAllDepartments();


  const { data: branches = [] } =
    useAllBranches();





  const [
    searchTerm,
    setSearchTerm,
  ] = useState(
    filters.keyword || ''
  );







  const handleSearchChange = (value)=>{


    setSearchTerm(value);


    onFiltersChange({

      ...filters,

      keyword:value,

    });


  };








  const handleFilterChange = (
    key,
    value
  )=>{


    onFiltersChange({

      ...filters,


      [key]:
        value === 'all'
          ? ''
          : value,


    });


  };








  const handleDateRangeChange = (
    type,
    value,
    key
  )=>{


    const field =
      type === 'from'
        ? `${key}_from`
        : `${key}_to`;



    onFiltersChange({

      ...filters,

      [field]:value,

    });


  };








  const clearFilters = ()=>{


    setSearchTerm('');



    onFiltersChange({

      keyword:'',

      shift_id:'',

      position_id:'',

      department_id:'',

      branch_id:'',


      join_date_from:'',
      join_date_to:'',


      end_date_from:'',
      end_date_to:'',

    });


  };







  const hasActiveFilters =
    Object.values(filters).some(
      (value)=>
        value !== undefined &&
        value !== null &&
        value !== ''
    );

  return (

    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="space-y-3"
    >



      {/* ============================= */}
      {/* First Row Filters              */}
      {/* ============================= */}

      <div className="grid grid-cols-12 items-center gap-3">



        {/* Search */}

        <div className="col-span-12 xl:col-span-4">


          <div className="relative">


            <Search
              className="
                absolute start-3 top-1/2
                size-4 -translate-y-1/2
                text-gray-400
              "
            />


            <Input

              placeholder={
                t(
                  'internships.searchInternships',
                  'Search internships'
                )
              }


              value={searchTerm}


              onChange={(e)=>
                handleSearchChange(
                  e.target.value
                )
              }


              className={`

                h-10 w-full
                border-gray-200
                bg-white
                ps-10
                text-sm
                shadow-sm


                ${
                  isArabic
                    ? 'text-right placeholder:text-right'
                    : 'text-left placeholder:text-left'
                }

              `}

            />


          </div>


        </div>







        {/* Shift */}

        <div className="col-span-6 xl:col-span-2">


          <SearchableSelect

            value={
              filters.shift_id?.toString()
              || 'all'
            }


            onValueChange={(value)=>
              handleFilterChange(
                'shift_id',
                value
              )
            }


            options={shifts}


            placeholder={
              t('filters.shift')
            }


            allOption={
              t('filters.allShifts')
            }

          />


        </div>







        {/* Position */}

        <div className="col-span-6 xl:col-span-2">


          <SearchableSelect

            value={
              filters.position_id?.toString()
              || 'all'
            }


            onValueChange={(value)=>
              handleFilterChange(
                'position_id',
                value
              )
            }


            options={positions}


            placeholder={
              t('filters.position')
            }


            allOption={
              t('filters.allPositions')
            }

          />


        </div>







        {/* Department */}

        <div className="col-span-6 xl:col-span-2">


          <SearchableSelect

            value={
              filters.department_id?.toString()
              || 'all'
            }


            onValueChange={(value)=>
              handleFilterChange(
                'department_id',
                value
              )
            }


            options={departments}


            placeholder={
              t('filters.department')
            }


            allOption={
              t('filters.allDepartments')
            }

          />


        </div>







        {/* Branch */}

        <div className="col-span-6 xl:col-span-2">


          <SearchableSelect

            value={
              filters.branch_id?.toString()
              || 'all'
            }


            onValueChange={(value)=>
              handleFilterChange(
                'branch_id',
                value
              )
            }


            options={branches}


            placeholder={
              t('filters.branch')
            }


            allOption={
              t('filters.allBranches')
            }

          />


        </div>



      </div>









      {/* ============================= */}
      {/* Date Range Filters             */}
      {/* ============================= */}


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


            label={
              t(
                'filters.joinDate',
                'Join Date'
              )
            }


            isArabic={isArabic}



            onChange={(type,value)=>
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


            label={
              t(
                'filters.endDate',
                'End Date'
              )
            }


            isArabic={isArabic}



            onChange={(type,value)=>
              handleDateRangeChange(

                type,

                value,

                'end_date'

              )
            }


          />


        </div>









        {/* Clear */}

        {hasActiveFilters && (


          <Button

            variant="ghost"


            onClick={clearFilters}


            className="
              h-10 shrink-0
              px-3
              text-slate-500
              hover:text-red-500
            "

          >


            <X
              className="size-4"
            />



            <span
              className={`
                text-sm font-medium

                ${
                  isArabic
                    ? 'mr-1'
                    : 'ml-1'
                }
              `}
            >

              {t('filters.clear')}


            </span>



          </Button>


        )}



      </div>



    </div>

  );

}
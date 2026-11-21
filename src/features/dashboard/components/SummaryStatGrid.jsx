// src/features/dashboard/components/SummaryStatGrid.jsx

import { useTranslation } from 'react-i18next';

import {
  Users,
  UserMinus,
  BriefcaseBusiness,
  FileText,
} from 'lucide-react';

import { useDashboardHeader } from '../hooks/useDashboardHeader';

import { Skeleton } from '@/components/ui/skeleton';



const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};



const Divider = () => (
  <div className="bg-default mx-2 h-8 w-[1.5px] shrink-0" />
);





const SummaryStatCard = ({
  title,
  icon: Icon,
  all,
  onsite,
  remote,
  hybrid,
}) => {

  const { t } = useTranslation();


  return (

    <div
      className="
        flex min-w-0 flex-col gap-3
        rounded-xl border border-slate-100
        bg-white px-3 py-3 shadow-sm
        md:px-4 md:py-4
      "
    >


      {/* Header */}

      <div
        className="
          flex items-center gap-2
          text-sm font-medium
          md:text-base lg:text-lg
        "
      >

        <Icon
          className="
            size-4 shrink-0 text-indigo-500
            md:size-5
          "
        />


        <span className="truncate">
          {title}
        </span>


      </div>





      {/* All | Onsite | Remote | Hybrid */}

      <div
        className="
          mt-2 flex min-w-0
          items-center overflow-hidden
        "
      >



        {/* All */}

        <div
          className="
            flex min-w-0 flex-1
            flex-col items-start gap-1
          "
        >

          <span
            className="
              truncate text-[9px]
              font-semibold text-gray
              sm:text-[10px]
              md:text-xs
            "
          >
            {t('common.all', 'All')}
          </span>


          <span
            className="
              text-sm font-bold
              text-slate-900
              md:text-base
              lg:text-lg
            "
          >
            {all}
          </span>


        </div>




        <Divider />





        {/* Onsite */}

        <div
          className="
            flex min-w-0 flex-1
            flex-col items-start gap-1
          "
        >

          <span
            className="
              truncate text-[9px]
              font-semibold text-gray
              sm:text-[10px]
              md:text-xs
            "
          >
            {t('common.onsite', 'Onsite')}
          </span>


          <span
            className="
              text-sm font-bold
              text-indigo-500
              md:text-base
              lg:text-lg
            "
          >
            {onsite}
          </span>


        </div>





        <Divider />





        {/* Remote */}

        <div
          className="
            flex min-w-0 flex-1
            flex-col items-start gap-1
          "
        >

          <span
            className="
              truncate text-[9px]
              font-semibold text-gray
              sm:text-[10px]
              md:text-xs
            "
          >
            {t('common.remote', 'Remote')}
          </span>


          <span
            className="
              text-sm font-bold
              text-purple-500
              md:text-base
              lg:text-lg
            "
          >
            {remote}
          </span>


        </div>





        <Divider />





        {/* Hybrid */}

        <div
          className="
            flex min-w-0 flex-1
            flex-col items-start gap-1
          "
        >

          <span
            className="
              truncate text-[9px]
              font-semibold text-gray
              sm:text-[10px]
              md:text-xs
            "
          >
            {t('common.hybrid')}
          </span>


          <span
            className="
              text-sm font-bold
              text-green-500
              md:text-base
              lg:text-lg
            "
          >
            {hybrid}
          </span>


        </div>



      </div>


    </div>

  );

};

export default function SummaryStatGrid() {

  const { t } = useTranslation();


  const {
    data,
    isLoading,
    isError,
    error,
  } = useDashboardHeader();



  const gridClass =
    `
      grid grid-cols-1
      gap-6
      sm:grid-cols-2
      xl:grid-cols-4
    `;

  if (isLoading) {

    return (

      <div className={gridClass}>

        {[...Array(4)].map((_, index) => (

          <div
            key={index}
            className="
              flex flex-col gap-4
              rounded-xl border
              border-slate-100
              bg-white p-5 shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <Skeleton
                className="size-6 md:size-7"
              />

              <Skeleton
                className="h-6 w-32 md:h-8"
              />

            </div>


            <div className="mt-4">

              <Skeleton
                className="h-12 w-full"
              />

            </div>


          </div>

        ))}

      </div>

    );

  }





  if (isError) {

    return (

      <div
        className="
          rounded-xl border border-red-200
          bg-red-50 p-4 text-red-800
        "
      >

        <p className="font-semibold">
          Error loading dashboard data
        </p>


        <p className="text-sm">
          {
            error?.message ||
            'Please try again later'
          }
        </p>


      </div>

    );

  }





  const stats = [

    {
      title:
        t('dashboard.summary.totalEmployees'),

      all:
        toNumber(
          data?.total_active_employees
        ),

      onsite:
        toNumber(
          data?.active_onsite_count
        ),

      remote:
        toNumber(
          data?.active_remote_count
        ),

      hybrid:
        toNumber(
          data?.active_hybrid_count
        ),

      icon: Users,
    },



    {
      title:
        t('dashboard.summary.fullTime'),

      all:
        toNumber(
          data?.active_full_time_count
        ),

      onsite:
        toNumber(
          data?.active_onsite_full_time_count
        ),

      remote:
        toNumber(
          data?.active_remote_full_time_count
        ),

      hybrid:
        toNumber(
          data?.active_hybrid_full_time_count
        ),

      icon: BriefcaseBusiness,
    },



    {
      title:
        t('dashboard.summary.partTime'),

      all:
        toNumber(
          data?.active_part_time_count
        ),

      onsite:
        toNumber(
          data?.active_onsite_part_time_count
        ),

      remote:
        toNumber(
          data?.active_remote_part_time_count
        ),

      hybrid:
        toNumber(
          data?.active_hybrid_part_time_count
        ),

      icon: UserMinus,
    },



    {
      title:
        t('dashboard.summary.freelance'),

      all:
        toNumber(
          data?.active_freelance_count
        ),

      onsite:
        toNumber(
          data?.active_onsite_freelance_count
        ),

      remote:
        toNumber(
          data?.active_remote_freelance_count
        ),

      hybrid:
        toNumber(
          data?.active_hybrid_freelance_count
        ),

      icon: FileText,
    },

  ];

  return (

    <div className={gridClass}>

      {stats.map((stat, index) => (

        <SummaryStatCard

          key={index}

          {...stat}

        />

      ))}

    </div>

  );

}
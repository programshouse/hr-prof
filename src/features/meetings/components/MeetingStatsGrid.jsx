import {
  Calendar,
  UserCheck,
  UserMinus,
  ClipboardClock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMeetingsStatsQuery } from "../hooks/useMeetingsStatsQuery";

const MeetingStatCard = ({ title, count, icon: Icon }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {/* top row */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg ">
          <Icon className="h-5 w-5 text-secondary" />
        </div>

        <p className="text-sm font-medium text-slate-600">{title}</p>
      </div>

      {/* number */}
      <div className="mt-3 text-3xl font-semibold leading-none text-slate-900">
        {count}
      </div>
    </div>
  );
};

export default function MeetingStatsGrid({ filters = {} }) {
  const { t } = useTranslation();
  const { data, isLoading } = useMeetingsStatsQuery(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-gray-200"></div>
              <div className="h-4 w-24 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 h-8 w-16 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: t('meetings.stats.today'),
      count: data?.today || 0,
      icon: Calendar,
    },
    {
      title: t('meetings.stats.completed'),
      count: data?.completed || 0,
      icon: UserCheck,
    },
    {
      title: t('meetings.stats.canceled'),
      count: data?.cancelled || 0,
      icon: UserMinus,
    },
    {
      title: t('meetings.stats.pending'),
      count: data?.pending || 0,
      icon: ClipboardClock,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <MeetingStatCard key={index} {...stat} />
      ))}
    </div>
  );
}

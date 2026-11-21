import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Award, UserX, Users2 } from 'lucide-react';
import { useInterviewStatsQuery } from '../hooks/useInterviewStatsQuery';

const InterviewSummaryCards = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading, error } = useInterviewStatsQuery();

  const cards = [
    {
      title: t('interviews.stats.total'),
      value: String(stats?.total?.count ?? 0),
      icon: Users,
    },
    {
      title: t('interviews.stats.approved'),
      value: String(stats?.approved?.count ?? 0),
      icon: Award,
    },
    {
      title: t('interviews.stats.rejected'),
      value: String(stats?.rejected?.count ?? 0),
      icon: UserX,
    },
    {
      title: t('interviews.stats.pending'),
      value: String(stats?.pending?.count ?? 0),
      icon: Users2,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-slate-200" />
                  <div className="h-4 w-28 rounded bg-slate-200" />
                </div>
                <div className="h-6 w-14 rounded bg-slate-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {t('interviews.failedToLoadStats')}: {error?.message || t('messages.error.unknownError')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={index}>
            <CardContent>
              <div className="mb-2 flex items-center gap-2">
                <Icon className="text-primary h-6 w-6" />

                <p className="text-lg font-medium text-black">{card.title}</p>
              </div>

              <p className="text-xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InterviewSummaryCards;

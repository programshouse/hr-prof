import { useMemo } from 'react';
import { MoreVertical, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function MeetingsCard() {
  const { t } = useTranslation();
  
  const meetings = useMemo(
    () => [
      {
        id: 1,
        title: 'Interview',
        day: 'Mon',
        date: '10',
        time: `09:00 ${t('common.am')} - 10:00 ${t('common.am')}`,
      },
      {
        id: 2,
        title: 'Organized Meeting',
        day: 'Mon',
        date: '10',
        time: `09:00 ${t('common.am')} - 10:00 ${t('common.am')}`,
      },
      {
        id: 3,
        title: 'Organized Meeting',
        day: 'Mon',
        date: '10',
        time: `09:00 ${t('common.am')} - 10:00 ${t('common.am')}`,
      },
      {
        id: 4,
        title: 'Organized Meeting',
        day: 'Mon',
        date: '10',
        time: `09:00 ${t('common.am')} - 10:00 ${t('common.am')}`,
      },
    ],
    [t]
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Meetings</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary shrink-0 rounded-full hover:bg-indigo-50"
        >
          <Plus className="text-primary size-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.map((meeting, index) => (
          <div key={meeting.id}>
            <div className="flex items-center gap-4">
              {/* Date Badge */}
              <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white md:size-14 md:rounded-2xl">
                <span className="text-sm font-medium text-yellow-500 md:text-sm">
                  {meeting.day}
                </span>
                <span className="font-bold text-slate-900 md:text-base">{meeting.date}</span>
              </div>

              {/* Meeting Details */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 md:text-base">
                  {meeting.title}
                </h3>
                <p className="text-xs text-slate-400 md:text-sm">{meeting.time}</p>
              </div>

              {/* More Options */}
              <Button
                variant="ghost"
                size="icon"
                className="text-primary shrink-0 rounded-full hover:bg-indigo-50"
              >
                <MoreVertical className="size-4 md:size-5" />
              </Button>
            </div>
            {index < meetings.length - 1 && (
              <div className="my-2 border-t border-slate-100 md:my-4" />
            )}
          </div>
        ))}

        {/* View All Link */}
        <div className="pt-2">
          <Button variant="link" className="flex w-full items-center justify-end gap-1">
            View All Meetings
            <ChevronRight className="size-3 md:size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

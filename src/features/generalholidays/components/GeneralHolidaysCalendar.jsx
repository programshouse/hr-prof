// src/features/generalholidays/components/GeneralHolidaysCalendar.jsx

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './generalHolidaysCalendar.css';

export default function GeneralHolidaysCalendar({
  holidays = [],
  loading = false,
  onAddHoliday,
  onEditHoliday,
  onDeleteHoliday,
  onYearChange,
}) {
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  const calendarRef = useRef(null);
  const lastYearRef = useRef(new Date().getFullYear().toString());

  const events = (holidays || []).map((h) => {
    const start = h.date || h.date_from;

    // FullCalendar expects end to be EXCLUSIVE for all-day events
    const endExclusive = h.date_to
      ? dayjs(h.date_to).add(1, 'day').format('YYYY-MM-DD')
      : undefined;

    return {
      id: String(h.id),
      title: h.localName || h.name || h.title_en || '',
      start,
      end: endExclusive,
      allDay: true,
      className: `gh-event gh-${h.type || 'custom'}`,
      extendedProps: h,
    };
  });

  return (
    <div className="rounded-2xl border bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-muted-foreground text-sm font-medium">
          {loading ? t('holidays.generalHolidays.loading') : ''}
        </div>

        <Button variant="outline" onClick={onAddHoliday}>
          {t('holidays.generalHolidays.addNewHoliday')}
        </Button>
      </div>

      {/* Calendar */}
      <div className="gh-calendar-scroll">
        <div className="gh-calendar-minw">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="auto"
            fixedWeekCount={false}
            showNonCurrentDates
            dayMaxEvents={1}
            editable={false}
            selectable={false}
            events={events}
            locale={isRTL ? 'ar' : 'en'}
            direction={isRTL ? 'rtl' : 'ltr'}
            headerToolbar={{
              left: 'prevButton,nextButton today',
              center: 'title',
              right: '',
            }}
            customButtons={{
              prevButton: {
                text: isRTL ? '›' : '‹',
                click: () => {
                  calendarRef.current?.getApi().prev();
                },
              },

              nextButton: {
                text: isRTL ? '‹' : '›',
                click: () => {
                  calendarRef.current?.getApi().next();
                },
              },
            }}
            buttonText={{
              today: t('common.today'),
            }}

            /* ===== YEAR SYNC ===== */
            datesSet={(arg) => {
              if (!arg?.start || !arg?.end) return;

              const mid = new Date(
                (arg.start.getTime() + arg.end.getTime()) / 2
              );

              const newYear = String(mid.getFullYear());

              if (lastYearRef.current !== newYear) {
                lastYearRef.current = newYear;
                onYearChange?.(newYear);
              }
            }}

            /* ===== EVENT RENDER ===== */
            eventContent={(arg) => {
              const h = arg.event.extendedProps;
              const deletable = Boolean(h?.deletable);
              const editable = Boolean(h?.id);

              return (
                <div className="gh-event-inner">
                  <span className="gh-event-title">
                    {arg.event.title}
                  </span>

                  {(editable || deletable) && (
                    <div className="flex items-center gap-1">
                      {editable && (
                        <button
                          type="button"
                          className="gh-event-delete"
                          title={t('common.edit')}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            onEditHoliday?.(h);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 cursor-pointer" />
                        </button>
                      )}

                      {deletable && (
                        <button
                          type="button"
                          className="gh-event-delete"
                          title={t('holidays.generalHolidays.deleteButton')}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            onDeleteHoliday?.(h);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 cursor-pointer" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

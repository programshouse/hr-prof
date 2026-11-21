// src/features/meetings/components/MeetingsCalendarView.jsx
import { useMemo, useState } from "react";
import {
  addDays,
  addMinutes,
  addWeeks,
  endOfWeek,
  format,
  isWithinInterval,
  parse,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import i18n from '@/i18n';
import { formatTimeWithLanguage } from '@/lib/formatTime';

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 56; // px per hour row
const DEFAULT_DURATION_MINUTES = 90;

const EVENT_STYLE = {
  completed: "bg-green-50 border-green-400 text-green-800",
  pending: "bg-yellow-50 border-yellow-400 text-yellow-900",
  canceled: "bg-red-50 border-red-400 text-red-800",
  cancelled: "bg-red-50 border-red-400 text-red-800",
  scheduled: "bg-slate-50 border-slate-400 text-slate-800",
};

const DEFAULT_STYLE = "bg-blue-50 border-blue-400 text-blue-900";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toDateTime(dateStr, timeStr) {
  try {
    const base = parse(dateStr, "yyyy-MM-dd", new Date());
    if (!timeStr) return base;
    return parse(timeStr, "hh:mm a", base);
  } catch {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (timeStr) {
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        let [, hours, minutes, period] = timeMatch;
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (period?.toUpperCase() === "PM" && hours !== 12) hours += 12;
        if (period?.toUpperCase() === "AM" && hours === 12) hours = 0;
        date.setHours(hours, minutes, 0, 0);
      }
    }
    return date;
  }
}

function minutesFromStart(date) {
  return date.getHours() * 60 + date.getMinutes() - START_HOUR * 60;
}

const CALENDAR_VIEW_OPTIONS = [
  { id: 'year', activeId: 'Year' },
  { id: 'week', activeId: 'Week' },
  { id: 'month', activeId: 'Month' },
  { id: 'day', activeId: 'Day' },
];

export default function MeetingsCalendarView({
  data = [],
  defaultDurationMinutes = DEFAULT_DURATION_MINUTES,
}) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekDays = useMemo(() => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [weekStart]);

  const weekLabel = useMemo(() => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 });
    const end = endOfWeek(weekStart, { weekStartsOn: 1 });
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  }, [weekStart]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) arr.push(h);
    return arr;
  }, []);

  const events = useMemo(() => {
    const start = startOfWeek(weekStart, { weekStartsOn: 1 });
    const end = endOfWeek(weekStart, { weekStartsOn: 1 });

    return (data || [])
      .map((m) => {
        const startAt = toDateTime(m.date, m.time);
        const endAt = m.endTime
          ? toDateTime(m.date, m.endTime)
          : addMinutes(startAt, m.duration_minutes || defaultDurationMinutes);

        return { ...m, startAt, endAt };
      })
      .filter((m) => isWithinInterval(m.startAt, { start, end }));
  }, [data, weekStart, defaultDurationMinutes]);

  const gridHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
  const { t } = useTranslation();

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-full border-slate-200 bg-white px-4 text-sm"
              onClick={() =>
                setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
              }
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-slate-200"
              onClick={() => setWeekStart((d) => addWeeks(d, -1))}
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-slate-200"
              onClick={() => setWeekStart((d) => addWeeks(d, 1))}
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="ml-2 text-sm font-medium text-slate-700">
              {weekLabel}
            </div>
          </div>

          <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            {CALENDAR_VIEW_OPTIONS.map(({ id, activeId }) => (
              <div
                key={id}
                className={[
                  "px-4 py-2 text-xs font-medium",
                  activeId === "Week"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500",
                ].join(" ")}
              >
                {t(`meetings.calendar.views.${id}`)}
              </div>
            ))}
          </div>
        </div>

        {/* Time Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[1040px]">
            {/* Days header row */}
            <div className="grid grid-cols-[72px_repeat(7,minmax(130px,1fr))] border-b border-slate-100">
              <div className="flex h-12 items-center justify-center text-slate-400">
                <Clock3 className="h-4 w-4" />
              </div>

              {weekDays.map((d) => (
                <div
                  key={d.toISOString()}
                  className="flex h-12 items-center justify-center border-l border-slate-100"
                >
                  <div className="text-center">
                    <div className="text-[11px] font-medium text-slate-500">
                      {format(d, "EEEE")}
                    </div>
                    <div className="text-xs font-semibold text-slate-700">
                      {format(d, "d")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="grid grid-cols-[72px_repeat(7,minmax(130px,1fr))]">
              {/* Time column */}
              <div className="border-r border-slate-100">
                {hours.slice(0, -1).map((h) => (
                  <div
                    key={h}
                    className="relative border-b border-slate-100"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <div className="absolute -top-2 left-2 text-[10px] text-slate-400">
                      {format(parse(String(h), "H", new Date()), "hh:mm a")}
                    </div>
                  </div>
                ))}
                <div style={{ height: 0 }} />
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const dayEvents = events.filter(
                  (e) => format(e.startAt, "yyyy-MM-dd") === dayKey
                );

                return (
                  <div
                    key={day.toISOString()}
                    className="relative border-l border-slate-100"
                    style={{ height: gridHeight }}
                  >
                    {/* hour lines */}
                    {hours.slice(0, -1).map((h) => (
                      <div
                        key={h}
                        className="border-b border-slate-100"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {/* events overlay */}
                    {dayEvents.map((e) => {
                      const top = clamp(
                        (minutesFromStart(e.startAt) / 60) * HOUR_HEIGHT,
                        0,
                        gridHeight - 18
                      );

                      const durationMin =
                        (e.endAt.getTime() - e.startAt.getTime()) / 60000;

                      const height = clamp(
                        (durationMin / 60) * HOUR_HEIGHT,
                        durationMin <= 30 ? 32 : 44,
                        gridHeight - top
                      );

                      // ✅ dynamic line clamp based on event height (more height = more lines)
                      const titleClamp = height < 38 ? 1 : height < 58 ? 2 : 3;

                      const stKey = String(e.status || "scheduled").toLowerCase();
                      const boxCls = EVENT_STYLE[stKey] || DEFAULT_STYLE;

                      return (
                        <div
                          key={e.id}
                          className={[
                            "absolute left-2 right-2 rounded-lg border-l-4 p-2 shadow-sm overflow-hidden",
                            boxCls,
                          ].join(" ")}
                          style={{ top, height }}
                          title={e.title}
                        >
                          <div className="text-[11px] font-semibold">
                            {formatTimeWithLanguage(e.startAt, i18n.language)}{" "}
                            {e.endAt ? `- ${formatTimeWithLanguage(e.endAt, i18n.language)}` : ""}
                          </div>

                          {/* ✅ title wraps + shows full as much as possible */}
                          <div
                            className="mt-0.5 text-[11px] font-medium"
                            style={{
                              whiteSpace: "normal",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: titleClamp,
                              lineHeight: 1.2,
                            }}
                          >
                            {e.title}
                          </div>

                          {/* hide company on very small events so title always visible */}
                          {e.company && height >= 58 ? (
                            <div className="mt-1 text-[10px] opacity-70">
                              {e.company}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// src/features/meetings/components/MeetingsFullCalendar.jsx
import { useMemo, useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import i18n from '@/i18n';
import { formatTimeWithLanguage } from '@/lib/formatTime';

import "./meetingsCalendar.css";

// ✅ maps status -> badge color class
const STATUS_STYLES = {
  completed: "meet-completed",
  pending: "meet-pending",
  canceled: "meet-canceled",
  cancelled: "meet-canceled",
  scheduled: "meet-scheduled",
};

function parseMeetingStart(dateStr, timeStr) {
  const t = timeStr || "09:00";

  // AM/PM format
  if (/\b(AM|PM)\b/i.test(t)) {
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const m = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (m) {
      let hours = parseInt(m[1], 10);
      const minutes = parseInt(m[2], 10);
      const period = m[3].toUpperCase();
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      date.setHours(hours, minutes, 0, 0);
    }
    return date;
  }

  // 24h format "HH:mm"
  return new Date(`${dateStr}T${t}`);
}

export default function MeetingsFullCalendar({
  data = [],
  defaultDurationMinutes = 90,
  calendarView = "timeGridWeek",
  onCalendarViewChange,
  onEventClick,
  onEventEdit,
  onEventDelete,
}) {
  const calendarRef = useRef(null);
  const containerRef = useRef(null);
  const { t } = useTranslation();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(calendarView);

  // menu state: { id, meeting, x, y } | null
  const [menu, setMenu] = useState(null);

  const weekLabel = useMemo(() => {
    const s = startOfWeek(currentDate, { weekStartsOn: 1 });
    const e = endOfWeek(currentDate, { weekStartsOn: 1 });
    return `${format(s, "MMM d")} \u2013 ${format(e, "MMM d, yyyy")}`;
  }, [currentDate]);

  const events = useMemo(() => {
    return (data || []).map((meeting) => {
      const start = parseMeetingStart(meeting.date, meeting.from || "09:00");
      const end = meeting.to
        ? parseMeetingStart(meeting.date, meeting.to)
        : new Date(start.getTime() + defaultDurationMinutes * 60000);

      return {
        id: String(meeting.id),
        title: meeting.name,
        start,
        end,
        extendedProps: meeting,
      };
    });
  }, [data, defaultDurationMinutes]);

  // ✅ close on outside click / esc / scroll (window + calendar scroller)
  useEffect(() => {
    const onDown = (e) => {
      if (!menu) return;
      if (e.target.closest?.(".meet-kebab-menu")) return;
      if (e.target.closest?.(".meet-kebab-btn")) return; // don't immediately close when clicking the kebab
      setMenu(null);
    };

    const onEsc = (e) => {
      if (e.key === "Escape") setMenu(null);
    };

    const onAnyScroll = () => {
      if (menu) setMenu(null);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", onAnyScroll, true);

    const scroller = containerRef.current?.querySelector?.(".meetings-calendar-scroll");
    scroller?.addEventListener("scroll", onAnyScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", onAnyScroll, true);
      scroller?.removeEventListener("scroll", onAnyScroll);
    };
  }, [menu]);

  const handlePrev = () => {
    const api = calendarRef.current?.getApi?.();
    if (api) {
      api.prev();
      setCurrentDate(api.getDate());
    }
  };

  const handleNext = () => {
    const api = calendarRef.current?.getApi?.();
    if (api) {
      api.next();
      setCurrentDate(api.getDate());
    }
  };

  const handleToday = () => {
    const api = calendarRef.current?.getApi?.();
    if (api) {
      api.today();
      setCurrentDate(api.getDate());
    }
  };

  // ✅ open menu next to THIS event button (viewport-relative; survives scroll)
  const MENU_W = 140;
  const ESTIMATED_H = 86;
  const PAD = 8;

  const openMenuAtButton = (eventId, meeting, btnEl) => {
    if (!btnEl) {
      setMenu({ id: eventId, meeting, x: PAD, y: PAD });
      return;
    }

    // toggle same event
    if (menu?.id === eventId) {
      setMenu(null);
      return;
    }

    const r = btnEl.getBoundingClientRect();

    let x = r.right - MENU_W;
    let y = r.bottom + 6;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (x + MENU_W > vw - PAD) x = vw - PAD - MENU_W;
    if (x < PAD) x = PAD;

    // open upward if near bottom
    if (y + ESTIMATED_H > vh - PAD) y = r.top - ESTIMATED_H - 6;
    if (y < PAD) y = PAD;

    setMenu({ id: eventId, meeting, x, y });
  };

  return (
    <Card ref={containerRef} className="relative rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-full border-slate-200 bg-white px-4 text-sm"
              onClick={handleToday}
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-slate-200"
              onClick={handlePrev}
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-slate-200"
              onClick={handleNext}
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="ml-2 text-sm font-medium text-slate-700">{weekLabel}</div>
          </div>

          {/* View toggles */}
          <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            {[
              { labelKey: "year", view: "dayGridYear" },
              { labelKey: "month", view: "dayGridMonth" },
              { labelKey: "week", view: "timeGridWeek" },
              { labelKey: "day", view: "timeGridDay" },
            ].map(({ labelKey, view }) => (
              <button
                key={view}
                type="button"
                onClick={() => {
                  setCurrentView(view);
                  setMenu(null);
                  const api = calendarRef.current?.getApi?.();
                  if (api) api.changeView(view);
                  onCalendarViewChange?.(view);
                }}
                className={[
                  "px-4 py-2 text-xs font-medium transition-colors",
                  currentView === view ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {t(`meetings.calendar.views.${labelKey}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="meetings-calendar-scroll meetings-calendar-minw">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={false}
            nowIndicator
            firstDay={1}
            weekends
            allDaySlot={currentView.includes("timeGrid") ? false : true}
            slotMinTime={currentView.includes("timeGrid") ? "08:00:00" : undefined}
            slotMaxTime={currentView.includes("timeGrid") ? "20:00:00" : undefined}
            slotDuration={currentView.includes("timeGrid") ? "01:00:00" : undefined}
            expandRows
            height="800px"
            slotEventOverlap={false}
            events={events}
            initialDate={currentDate}
            datesSet={(arg) => setCurrentDate(arg.start)}
            eventClick={(arg) => {
              // prevent click when clicking on kebab
              if (arg.jsEvent?.target?.closest?.(".meet-kebab-btn")) return;
              onEventClick?.(arg.event.extendedProps);
            }}
            eventContent={(arg) => {
              const meeting = arg.event.extendedProps;
              const status = String(meeting?.status || "scheduled").toLowerCase();
              const cls = STATUS_STYLES[status] || STATUS_STYLES.scheduled;
              
              // Calculate duration in minutes
              const durationMin = (arg.event.end - arg.event.start) / 60000;
              const isShortEvent = durationMin <= 30;

              return (
                <div className={`meet-badge ${cls}`}>
                  <div className="meet-badge-time">
                    {formatTimeWithLanguage(arg.event.start, i18n.language)} {isShortEvent ? '' : `- ${formatTimeWithLanguage(arg.event.end, i18n.language)}`}
                  </div>

                  <div className="meet-badge-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {arg.event.title}
                  </div>

                  {/* kebab */}
                  <button
                    type="button"
                    className="meet-kebab-btn"
                    title="More"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openMenuAtButton(arg.event.id, meeting, e.currentTarget);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              );
            }}
          />
        </div>

        {/* Floating menu (next to clicked card only) */}
        {menu ? (
          <div
            className="meet-kebab-menu"
            style={{
              position: "fixed",
              left: menu.x,
              top: menu.y,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="meet-kebab-surface">
              <button
                type="button"
                className="meet-kebab-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenu(null);
                  onEventEdit?.(menu.meeting);
                }}
              >
                <Pencil className="meet-kebab-ico" />
                <span>Edit</span>
              </button>

              <div className="meet-kebab-sep" />

              <button
                type="button"
                className="meet-kebab-item meet-kebab-danger"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenu(null);
                  onEventDelete?.(menu.meeting);
                }}
              >
                <Trash2 className="meet-kebab-ico" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

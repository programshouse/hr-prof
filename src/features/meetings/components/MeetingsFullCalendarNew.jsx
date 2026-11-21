// src/features/meetings/components/MeetingsFullCalendarNew.jsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import i18n from '@/i18n';
import { formatTimeWithLanguage } from '@/lib/formatTime';
import './meetingsCalendar.css';

export default function MeetingsFullCalendarNew({
  meetings = [],
  loading = false,
  onAddMeeting,
  onEditMeeting,
  onDeleteMeeting: _onDeleteMeeting,
}) {
  const events = (meetings || []).map((meeting) => {
    // Parse date and time
    const dateTimeStr = `${meeting.date} ${meeting.time || '09:00'}`;
    const start = dayjs(dateTimeStr, 'YYYY-MM-DD hh:mm A').toDate();
    
    // Calculate end time (default 90 minutes)
    const end = meeting.endTime 
      ? dayjs(`${meeting.date} ${meeting.endTime}`, 'YYYY-MM-DD hh:mm A').toDate()
      : dayjs(start).add(90, 'minute').toDate();

    // Determine CSS class based on status
    const statusClass = `meet-event meet-${meeting.status || 'scheduled'}`;

    return {
      id: String(meeting.id),
      title: meeting.title,
      start,
      end,
      allDay: false,
      className: statusClass,
      extendedProps: {
        ...meeting,
        company: meeting.company,
        organizer: meeting.organizer,
        participants: meeting.participants,
      },
    };
  });

  return (
    <div className="rounded-2xl border bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-center lg:justify-between">
        <div className="text-muted-foreground text-sm font-medium">
          {loading ? 'Loading...' : ''}
        </div>

        <Button variant="outline" onClick={onAddMeeting}>
          + Add New Meeting
        </Button>
      </div>

      {/* Calendar container */}
      <div className="meetings-calendar-scroll">
        <div className="meetings-calendar-minw">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            editable={false}
            selectable={false}
            nowIndicator
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:30:00"
            weekends={true}
            allDaySlot={false}

            /* Custom event rendering */
            eventContent={(arg) => {
              const meeting = arg.event.extendedProps;
              
              return (
                <div className="meet-event-inner">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs truncate">
                      {arg.event.title}
                    </div>
                    <div className="text-[10px] opacity-75">
                      {formatTimeWithLanguage(arg.event.start, i18n.language)}
                    </div>
                    {meeting.company && (
                      <div className="text-[9px] opacity-60 truncate">
                        {meeting.company}
                      </div>
                    )}
                  </div>
                </div>
              );
            }}

            /* Event click handler */
            eventClick={(arg) => {
              const meeting = arg.event.extendedProps;
              onEditMeeting?.(meeting);
            }}
          />
        </div>
      </div>
    </div>
  );
}

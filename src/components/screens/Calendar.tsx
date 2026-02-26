'use client';

import { useState, useMemo } from 'react';
import { useMissionControl } from '@/lib/store';
import type { CalendarEvent, EventType, EventStatus } from '@/lib/types';
import { cn, toLabel, formatDate } from '@/lib/utils';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const eventTypeColors: Record<EventType, string> = {
  task: '#60a5fa',
  recurring: '#a78bfa',
  cron: '#f472b6',
  deadline: '#ef4444',
  publish: '#34d399',
};

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function Calendar() {
  const events = useMissionControl((s) => s.events);
  const addEvent = useMissionControl((s) => s.addEvent);
  const updateEvent = useMissionControl((s) => s.updateEvent);
  const deleteEvent = useMissionControl((s) => s.deleteEvent);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<EventType>('task');
  const [newDate, setNewDate] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [year, month]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.startDate.startsWith(dateStr));
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    addEvent({
      title: newTitle,
      description: newDesc,
      type: newType,
      status: 'scheduled' as EventStatus,
      startDate: new Date(newDate).toISOString(),
      color: eventTypeColors[newType],
    });
    setNewTitle('');
    setNewDesc('');
    setNewDate('');
    setShowForm(false);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-gray-500">
          {events.length} events - {events.filter(e => e.status === 'scheduled').length} upcoming
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          + New Event
        </button>
      </div>

      {/* New Event Form */}
      {showForm && (
        <div className="glass-panel p-5 mb-6 animate-slide-in">
          <h3 className="text-sm font-semibold text-white mb-4">Schedule Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title</label>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Event title..." className="input-glass" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value as EventType)} className="input-glass">
                <option value="task">Task</option>
                <option value="recurring">Recurring</option>
                <option value="cron">Cron Job</option>
                <option value="deadline">Deadline</option>
                <option value="publish">Publish</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input-glass" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional description..." className="input-glass" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-primary">Schedule</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 glass-panel p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="btn-ghost text-xs flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Prev</button>
            <h3 className="text-lg font-semibold text-white">{months[month]} {year}</h3>
            <button onClick={nextMonth} className="btn-ghost text-xs flex items-center gap-1">Next <ChevronRight className="w-3 h-3" /></button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-[10px] font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day}
                  className={cn(
                    'aspect-square p-1.5 rounded-lg text-xs transition-colors cursor-pointer',
                    dayEvents.length > 0 ? '' : 'hover:bg-white/5',
                  )}
                  style={{
                    background: dayEvents.length > 0 ? 'var(--glass-medium)' : 'var(--glass-light)',
                    boxShadow: isToday(day) ? '0 0 0 1px var(--accent-primary)' : undefined,
                  }}
                >
                  <div className={cn('text-[11px] font-medium mb-0.5', isToday(day) ? 'text-white' : 'text-gray-400')}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="text-[8px] px-1 py-0.5 rounded truncate"
                        style={{ background: `${e.color || eventTypeColors[e.type]}20`, color: e.color || eventTypeColors[e.type] }}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-gray-500">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events
              .filter((e) => e.status === 'scheduled')
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .slice(0, 10)
              .map((event) => (
                <div key={event.id} className="group p-3 rounded-lg transition-colors" style={{ background: 'var(--glass-light)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: event.color || eventTypeColors[event.type] }} />
                        <span className="text-xs font-medium text-white truncate">{event.title}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{formatDate(event.startDate)}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: `${event.color || eventTypeColors[event.type]}15`, color: event.color || eventTypeColors[event.type] }}>
                        {toLabel(event.type)}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            {events.filter(e => e.status === 'scheduled').length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

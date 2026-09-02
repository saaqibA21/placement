import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { calendarEvents } = useApp();
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const evByDate = (calendarEvents || []).reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Calendar Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Cinzel,serif' }}>
            Placement Drive Timetable
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Campus visit schedules, tests, and registration deadlines</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-xs" style={{ borderColor: '#EDE0D0' }}>
          <button
            onClick={() => setCur(new Date(year, month - 1, 1))}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-gray-800 w-32 text-center" style={{ fontFamily: 'Cinzel,serif' }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => setCur(new Date(year, month + 1, 1))}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Month Grid Card */}
      <div className="card-solid bg-white overflow-hidden border shadow-sm" style={{ borderColor: '#EDE0D0' }}>
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50" style={{ borderColor: '#EDE0D0' }}>
          {DAYS.map((d) => (
            <div key={d} className="text-center py-2.5 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y" style={{ borderColor: '#EDE0D0' }}>
          {cells.map((day, idx) => {
            const ds = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const evs = day ? evByDate[ds] || [] : [];
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            return (
              <div key={idx} className="min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 bg-white flex flex-col justify-between" style={{ borderColor: '#EDE0D0' }}>
                {day ? (
                  <>
                    <span
                      className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday ? 'text-white shadow-xs' : 'text-gray-700'
                      }`}
                      style={isToday ? { background: '#8B1A1A' } : {}}
                    >
                      {day}
                    </span>

                    <div className="space-y-1 mt-1">
                      {evs.map((ev) => (
                        <div
                          key={ev.id}
                          title={ev.title}
                          className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate ${
                            ev.type === 'visit'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full bg-gray-50/50" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          Campus Drive / PPT Visit
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          Application Deadline
        </div>
      </div>
    </div>
  );
}

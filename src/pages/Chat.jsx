import { useState } from 'react';
import { Send, UserCheck, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CONVOS = [
  { id: 1, name: 'Placement Cell Officer', initial: 'P', color: 'bg-red-800', lastMsg: 'Your academic credentials are fully verified.', time: '2h ago', unread: 1 },
  { id: 2, name: 'Campus Drive Helpdesk', initial: 'J', color: 'bg-red-900', lastMsg: 'Registration deadline for upcoming drives updated.', time: '3h ago', unread: 0 },
  { id: 3, name: 'Interview Coordinator', initial: 'C', color: 'bg-amber-700', lastMsg: 'PPT venue allocated at Main Seminar Hall.', time: 'Yesterday', unread: 0 },
];

const MSGS = {
  1: [
    { id: 1, from: 'them', text: 'Welcome to Jeppiaar Placement Portal! Your profile is verified for upcoming drives.', time: '9:00 AM' },
    { id: 2, from: 'them', text: 'You are eligible to apply for all active recruitment drives matching your CGPA.', time: '9:01 AM' },
    { id: 3, from: 'me',   text: 'Thank you! When will the shortlisted candidate lists be announced?', time: '9:15 AM' },
    { id: 4, from: 'them', text: 'Results will be published on the Circulars & Notices board as soon as companies complete screening.', time: '9:20 AM' },
  ],
  2: [
    { id: 1, from: 'them', text: 'Attention: Drive dates and deadlines are updated in the Drive Calendar.', time: '8:00 AM' },
    { id: 2, from: 'them', text: 'Please ensure your uploaded resume is current.', time: '8:01 AM' },
  ],
  3: [
    { id: 1, from: 'them', text: 'Campus drive pre-placement talks are scheduled for this week in Seminar Hall A.', time: 'Yesterday' },
    { id: 2, from: 'them', text: 'Please attend in formal college attire with your physical ID card.', time: 'Yesterday' },
  ],
};

export default function Chat() {
  const [active, setActive] = useState(CONVOS[0]);
  const [msgs, setMsgs]     = useState(MSGS);
  const [input, setInput]   = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMsgs((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] || []),
        {
          id: Date.now(),
          from: 'me',
          text: input.trim(),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
    setInput('');
  };

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      {/* Messages List Sidebar */}
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r flex flex-col flex-shrink-0" style={{ borderColor: '#D9E3E0' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#D9E3E0' }}>
          <h2 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>Placement Helpdesk</h2>
          <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            ● Active
          </span>
        </div>

        <div className="overflow-y-auto flex-1 divide-y" style={{ divideColor: '#D9E3E0' }}>
          {CONVOS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              className={`w-full text-left p-3.5 transition-all flex items-center gap-3 ${
                active?.id === c.id
                  ? 'bg-red-50/70 border-l-4'
                  : 'hover:bg-amber-50/40 border-l-4 border-l-transparent'
              }`}
              style={active?.id === c.id ? { borderLeftColor: '#D9642F' } : {}}
            >
              <div className={`w-9 h-9 rounded-xl ${c.color} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                {c.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-900 truncate">{c.name}</p>
                  <span className="text-[10px] text-gray-400 font-mono">{c.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMsg}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: '#D9642F' }}>
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Pane */}
      <div className="flex-1 flex flex-col" style={{ background: '#EFF5F3' }}>
        {/* Chat Header */}
        <div className="p-3.5 bg-white border-b flex items-center gap-3 shadow-2xs flex-shrink-0" style={{ borderColor: '#D9E3E0' }}>
          <div className={`w-9 h-9 rounded-xl ${active?.color} text-white font-bold text-xs flex items-center justify-center`}>
            {active?.initial}
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900">{active?.name}</h3>
            <p className="text-[10px] text-green-600 font-medium">● Available for student placement queries</p>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
          {(msgs[active?.id] || []).map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.from === 'me'
                    ? 'text-white rounded-br-none'
                    : 'bg-white text-gray-800 border rounded-bl-none'
                }`}
                style={
                  m.from === 'me'
                    ? { background: '#D9642F' }
                    : { borderColor: '#D9E3E0', background: '#FFFFFF' }
                }
              >
                <p>{m.text}</p>
                <span className={`text-[9px] mt-1 block font-mono ${m.from === 'me' ? 'text-white/60' : 'text-gray-400'}`}>
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t flex-shrink-0" style={{ borderColor: '#D9E3E0' }}>
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type your placement question..."
              className="input-solid flex-1 text-xs py-2"
            />
            <button
              onClick={send}
              className="btn-solid-primary px-4 py-2 flex items-center gap-1.5 text-xs font-semibold"
            >
              Send <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

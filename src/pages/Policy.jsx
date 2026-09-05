import { ShieldAlert, BookOpen } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Eligibility & Compliance Criteria',
    body: `All participating students must fulfill the mandatory prerequisites:
• Maintain minimum aggregate CGPA of 6.0 (or higher as specified by individual company cut-offs).
• No active un-cleared standing arrears at the time of recruitment registration.
• Mandatory minimum 75% attendance record across degree curriculum.
• Valid student placement registration profile approved by the Placement Cell.`,
  },
  {
    title: '2. Campus Drive Application Rules',
    body: `• Students can apply to eligible companies but must attend all scheduled interview rounds.
• Once an official offer letter is secured, the candidate transitions into the "Placed" roster.
• One-offer holders may apply for recognized "Dream" or "Super Dream" categories per guidelines.
• Non-attendance or withdrawal without 24-hour formal notification results in disciplinary review.`,
  },
  {
    title: '3. Professional Code of Conduct',
    body: `• Standard formal business attire is strictly mandatory for all online & offline recruitment stages.
• Punctuality is required at all test halls and virtual interview waiting rooms.
• Zero-tolerance policy against academic dishonesty, malpractice, or impersonation during evaluations.`,
  },
  {
    title: '4. Resume & Verification Standards',
    body: `• All academic marks, projects, and work experience must be 100% verified and factually accurate.
• Single-page standard college resume format must be maintained and kept up-to-date.
• Discrepancies between submitted resume and original credentials lead to immediate disqualification.`,
  },
  {
    title: '5. Grievance & Inquiries',
    body: `• For discrepancies or placement queries, email the Placement Officer at placements@jeppiaarcollege.org.
• Official communications are dispatched via the portal notice board and institutional email.`,
  },
];

export default function Policy() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>
          Placement Regulations & Guidelines
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">Jeppiaar Engineering College · Department of Placement & Corporate Relations</p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s, idx) => (
          <div key={idx} className="card-solid p-5 bg-white border" style={{ borderColor: '#D9E3E0' }}>
            <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2" style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing:'0.03em' }}>
              <BookOpen size={14} style={{ color: '#D9642F' }} />
              {s.title}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line font-normal">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border flex items-start gap-3" style={{ background: '#F7ECDD', borderColor: '#E3C9A8' }}>
        <ShieldAlert size={18} className="flex-shrink-0 mt-0.5 text-amber-800" />
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Official Note:</strong> Placement policies are ratified annually by the Academic Council. Candidates are expected to review this document regularly.
        </p>
      </div>
    </div>
  );
}

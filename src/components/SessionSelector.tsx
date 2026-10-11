import React from 'react';

interface SessionSelectorProps {
  selectedSession: string;
  onSelectSession: (session: string) => void;
}

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  selectedSession,
  onSelectSession
}) => {
  return (
    <div className="space-y-1.5">
      <label htmlFor="academic-session" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Admission Academic Session
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-labelledby="academic-session-label">
        <button
          type="button"
          role="radio"
          aria-checked={selectedSession === '2025/2026'}
          onClick={() => onSelectSession('2025/2026')}
          className={`p-3 text-left rounded-lg border text-sm transition-all focus-ring ${
            selectedSession === '2025/2026'
              ? 'border-[#0F2942] bg-[#0F2942]/5 ring-1 ring-[#0F2942]'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">2025/2026 Session</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Verified
            </span>
          </div>
          <span className="text-xs text-slate-500 block mt-1">
            Official 50:30:20 confirmed formula
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={selectedSession === '2026/2027'}
          onClick={() => onSelectSession('2026/2027')}
          className={`p-3 text-left rounded-lg border text-sm transition-all focus-ring ${
            selectedSession === '2026/2027'
              ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-600'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">2026/2027 Session</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              Preliminary
            </span>
          </div>
          <span className="text-xs text-slate-500 block mt-1">
            Current session (Opt-in simulation)
          </span>
        </button>
      </div>
    </div>
  );
};

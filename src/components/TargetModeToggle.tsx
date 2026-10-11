import React from 'react';

interface TargetModeToggleProps {
  isTargetMode: boolean;
  onToggle: (targetMode: boolean) => void;
}

export const TargetModeToggle: React.FC<TargetModeToggleProps> = ({
  isTargetMode,
  onToggle
}) => {
  return (
    <div className="bg-slate-200/70 p-1 rounded-lg flex items-center gap-1" role="tablist" aria-label="Calculator Mode Selector">
      <button
        type="button"
        role="tab"
        aria-selected={!isTargetMode}
        onClick={() => onToggle(false)}
        className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-md transition-all focus-ring text-center ${
          !isTargetMode
            ? 'bg-white text-[#0F2942] shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Forward Calculator
        <span className="hidden sm:inline font-normal text-xs text-slate-500 block">
          Known UTME + PUTME + O&apos;Level
        </span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={isTargetMode}
        onClick={() => onToggle(true)}
        className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-md transition-all focus-ring text-center ${
          isTargetMode
            ? 'bg-white text-[#0F2942] shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Target Mode (Reverse)
        <span className="hidden sm:inline font-normal text-xs text-slate-500 block">
          Find Required Post-UTME Score
        </span>
      </button>
    </div>
  );
};

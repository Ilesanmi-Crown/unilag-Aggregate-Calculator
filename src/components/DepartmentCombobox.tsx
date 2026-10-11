import React, { useState, useMemo } from 'react';
import cutoffData from '../data/cutoffs/2026_2027.json' with { type: 'json' };
import { DepartmentCutoffRecord, CutoffDataset } from '../core/types';

interface DepartmentComboboxProps {
  selectedProgramme: string;
  onSelectProgramme: (programme: string) => void;
  selectedState: string;
  onSelectState: (state: string) => void;
  onApplyAsTarget?: (score: number) => void;
}

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export const SOUTH_WEST_CATCHMENT_STATES = [
  'EKITI', 'LAGOS', 'OGUN', 'ONDO', 'OSUN', 'OYO'
];

export const DepartmentCombobox: React.FC<DepartmentComboboxProps> = ({
  selectedProgramme,
  onSelectProgramme,
  selectedState,
  onSelectState,
  onApplyAsTarget
}) => {
  const dataset = cutoffData as unknown as CutoffDataset;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) {
      return dataset.records;
    }
    const q = searchTerm.toLowerCase();
    return dataset.records.filter(
      (r) =>
        r.programme.toLowerCase().includes(q) ||
        r.faculty.toLowerCase().includes(q)
    );
  }, [dataset.records, searchTerm]);

  const activeRecord = useMemo(() => {
    if (!selectedProgramme) return null;
    return dataset.records.find((r) => r.programme === selectedProgramme) ?? null;
  }, [dataset.records, selectedProgramme]);

  // Determine catchment value
  const stateUpper = selectedState.toUpperCase();
  const isCatchmentState = SOUTH_WEST_CATCHMENT_STATES.includes(stateUpper);
  const catchmentKey = stateUpper.toLowerCase() as keyof DepartmentCutoffRecord['catchment'];
  const catchmentCutoff = activeRecord && isCatchmentState ? activeRecord.catchment[catchmentKey] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Department / Programme Search & Select */}
        <div className="space-y-1.5">
          <label htmlFor="department-search-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Target Course / Programme
          </label>
          <div className="relative">
            <input
              type="text"
              id="department-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search 112 courses (e.g. Medicine, Law)..."
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus-ring mb-1"
            />
            <label htmlFor="department-select-dropdown" className="sr-only">
              Select department
            </label>
            <select
              id="department-select-dropdown"
              value={selectedProgramme}
              onChange={(e) => onSelectProgramme(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-md border border-slate-300 bg-white text-slate-900 focus-ring"
            >
              <option value="">-- Choose a Programme ({filteredRecords.length} available) --</option>
              {filteredRecords.map((r) => (
                <option key={r.programme} value={r.programme}>
                  {r.programme} ({r.faculty.replace('FACULTY OF ', '')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State of Origin */}
        <div className="space-y-1.5">
          <label htmlFor="candidate-state-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Candidate State of Origin
          </label>
          <select
            id="candidate-state-select"
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold rounded-md border border-slate-300 bg-white text-slate-900 focus-ring"
          >
            <option value="">-- Select State --</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s} {SOUTH_WEST_CATCHMENT_STATES.includes(s.toUpperCase()) ? '(Catchment Eligible)' : ''}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-500 block">
            Catchment applies strictly to Ekiti, Lagos, Ogun, Ondo, Osun, Oyo.
          </span>
        </div>
      </div>

      {/* Selected Programme Cut-off Summary Card */}
      {activeRecord && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {activeRecord.faculty}
              </span>
              <h4 className="text-base font-bold text-[#0F2942]">
                {activeRecord.programme}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded">
                2026/2027 Official
              </span>
              <a
                href={dataset.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0F2942] underline hover:text-[#1A3D60] focus-ring rounded"
              >
                Source Circular ↗
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Merit Cut-Off */}
            <div className="bg-white border border-slate-200 rounded-md p-2.5">
              <div className="text-xs text-slate-500 font-medium">National Merit Cut-Off</div>
              <div className="text-xl font-extrabold text-[#0F2942] mt-0.5">
                {activeRecord.merit !== null ? activeRecord.merit.toFixed(3) : (
                  <span className="text-slate-400 text-sm font-normal">NIL (Unavailable)</span>
                )}
              </div>
              {onApplyAsTarget && activeRecord.merit !== null && (
                <button
                  type="button"
                  onClick={() => onApplyAsTarget(activeRecord.merit!)}
                  className="mt-2 text-xs font-bold text-[#0F2942] hover:underline focus-ring rounded"
                >
                  Set as Target Goal →
                </button>
              )}
            </div>

            {/* Catchment Cut-Off */}
            <div className="bg-white border border-slate-200 rounded-md p-2.5">
              <div className="text-xs text-slate-500 font-medium">
                {selectedState ? `${selectedState} Catchment Cut-Off` : 'Catchment Cut-Off'}
              </div>
              <div className="text-xl font-extrabold text-slate-800 mt-0.5">
                {!selectedState ? (
                  <span className="text-slate-400 text-xs font-normal">Select a state above</span>
                ) : !isCatchmentState ? (
                  <span className="text-slate-500 text-xs font-normal">
                    Non-Catchment (Merit Quota applies)
                  </span>
                ) : catchmentCutoff !== null ? (
                  catchmentCutoff.toFixed(3)
                ) : (
                  <span className="text-slate-400 text-sm font-normal">NIL (No Quota Allocated)</span>
                )}
              </div>
              {onApplyAsTarget && catchmentCutoff !== null && (
                <button
                  type="button"
                  onClick={() => onApplyAsTarget(catchmentCutoff!)}
                  className="mt-2 text-xs font-bold text-[#0F2942] hover:underline focus-ring rounded"
                >
                  Set as Target Goal →
                </button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Official cut-off released Sept 16, 2026. Meeting previous cut-offs does not guarantee admission in future sessions.
          </p>
        </div>
      )}
    </div>
  );
};

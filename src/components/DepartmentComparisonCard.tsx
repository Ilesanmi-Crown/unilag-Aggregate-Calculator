import React from 'react';
import cutoffData from '../data/cutoffs/2026_2027.json' with { type: 'json' };
import { CutoffDataset, DepartmentCutoffRecord } from '../core/types';
import { SOUTH_WEST_CATCHMENT_STATES } from './DepartmentCombobox';

interface DepartmentComparisonCardProps {
  userAggregate: number | null;
  selectedProgramme: string;
  selectedState: string;
}

export const DepartmentComparisonCard: React.FC<DepartmentComparisonCardProps> = ({
  userAggregate,
  selectedProgramme,
  selectedState
}) => {
  const dataset = cutoffData as unknown as CutoffDataset;

  if (!selectedProgramme || userAggregate === null) {
    return null;
  }

  const record = dataset.records.find((r) => r.programme === selectedProgramme);
  if (!record) {
    return null;
  }

  const stateUpper = selectedState.toUpperCase();
  const isCatchmentState = SOUTH_WEST_CATCHMENT_STATES.includes(stateUpper);
  const catchmentKey = stateUpper.toLowerCase() as keyof DepartmentCutoffRecord['catchment'];
  const catchmentCutoff = isCatchmentState ? record.catchment[catchmentKey] : null;

  // Evaluate against Merit
  const meritDiff = record.merit !== null ? userAggregate - record.merit : null;
  // Evaluate against Catchment if applicable
  const catchmentDiff = catchmentCutoff !== null ? userAggregate - catchmentCutoff : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Official Cut-Off Benchmark Comparison
          </span>
          <h3 className="text-base font-bold text-[#0F2942]">
            {record.programme} ({record.faculty.replace('FACULTY OF ', '')})
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Source: Sept 16, 2026 Press Release
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* National Merit Comparison */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase">National Merit</span>
            <span className="font-bold text-slate-800">
              Cut-off: {record.merit !== null ? record.merit.toFixed(3) : 'NIL'}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900">
            Your Score: {userAggregate.toFixed(3)}
          </div>

          {record.merit !== null ? (
            <div className={`text-xs font-semibold px-2.5 py-1.5 rounded flex items-center justify-between ${
              meritDiff! >= 0
                ? 'bg-emerald-100/70 text-emerald-900'
                : 'bg-slate-200/80 text-slate-800'
            }`}>
              <span>
                {meritDiff! >= 0 ? 'Meets or Exceeds Merit Cut-Off' : 'Below Merit Cut-Off'}
              </span>
              <span>
                {meritDiff! >= 0 ? `+${meritDiff!.toFixed(3)}` : meritDiff!.toFixed(3)}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic bg-slate-100 p-2 rounded">
              No merit quota or qualifying candidates published for this programme.
            </div>
          )}
        </div>

        {/* Catchment Comparison */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase">
              {selectedState ? `${selectedState} Catchment` : 'Catchment Area'}
            </span>
            <span className="font-bold text-slate-800">
              Cut-off: {catchmentCutoff !== null ? catchmentCutoff.toFixed(3) : isCatchmentState ? 'NIL' : 'N/A'}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-900">
            Your Score: {userAggregate.toFixed(3)}
          </div>

          {!selectedState ? (
            <div className="text-xs text-slate-500 italic bg-slate-100 p-2 rounded">
              Select your state above to compare against catchment cut-off.
            </div>
          ) : !isCatchmentState ? (
            <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded">
              {selectedState} is outside the 6 South-West catchment states. Evaluated exclusively under National Merit.
            </div>
          ) : catchmentCutoff !== null ? (
            <div className={`text-xs font-semibold px-2.5 py-1.5 rounded flex items-center justify-between ${
              catchmentDiff! >= 0
                ? 'bg-emerald-100/70 text-emerald-900'
                : 'bg-slate-200/80 text-slate-800'
            }`}>
              <span>
                {catchmentDiff! >= 0 ? `Meets ${selectedState} Catchment` : `Below ${selectedState} Catchment`}
              </span>
              <span>
                {catchmentDiff! >= 0 ? `+${catchmentDiff!.toFixed(3)}` : catchmentDiff!.toFixed(3)}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic bg-slate-100 p-2 rounded">
              No catchment quota allocated for {selectedState} in this programme.
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 leading-relaxed">
        <strong>Important Context:</strong> Meeting or exceeding a previous academic session&apos;s cut-off mark provides an indicator of historical competitiveness, but does <strong>not guarantee admission</strong>. Annual cut-off marks are decided by the UNILAG Admissions Committee based on applicant performance and NUC quota constraints.
      </div>
    </div>
  );
};

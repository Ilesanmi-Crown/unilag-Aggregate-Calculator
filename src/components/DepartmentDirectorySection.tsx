'use client';

import React, { useState, useMemo } from 'react';
import cutoffData from '../data/cutoffs/2026_2027.json' with { type: 'json' };
import { CutoffDataset } from '../core/types';

export const DepartmentDirectorySection: React.FC = () => {
  const dataset = cutoffData as unknown as CutoffDataset;
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('ALL');

  const faculties = useMemo(() => {
    return ['ALL', ...new Set(dataset.records.map((r) => r.faculty))];
  }, [dataset.records]);

  const displayedRecords = useMemo(() => {
    return dataset.records.filter((r) => {
      const matchesFaculty = selectedFaculty === 'ALL' || r.faculty === selectedFaculty;
      const q = filterQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        r.programme.toLowerCase().includes(q) ||
        r.faculty.toLowerCase().includes(q);
      return matchesFaculty && matchesQuery;
    });
  }, [dataset.records, selectedFaculty, filterQuery]);

  return (
    <section id="cutoffs-section" aria-labelledby="cutoffs-title" className="space-y-4">
      <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 id="cutoffs-title" className="text-xl sm:text-2xl font-extrabold text-[#0F2942] tracking-tight">
            2026/2027 Official Departmental Cut-Off Marks Directory
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Published September 16, 2026 by University of Lagos Admissions Office.
          </p>
        </div>
        <a
          href={dataset.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#0F2942] underline hover:text-[#1A3D60] focus-ring rounded"
        >
          View Official University Press Release ↗
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
        <div className="sm:col-span-7">
          <label htmlFor="cutoff-search-filter" className="sr-only">
            Filter courses
          </label>
          <input
            type="text"
            id="cutoff-search-filter"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter by course name (e.g. Accounting, Nursing, Civil)..."
            className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus-ring"
          />
        </div>
        <div className="sm:col-span-5">
          <label htmlFor="cutoff-faculty-filter" className="sr-only">
            Filter by faculty
          </label>
          <select
            id="cutoff-faculty-filter"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold rounded-md border border-slate-300 bg-white text-slate-900 focus-ring"
          >
            {faculties.map((f) => (
              <option key={f} value={f}>
                {f === 'ALL' ? 'All Faculties (18 Faculties)' : f.replace('FACULTY OF ', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0F2942] text-white sticky top-0 z-10">
              <tr>
                <th className="p-3 font-bold">Programme</th>
                <th className="p-3 font-bold text-center">Merit</th>
                <th className="p-3 font-bold text-center">Ekiti</th>
                <th className="p-3 font-bold text-center">Lagos</th>
                <th className="p-3 font-bold text-center">Ogun</th>
                <th className="p-3 font-bold text-center">Ondo</th>
                <th className="p-3 font-bold text-center">Osun</th>
                <th className="p-3 font-bold text-center">Oyo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 text-sm">
                    No programmes found matching your search criteria.
                  </td>
                </tr>
              ) : (
                displayedRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{r.programme}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {r.faculty.replace('FACULTY OF ', '')}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-[#0F2942]">
                      {r.merit !== null ? r.merit.toFixed(3) : <span className="text-slate-400">NIL</span>}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">
                      {r.catchment.ekiti !== null ? r.catchment.ekiti.toFixed(3) : <span className="text-slate-300">NIL</span>}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">
                      {r.catchment.lagos !== null ? r.catchment.lagos.toFixed(3) : <span className="text-slate-300">NIL</span>}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">
                      {r.catchment.ogun !== null ? r.catchment.ogun.toFixed(3) : <span className="text-slate-300">NIL</span>}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">
                      {r.catchment.ondo !== null ? r.catchment.ondo.toFixed(3) : <span className="text-slate-300">NIL</span>}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">
                      {r.catchment.osun !== null ? r.catchment.osun.toFixed(3) : <span className="text-slate-300">NIL</span>}
                    </td>
                    <td className="p-3 text-center font-medium text-slate-700">
                      {r.catchment.oyo !== null ? r.catchment.oyo.toFixed(3) : <span className="text-slate-300">NIL</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 p-2.5 text-slate-500 text-[11px] border-t border-slate-200 flex justify-between items-center">
          <span>Showing {displayedRecords.length} of {dataset.records.length} published programmes</span>
          <span>NIL indicates no candidate qualified or no quota allocated</span>
        </div>
      </div>
    </section>
  );
};

'use client';

import React, { useRef } from 'react';
import { ResultSlotState, OcrReviewPayload } from '../../ocr/types';
import { OcrReviewForm } from './OcrReviewForm';

interface UploadSlotCardProps {
  slot: ResultSlotState;
  title: string;
  description: string;
  acceptTypes?: string;
  onFileSelect: (file: File) => void;
  onProcess: () => void;
  onRemove: () => void;
  onConfirm: (payload: OcrReviewPayload) => void;
  onEdit: () => void;
  isProcessingOther?: boolean;
}

export const UploadSlotCard: React.FC<UploadSlotCardProps> = ({
  slot,
  title,
  description,
  acceptTypes = 'image/jpeg,image/png,image/webp',
  onFileSelect,
  onProcess,
  onRemove,
  onConfirm,
  onEdit,
  isProcessingOther = false
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStatusBadge = () => {
    switch (slot.status) {
      case 'not_uploaded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Not uploaded
          </span>
        );
      case 'image_selected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
            Image selected
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            Processing
          </span>
        );
      case 'ready_for_review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Ready for review
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Confirmed
          </span>
        );
      case 'needs_attention':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            Needs attention
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        slot.status === 'confirmed'
          ? 'bg-slate-50/50 border-emerald-200 shadow-2xs'
          : slot.status === 'needs_attention'
          ? 'bg-rose-50/30 border-rose-200'
          : slot.status === 'ready_for_review'
          ? 'bg-amber-50/20 border-amber-300 ring-1 ring-amber-200'
          : 'bg-white border-slate-200 shadow-2xs'
      } p-4 sm:p-5 flex flex-col justify-between`}
      role="region"
      aria-label={title}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#0F2942]">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Slot Body by Status */}
        <div className="mt-3.5">
          {/* 1. NOT UPLOADED */}
          {slot.status === 'not_uploaded' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 hover:border-[#0F2942] hover:bg-slate-50/60 rounded-lg p-5 text-center cursor-pointer transition-colors group"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-500 group-hover:text-[#0F2942] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Click to select image or drag & drop
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WebP • Max 5 MB</p>
            </div>
          )}

          {/* 2. IMAGE SELECTED */}
          {slot.status === 'image_selected' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                {slot.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slot.previewUrl}
                    alt={`${title} preview`}
                    className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {slot.fileName || slot.file?.name || 'Selected Image'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {slot.file ? `${(slot.file.size / 1024).toFixed(0)} KB` : 'Ready to scan'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onProcess}
                  disabled={isProcessingOther}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#0F2942] hover:bg-[#163859] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Process with OCR
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                  title="Choose another image"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="py-1.5 px-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* 3. PROCESSING */}
          {slot.status === 'processing' && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-center">
              <div className="w-6 h-6 mx-auto rounded-full border-2 border-slate-200 border-t-[#0F2942] animate-spin" />
              <div className="text-xs font-semibold text-[#0F2942]">
                {slot.statusMessage || 'Scanning image...'}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#0F2942] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${slot.progress}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {slot.progress}% (processing in browser)
              </div>
            </div>
          )}

          {/* 4. READY FOR REVIEW */}
          {slot.status === 'ready_for_review' && slot.extractedData && (
            <div className="pt-1">
              <OcrReviewForm
                data={slot.extractedData}
                imageUrl={slot.previewUrl || undefined}
                onConfirm={onConfirm}
                onCancel={onRemove}
                onRescan={() => fileInputRef.current?.click()}
              />
            </div>
          )}

          {/* 5. CONFIRMED */}
          {slot.status === 'confirmed' && slot.confirmedPayload && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs text-slate-800 space-y-1">
                {slot.category === 'UTME' && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Confirmed Score:</span>
                    <span className="font-bold text-[#0F2942] text-sm">
                      {slot.confirmedPayload.utmeScore} / 400
                    </span>
                  </div>
                )}
                {slot.category === 'PUTME' && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Confirmed Screening Score:</span>
                    <span className="font-bold text-[#0F2942] text-sm">
                      {slot.confirmedPayload.putmeScore?.toFixed(3)} / 30.000
                    </span>
                  </div>
                )}
                {slot.category === 'OLEVEL' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Confirmed Subjects:</span>
                      <span className="font-bold text-[#0F2942]">
                        {slot.confirmedPayload.olevelSubjects?.length ?? 5} Subjects
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {slot.confirmedPayload.olevelSubjects?.slice(0, 5).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-[10px] font-semibold text-emerald-900"
                        >
                          {s.subjectName}: {s.grade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {slot.confirmedPayload.examYear && (
                  <div className="text-[11px] text-slate-500 pt-0.5">
                    Year: {slot.confirmedPayload.examYear}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={onEdit}
                  className="font-semibold text-[#0F2942] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Values
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Replace Slip
                </button>
              </div>
            </div>
          )}

          {/* 6. NEEDS ATTENTION */}
          {slot.status === 'needs_attention' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Scan Issue</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {slot.error || 'The image could not be processed cleanly.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#0F2942] hover:bg-[#163859] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Upload Clearer Photo
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ResultCategory, ExtractedResultData, OcrProgressInfo, OcrReviewPayload } from '../../ocr/types';
import { validateUploadedFile } from '../../ocr/validator';
import { recognizeResultImage } from '../../ocr/engine';
import { parseOcrResult } from '../../ocr/parser';
import { OcrPrivacyNotice } from './OcrPrivacyNotice';
import { OcrReviewForm } from './OcrReviewForm';

interface ResultUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPayload: (payload: OcrReviewPayload) => void;
}

export const ResultUploadModal: React.FC<ResultUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyPayload
}) => {
  const [category, setCategory] = useState<ResultCategory>('UTME');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [progressInfo, setProgressInfo] = useState<OcrProgressInfo>({
    status: 'idle',
    progress: 0,
    statusMessage: ''
  });

  const [extractedData, setExtractedData] = useState<ExtractedResultData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Revoke object URL on cleanup
  const cleanupPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      cleanupPreview();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cleanupPreview]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    cleanupPreview();
    setSelectedFile(null);
    setErrorMsg(null);
    setExtractedData(null);
    setProgressInfo({ status: 'idle', progress: 0, statusMessage: '' });
    onClose();
  };

  const handleFileChange = async (file: File) => {
    setErrorMsg(null);
    cleanupPreview();
    setExtractedData(null);

    // 1. Client-Side Validation (Size + Magic Bytes)
    setProgressInfo({
      status: 'validating',
      progress: 5,
      statusMessage: 'Verifying image integrity...'
    });

    const validation = await validateUploadedFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid file.');
      setProgressInfo({ status: 'idle', progress: 0, statusMessage: '' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);

    // 2. Start OCR Process
    startOcr(file);
  };

  const startOcr = async (file: File) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const rawText = await recognizeResultImage(
        file,
        (info) => {
          setProgressInfo(info);
        },
        signal
      );

      setProgressInfo({
        status: 'parsing',
        progress: 99,
        statusMessage: 'Parsing credentials...'
      });

      const parsed = parseOcrResult(rawText, category);
      setExtractedData(parsed);
      setProgressInfo({ status: 'review', progress: 100, statusMessage: 'Done' });
    } catch (err) {
      if (signal.aborted) {
        setProgressInfo({ status: 'idle', progress: 0, statusMessage: '' });
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : 'OCR failed to process the image.');
      setProgressInfo({ status: 'error', progress: 0, statusMessage: '' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleConfirm = (payload: OcrReviewPayload) => {
    onApplyPayload(payload);
    handleClose();
  };

  const handleRescan = () => {
    cleanupPreview();
    setSelectedFile(null);
    setExtractedData(null);
    setErrorMsg(null);
    setProgressInfo({ status: 'idle', progress: 0, statusMessage: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ocr-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-[#0F2942] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 id="ocr-modal-title" className="text-base font-bold text-white">
                Scan Academic Result Slip
              </h2>
              <p className="text-xs text-slate-300">
                Local in-browser OCR interpreter for UTME, O'Level & Post-UTME
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* If in Review State, show review screen */}
          {extractedData && progressInfo.status === 'review' ? (
            <OcrReviewForm
              data={extractedData}
              imageUrl={previewUrl || undefined}
              onConfirm={handleConfirm}
              onCancel={handleClose}
              onRescan={handleRescan}
            />
          ) : (
            <>
              {/* Category Selector Tabs */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Result Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('UTME')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                      category === 'UTME'
                        ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    JAMB UTME Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('OLEVEL')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                      category === 'OLEVEL'
                        ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    O'Level Certificate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('PUTME')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                      category === 'PUTME'
                        ? 'bg-[#0F2942] text-white border-[#0F2942] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    UNILAG Post-UTME
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <OcrPrivacyNotice />

              {/* Error Alert */}
              {errorMsg && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-bold">Upload Error:</span> {errorMsg}
                  </div>
                </div>
              )}

              {/* Upload Dropzone or Progress Bar */}
              {progressInfo.status !== 'idle' && progressInfo.status !== 'error' ? (
                <div className="p-8 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#0F2942] animate-spin flex items-center justify-center text-[#0F2942]">
                  </div>
                  <div className="space-y-1 w-full max-w-md">
                    <div className="text-sm font-bold text-[#0F2942]">
                      {progressInfo.statusMessage || 'Processing document...'}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#0F2942] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressInfo.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium pt-1">
                      {progressInfo.progress}% completed (running in your browser)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-rose-600 font-semibold hover:underline pt-2"
                  >
                    Cancel Scan
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#0F2942] hover:bg-slate-50/50 transition-all rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-slate-200 text-slate-600 group-hover:text-[#0F2942] flex items-center justify-center transition-colors mb-3">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to select an image, or drag & drop here
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Supports clear photographs or screenshots of your {category === 'UTME' ? 'JAMB' : category === 'OLEVEL' ? "O'Level" : 'Post-UTME'} slip.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full">
                    <span>JPEG, PNG, WebP</span>
                    <span>•</span>
                    <span>Max 5.00 MB</span>
                  </div>
                </div>
              )}

              {/* Instructions and tips */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800">Tips for Best Scanning Accuracy:</span>
                <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-600">
                  <li>Ensure good lighting and avoid reflections or shadows on phone screens.</li>
                  <li>Crop out unnecessary borders, backgrounds, or fingers.</li>
                  <li>Hold the camera straight without perspective distortion.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

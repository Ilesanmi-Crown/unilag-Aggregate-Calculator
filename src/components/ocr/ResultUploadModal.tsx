'use client';

import React, { useReducer, useState, useRef, useEffect, useCallback } from 'react';
import {
  ResultCategory,
  OcrReviewPayload,
  MultiSlotCompletePayload
} from '../../ocr/types';
import {
  createInitialWorkflowState,
  workflowReducer,
  isWorkflowComplete,
  getMissingCategoryLabels,
  getConfirmedCount,
  getSelectedUnprocessedCount,
  getConfirmedData,
  CATEGORY_LABELS,
  ALL_CATEGORIES
} from '../../ocr/workflow';
import { validateUploadedFile } from '../../ocr/validator';
import { recognizeResultImage } from '../../ocr/engine';
import { parseOcrResult } from '../../ocr/parser';
import { UploadSlotCard } from './UploadSlotCard';
import { OcrReviewForm } from './OcrReviewForm';
import { FinalReviewScreen } from './FinalReviewScreen';
import { OcrPrivacyNotice } from './OcrPrivacyNotice';

interface ResultUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPayload?: (payload: OcrReviewPayload) => void;
  onApplyAll?: (payload: MultiSlotCompletePayload) => void;
}

export const ResultUploadModal: React.FC<ResultUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyPayload,
  onApplyAll
}) => {
  const [state, dispatch] = useReducer(workflowReducer, undefined, createInitialWorkflowState);
  const [activeView, setActiveView] = useState<'slots' | 'review_slot' | 'final_review'>('slots');
  const [activeReviewCategory, setActiveReviewCategory] = useState<ResultCategory>('UTME');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isProcessingAny, setIsProcessingAny] = useState<boolean>(false);
  const abortControllersRef = useRef<Record<string, AbortController | null>>({
    UTME: null,
    PUTME: null,
    OLEVEL: null
  });

  // Track created preview URLs to clean them up on unmount or reset
  const createdUrlsRef = useRef<Set<string>>(new Set());

  const registerPreviewUrl = useCallback((url: string) => {
    createdUrlsRef.current.add(url);
    return url;
  }, []);

  const cleanupAllUrls = useCallback(() => {
    createdUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignored
      }
    });
    createdUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      cleanupAllUrls();
      Object.values(abortControllersRef.current).forEach((ctrl) => ctrl?.abort());
    };
  }, [cleanupAllUrls]);

  // Handle ESC key to dismiss modal
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
    Object.values(abortControllersRef.current).forEach((ctrl) => ctrl?.abort());
    cleanupAllUrls();
    dispatch({ type: 'RESET_ALL' });
    setActiveView('slots');
    setGeneralError(null);
    setIsProcessingAny(false);
    onClose();
  };

  // 1. Handle File Selection for an individual slot (Supports any order)
  const handleSelectFile = async (category: ResultCategory, file: File) => {
    setGeneralError(null);

    // Validate size and magic header
    const validation = await validateUploadedFile(file);
    if (!validation.valid) {
      dispatch({
        type: 'FINISH_PROCESSING_ERROR',
        category,
        error: validation.error || 'Invalid file format or size.'
      });
      return;
    }

    const objectUrl = registerPreviewUrl(URL.createObjectURL(file));

    dispatch({
      type: 'SELECT_FILE',
      category,
      file,
      fileName: file.name,
      previewUrl: objectUrl
    });
  };

  // 2. Process a single slot
  const handleProcessSlot = async (category: ResultCategory) => {
    const slot = state[category];
    if (!slot.file) return;

    setGeneralError(null);
    setIsProcessingAny(true);

    const abortCtrl = new AbortController();
    abortControllersRef.current[category] = abortCtrl;

    dispatch({ type: 'START_PROCESSING', category });

    try {
      const rawText = await recognizeResultImage(
        slot.file,
        (info) => {
          dispatch({
            type: 'UPDATE_PROGRESS',
            category,
            progress: info.progress,
            statusMessage: info.statusMessage
          });
        },
        abortCtrl.signal
      );

      const parsed = parseOcrResult(rawText, category);
      dispatch({
        type: 'FINISH_PROCESSING_SUCCESS',
        category,
        extractedData: parsed
      });

      // Automatically invite user to review if processed individually
      setActiveReviewCategory(category);
      setActiveView('review_slot');
    } catch (err) {
      if (abortCtrl.signal.aborted) {
        dispatch({
          type: 'FINISH_PROCESSING_ERROR',
          category,
          error: 'Processing was cancelled.'
        });
        return;
      }
      dispatch({
        type: 'FINISH_PROCESSING_ERROR',
        category,
        error: err instanceof Error ? err.message : 'OCR failed to process this image.'
      });
    } finally {
      abortControllersRef.current[category] = null;
      setIsProcessingAny(false);
    }
  };

  // 3. Process all selected unprocessed slots sequentially
  const handleProcessAllSelected = async () => {
    const categoriesToProcess = ALL_CATEGORIES.filter(
      (cat) => state[cat].status === 'image_selected' && state[cat].file
    );

    if (categoriesToProcess.length === 0) return;

    setGeneralError(null);
    setIsProcessingAny(true);

    for (const cat of categoriesToProcess) {
      const slot = state[cat];
      if (!slot.file) continue;

      const abortCtrl = new AbortController();
      abortControllersRef.current[cat] = abortCtrl;
      dispatch({ type: 'START_PROCESSING', category: cat });

      try {
        const rawText = await recognizeResultImage(
          slot.file,
          (info) => {
            dispatch({
              type: 'UPDATE_PROGRESS',
              category: cat,
              progress: info.progress,
              statusMessage: info.statusMessage
            });
          },
          abortCtrl.signal
        );

        const parsed = parseOcrResult(rawText, cat);
        dispatch({
          type: 'FINISH_PROCESSING_SUCCESS',
          category: cat,
          extractedData: parsed
        });
      } catch (err) {
        if (!abortCtrl.signal.aborted) {
          dispatch({
            type: 'FINISH_PROCESSING_ERROR',
            category: cat,
            error: err instanceof Error ? err.message : 'OCR failed to process this image.'
          });
        }
      } finally {
        abortControllersRef.current[cat] = null;
      }
    }

    setIsProcessingAny(false);
  };

  // 4. Remove a slot
  const handleRemoveSlot = (category: ResultCategory) => {
    const ctrl = abortControllersRef.current[category];
    if (ctrl) {
      ctrl.abort();
      abortControllersRef.current[category] = null;
    }
    const slot = state[category];
    if (slot.previewUrl) {
      URL.revokeObjectURL(slot.previewUrl);
      createdUrlsRef.current.delete(slot.previewUrl);
    }
    dispatch({ type: 'REMOVE_FILE', category });
  };

  // 5. Open Review for a slot
  const handleOpenReview = (category: ResultCategory) => {
    setActiveReviewCategory(category);
    setActiveView('review_slot');
  };

  // 6. Confirm a slot
  const handleConfirmSlot = (category: ResultCategory, payload: OcrReviewPayload) => {
    dispatch({ type: 'CONFIRM_SLOT', category, payload });
    setActiveView('slots');
  };

  // 7. Edit a slot
  const handleEditSlot = (category: ResultCategory) => {
    dispatch({ type: 'EDIT_SLOT', category });
    setActiveReviewCategory(category);
    setActiveView('review_slot');
  };

  // 8. Proceed to Final Review
  const handleProceedToFinalReview = () => {
    if (!isWorkflowComplete(state)) {
      const missing = getMissingCategoryLabels(state);
      setGeneralError(`Cannot proceed: Missing confirmation for ${missing.join(', ')}.`);
      return;
    }
    setGeneralError(null);
    setActiveView('final_review');
  };

  // 9. Apply Complete Workflow to Calculator
  const handleFinalApply = (completePayload: MultiSlotCompletePayload) => {
    if (onApplyAll) {
      onApplyAll(completePayload);
    } else if (onApplyPayload) {
      onApplyPayload(completePayload.utme);
      onApplyPayload(completePayload.putme);
      onApplyPayload(completePayload.olevel);
    }
    handleClose();
  };

  const confirmedCount = getConfirmedCount(state);
  const selectedUnprocessed = getSelectedUnprocessedCount(state);
  const complete = isWorkflowComplete(state);
  const confirmedData = getConfirmedData(state);
  const currentReviewSlot = state[activeReviewCategory];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ocr-workflow-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Minimal Academic Header */}
        <div className="px-5 py-4 bg-[#0F2942] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-emerald-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 id="ocr-workflow-modal-title" className="text-sm sm:text-base font-bold text-white">
                Result Image Interpreter
              </h2>
              <p className="text-xs text-slate-300">
                Upload your three result slips in any order • Processed locally in your browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* VIEW 1: FINAL REVIEW SCREEN */}
          {activeView === 'final_review' && confirmedData ? (
            <FinalReviewScreen
              data={confirmedData}
              onApplyAll={handleFinalApply}
              onEditCategory={(cat) => {
                dispatch({ type: 'EDIT_SLOT', category: cat });
                setActiveReviewCategory(cat);
                setActiveView('review_slot');
              }}
              onBack={() => setActiveView('slots')}
            />
          ) : activeView === 'review_slot' && currentReviewSlot?.extractedData ? (
            /* VIEW 2: DEDICATED FULL-WIDTH REVIEW FOR A SINGLE SLOT */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveView('slots')}
                  className="text-xs font-semibold text-[#0F2942] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to 3-Slot Overview
                </button>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Reviewing: {CATEGORY_LABELS[activeReviewCategory]}
                </span>
              </div>

              <OcrReviewForm
                data={currentReviewSlot.extractedData}
                imageUrl={currentReviewSlot.previewUrl || undefined}
                onConfirm={(payload) => handleConfirmSlot(activeReviewCategory, payload)}
                onCancel={() => setActiveView('slots')}
                onRescan={() => {
                  handleRemoveSlot(activeReviewCategory);
                  setActiveView('slots');
                }}
              />
            </div>
          ) : (
            /* VIEW 3: 3-SLOT OVERVIEW (FLEXIBLE ORDER) */
            <>
              {/* Progress and Completion Status Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-[#0F2942]">Overall Completion:</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {confirmedCount} of 3 Confirmed
                    </span>
                  </div>
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#0F2942] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(confirmedCount / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedUnprocessed > 0 && (
                    <button
                      type="button"
                      onClick={handleProcessAllSelected}
                      disabled={isProcessingAny}
                      className="px-3 py-1.5 rounded-lg bg-[#0F2942] hover:bg-[#163859] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Process All Selected ({selectedUnprocessed})
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleProceedToFinalReview}
                    disabled={!complete}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      complete
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Final Review →
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <OcrPrivacyNotice />

              {/* General Error or Missing Warning */}
              {generalError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{generalError}</span>
                </div>
              )}

              {/* Three Independent Upload Slots (Flexible Order) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Slot 1: JAMB UTME */}
                <UploadSlotCard
                  slot={state.UTME}
                  title="JAMB UTME Result"
                  description="Original JAMB slip showing aggregate score (0–400)."
                  onFileSelect={(file) => handleSelectFile('UTME', file)}
                  onProcess={() => handleProcessSlot('UTME')}
                  onRemove={() => handleRemoveSlot('UTME')}
                  onOpenReview={() => handleOpenReview('UTME')}
                  onEdit={() => handleEditSlot('UTME')}
                  isProcessingOther={isProcessingAny}
                />

                {/* Slot 2: UNILAG Post-UTME */}
                <UploadSlotCard
                  slot={state.PUTME}
                  title="UNILAG Post-UTME Result"
                  description="Screening portal slip showing score over 30.000."
                  onFileSelect={(file) => handleSelectFile('PUTME', file)}
                  onProcess={() => handleProcessSlot('PUTME')}
                  onRemove={() => handleRemoveSlot('PUTME')}
                  onOpenReview={() => handleOpenReview('PUTME')}
                  onEdit={() => handleEditSlot('PUTME')}
                  isProcessingOther={isProcessingAny}
                />

                {/* Slot 3: WAEC / O'Level */}
                <UploadSlotCard
                  slot={state.OLEVEL}
                  title="WAEC / O'Level Result"
                  description="Senior Secondary Certificate showing grades for 5 subjects."
                  onFileSelect={(file) => handleSelectFile('OLEVEL', file)}
                  onProcess={() => handleProcessSlot('OLEVEL')}
                  onRemove={() => handleRemoveSlot('OLEVEL')}
                  onOpenReview={() => handleOpenReview('OLEVEL')}
                  onEdit={() => handleEditSlot('OLEVEL')}
                  isProcessingOther={isProcessingAny}
                />
              </div>

              {/* Bottom Instructions and Manual Entry Switch */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
                <span>
                  Slips can be uploaded in any order. The final review is unlocked once all 3 categories are confirmed.
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="font-semibold text-slate-700 hover:text-slate-900 underline text-left sm:text-right cursor-pointer"
                >
                  Switch to Manual Entry
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

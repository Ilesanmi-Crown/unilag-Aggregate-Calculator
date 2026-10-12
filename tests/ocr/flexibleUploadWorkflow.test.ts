import { describe, it, expect } from 'vitest';
import {
  createInitialWorkflowState,
  workflowReducer,
  isWorkflowComplete,
  isSlotConfirmed,
  getMissingCategories,
  getMissingCategoryLabels,
  canProceedToFinalReview,
  getConfirmedData,
  getConfirmedCount,
  getSelectedUnprocessedCount
} from '../../src/ocr/workflow';
import { ResultCategory, OcrReviewPayload, ExtractedResultData } from '../../src/ocr/types';
import { calculateAggregate } from '../../src/core/calculator';
import { SubjectGrade } from '../../src/core/types';

// Mock payloads for each category
const mockUtmePayload: OcrReviewPayload = {
  category: 'UTME',
  utmeScore: 290,
  examYear: '2025'
};

const mockPutmePayload: OcrReviewPayload = {
  category: 'PUTME',
  putmeScore: 25.5,
  examYear: '2025/2026'
};

const mockOlevelPayload: OcrReviewPayload = {
  category: 'OLEVEL',
  olevelSubjects: [
    { subjectName: 'English Language', grade: 'A1' },
    { subjectName: 'Mathematics', grade: 'B2' },
    { subjectName: 'Physics', grade: 'A1' },
    { subjectName: 'Chemistry', grade: 'B3' },
    { subjectName: 'Biology', grade: 'C4' }
  ],
  examBody: 'WAEC',
  examYear: '2024'
};

const mockExtractedUtme: ExtractedResultData = {
  category: 'UTME',
  totalScore: 290,
  subjects: [],
  confidence: 'high',
  uncertainties: [],
  rawText: 'UTME TOTAL: 290'
};

const mockExtractedPutme: ExtractedResultData = {
  category: 'PUTME',
  score: 25.5,
  maxScore: 30.0,
  confidence: 'high',
  uncertainties: [],
  rawText: 'POST-UTME SCORE: 25.50'
};

const mockExtractedOlevel: ExtractedResultData = {
  category: 'OLEVEL',
  subjects: [
    { subjectName: 'English Language', grade: 'A1', confidence: 'high' },
    { subjectName: 'Mathematics', grade: 'B2', confidence: 'high' },
    { subjectName: 'Physics', grade: 'A1', confidence: 'high' },
    { subjectName: 'Chemistry', grade: 'B3', confidence: 'high' },
    { subjectName: 'Biology', grade: 'C4', confidence: 'high' }
  ],
  confidence: 'high',
  uncertainties: [],
  rawText: 'WASSCE 2024'
};

function getMockDataForCategory(category: ResultCategory): {
  extracted: ExtractedResultData;
  payload: OcrReviewPayload;
} {
  switch (category) {
    case 'UTME':
      return { extracted: mockExtractedUtme, payload: mockUtmePayload };
    case 'PUTME':
      return { extracted: mockExtractedPutme, payload: mockPutmePayload };
    case 'OLEVEL':
      return { extracted: mockExtractedOlevel, payload: mockOlevelPayload };
  }
}

describe('Flexible Result Upload Order & Multi-Slot Workflow', () => {
  // Test all 6 possible permutation upload orders
  const allPermutations: ResultCategory[][] = [
    ['UTME', 'PUTME', 'OLEVEL'],
    ['UTME', 'OLEVEL', 'PUTME'],
    ['PUTME', 'UTME', 'OLEVEL'],
    ['PUTME', 'OLEVEL', 'UTME'],
    ['OLEVEL', 'UTME', 'PUTME'],
    ['OLEVEL', 'PUTME', 'UTME']
  ];

  allPermutations.forEach((sequence) => {
    const sequenceLabel = sequence.join(' → ');
    it(`supports upload, processing, and confirmation in order: ${sequenceLabel}`, () => {
      let state = createInitialWorkflowState();
      expect(isWorkflowComplete(state)).toBe(false);

      sequence.forEach((cat, stepIndex) => {
        const { extracted, payload } = getMockDataForCategory(cat);

        // 1. Select file
        state = workflowReducer(state, {
          type: 'SELECT_FILE',
          category: cat,
          file: new File([''], `${cat.toLowerCase()}-slip.png`),
          fileName: `${cat.toLowerCase()}-slip.png`
        });
        expect(state[cat].status).toBe('image_selected');
        expect(isSlotConfirmed(state[cat])).toBe(false);

        // 2. Start processing
        state = workflowReducer(state, {
          type: 'START_PROCESSING',
          category: cat
        });
        expect(state[cat].status).toBe('processing');

        // 3. Complete processing
        state = workflowReducer(state, {
          type: 'FINISH_PROCESSING_SUCCESS',
          category: cat,
          extractedData: extracted
        });
        expect(state[cat].status).toBe('ready_for_review');
        expect(isSlotConfirmed(state[cat])).toBe(false);

        // 4. Confirm slot
        state = workflowReducer(state, {
          type: 'CONFIRM_SLOT',
          category: cat,
          payload
        });
        expect(state[cat].status).toBe('confirmed');
        expect(isSlotConfirmed(state[cat])).toBe(true);

        // Check if workflow complete only on final step
        if (stepIndex < 2) {
          expect(isWorkflowComplete(state)).toBe(false);
          expect(canProceedToFinalReview(state)).toBe(false);
        } else {
          expect(isWorkflowComplete(state)).toBe(true);
          expect(canProceedToFinalReview(state)).toBe(true);
        }
      });

      const confirmedData = getConfirmedData(state);
      expect(confirmedData).not.toBeNull();
      expect(confirmedData?.utme.utmeScore).toBe(290);
      expect(confirmedData?.putme.putmeScore).toBe(25.5);
      expect(confirmedData?.olevel.olevelSubjects?.length).toBe(5);
    });
  });

  it('allows selecting all three images before processing begins', () => {
    let state = createInitialWorkflowState();

    // Select UTME
    state = workflowReducer(state, {
      type: 'SELECT_FILE',
      category: 'UTME',
      file: new File([''], 'jamb.jpg'),
      fileName: 'jamb.jpg'
    });
    // Select Post-UTME
    state = workflowReducer(state, {
      type: 'SELECT_FILE',
      category: 'PUTME',
      file: new File([''], 'putme.jpg'),
      fileName: 'putme.jpg'
    });
    // Select O'Level
    state = workflowReducer(state, {
      type: 'SELECT_FILE',
      category: 'OLEVEL',
      file: new File([''], 'waec.jpg'),
      fileName: 'waec.jpg'
    });

    expect(getSelectedUnprocessedCount(state)).toBe(3);
    expect(getConfirmedCount(state)).toBe(0);
    expect(isWorkflowComplete(state)).toBe(false);
    expect(canProceedToFinalReview(state)).toBe(false);

    // Each slot has its file without interfering with others
    expect(state.UTME.fileName).toBe('jamb.jpg');
    expect(state.PUTME.fileName).toBe('putme.jpg');
    expect(state.OLEVEL.fileName).toBe('waec.jpg');
  });

  it('identifies missing categories and keeps workflow incomplete until all three are confirmed', () => {
    let state = createInitialWorkflowState();
    expect(getMissingCategories(state)).toEqual(['UTME', 'PUTME', 'OLEVEL']);
    expect(getMissingCategoryLabels(state)).toEqual([
      'JAMB UTME Result',
      'UNILAG Post-UTME Result',
      "WAEC/O'Level Result"
    ]);

    // Confirm only UTME
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'UTME',
      payload: mockUtmePayload
    });

    expect(isWorkflowComplete(state)).toBe(false);
    expect(canProceedToFinalReview(state)).toBe(false);
    expect(getMissingCategories(state)).toEqual(['PUTME', 'OLEVEL']);
    expect(getMissingCategoryLabels(state)).toEqual([
      'UNILAG Post-UTME Result',
      "WAEC/O'Level Result"
    ]);

    // Confirm O'Level (leaving PUTME missing)
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'OLEVEL',
      payload: mockOlevelPayload
    });

    expect(isWorkflowComplete(state)).toBe(false);
    expect(canProceedToFinalReview(state)).toBe(false);
    expect(getMissingCategories(state)).toEqual(['PUTME']);
    expect(getMissingCategoryLabels(state)).toEqual(['UNILAG Post-UTME Result']);
  });

  it('ensures selecting an image alone does NOT count as confirmation', () => {
    let state = createInitialWorkflowState();

    state = workflowReducer(state, {
      type: 'SELECT_FILE',
      category: 'UTME',
      file: new File([''], 'utme.png'),
      fileName: 'utme.png'
    });

    expect(state.UTME.status).toBe('image_selected');
    expect(state.UTME.confirmedPayload).toBeNull();
    expect(isSlotConfirmed(state.UTME)).toBe(false);
    expect(isWorkflowComplete(state)).toBe(false);
  });

  it('ensures confirming one category does not confirm the others', () => {
    let state = createInitialWorkflowState();

    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'UTME',
      payload: mockUtmePayload
    });

    expect(state.UTME.status).toBe('confirmed');
    expect(state.PUTME.status).toBe('not_uploaded');
    expect(state.OLEVEL.status).toBe('not_uploaded');
    expect(state.PUTME.confirmedPayload).toBeNull();
    expect(state.OLEVEL.confirmedPayload).toBeNull();
    expect(getConfirmedCount(state)).toBe(1);
  });

  it('preserves other confirmed slots when one slot is replaced or removed', () => {
    let state = createInitialWorkflowState();

    // Confirm UTME and OLEVEL
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'UTME',
      payload: mockUtmePayload
    });
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'OLEVEL',
      payload: mockOlevelPayload
    });

    expect(state.UTME.status).toBe('confirmed');
    expect(state.OLEVEL.status).toBe('confirmed');

    // Replace UTME with a new image
    state = workflowReducer(state, {
      type: 'SELECT_FILE',
      category: 'UTME',
      file: new File([''], 'new-utme.png'),
      fileName: 'new-utme.png'
    });

    // UTME is invalidated until reviewed, but O'Level remains completely confirmed
    expect(state.UTME.status).toBe('image_selected');
    expect(state.UTME.confirmedPayload).toBeNull();
    expect(state.OLEVEL.status).toBe('confirmed');
    expect(state.OLEVEL.confirmedPayload).not.toBeNull();
    expect(state.OLEVEL.confirmedPayload?.category).toBe('OLEVEL');

    // Remove O'Level
    state = workflowReducer(state, {
      type: 'REMOVE_FILE',
      category: 'OLEVEL'
    });

    expect(state.OLEVEL.status).toBe('not_uploaded');
    expect(state.OLEVEL.confirmedPayload).toBeNull();
    // UTME remains as selected
    expect(state.UTME.status).toBe('image_selected');
    expect(state.UTME.fileName).toBe('new-utme.png');
  });

  it('isolates OCR failure in one slot so it does not block the other categories', () => {
    let state = createInitialWorkflowState();

    // Fail UTME OCR
    state = workflowReducer(state, {
      type: 'FINISH_PROCESSING_ERROR',
      category: 'UTME',
      error: 'Text was blurred or unreadable.'
    });

    expect(state.UTME.status).toBe('needs_attention');
    expect(state.UTME.error).toBe('Text was blurred or unreadable.');

    // PUTME and OLEVEL can still proceed normally
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'PUTME',
      payload: mockPutmePayload
    });
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'OLEVEL',
      payload: mockOlevelPayload
    });

    expect(state.PUTME.status).toBe('confirmed');
    expect(state.OLEVEL.status).toBe('confirmed');
    expect(isWorkflowComplete(state)).toBe(false); // Still incomplete because UTME needs attention

    // User re-uploads clearer UTME slip
    state = workflowReducer(state, {
      type: 'SELECT_FILE',
      category: 'UTME',
      file: new File([''], 'clear-utme.png'),
      fileName: 'clear-utme.png'
    });

    expect(state.UTME.status).toBe('image_selected');
    expect(state.UTME.error).toBeNull();

    // Confirm UTME
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'UTME',
      payload: mockUtmePayload
    });

    // Now all 3 are confirmed
    expect(isWorkflowComplete(state)).toBe(true);
    expect(canProceedToFinalReview(state)).toBe(true);
  });

  it('cannot proceed to final review with missing or unconfirmed data', () => {
    const state = createInitialWorkflowState();
    expect(canProceedToFinalReview(state)).toBe(false);
    expect(getConfirmedData(state)).toBeNull();
  });

  it('integrates confirmed multi-slot payload into the calculation engine accurately', () => {
    let state = createInitialWorkflowState();

    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'UTME',
      payload: mockUtmePayload
    });
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'PUTME',
      payload: mockPutmePayload
    });
    state = workflowReducer(state, {
      type: 'CONFIRM_SLOT',
      category: 'OLEVEL',
      payload: mockOlevelPayload
    });

    expect(isWorkflowComplete(state)).toBe(true);
    const confirmed = getConfirmedData(state)!;

    // Execute engine calculation with confirmed results
    const response = calculateAggregate({
      session: '2025/2026',
      utmeScore: confirmed.utme.utmeScore!,
      putmeScore: confirmed.putme.putmeScore!,
      olevelGrades: confirmed.olevel.olevelSubjects!.slice(0, 5) as SubjectGrade[]
    });

    expect(response.success).toBe(true);
    if (response.success) {
      // UTME: 290 * 0.125 = 36.25
      expect(response.breakdown.utmePoints).toBe(36.25);
      // Putme: 25.5
      expect(response.breakdown.putmePoints).toBe(25.5);
      // O'Level: A1(4.0) + B2(3.6) + A1(4.0) + B3(3.2) + C4(2.8) = 17.6
      expect(response.breakdown.olevelPoints).toBe(17.6);
      // Total: 36.25 + 25.5 + 17.6 = 79.350
      expect(response.breakdown.totalAggregate).toBe(79.35);
      expect(response.breakdown.formatted.totalAggregate).toBe('79.350');
    }
  });
});

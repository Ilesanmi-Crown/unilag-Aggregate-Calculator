import {
  ResultCategory,
  ResultSlotState,
  MultiSlotWorkflowState,
  MultiSlotCompletePayload,
  OcrReviewPayload,
  ExtractedResultData
} from './types';

export const CATEGORY_LABELS: Record<ResultCategory, string> = {
  UTME: 'JAMB UTME Result',
  PUTME: 'UNILAG Post-UTME Result',
  OLEVEL: "WAEC/O'Level Result"
};

export const ALL_CATEGORIES: ResultCategory[] = ['UTME', 'PUTME', 'OLEVEL'];

export function createInitialSlotState(category: ResultCategory): ResultSlotState {
  return {
    category,
    status: 'not_uploaded',
    file: null,
    fileName: undefined,
    previewUrl: null,
    extractedData: null,
    confirmedPayload: null,
    error: null,
    progress: 0,
    statusMessage: ''
  };
}

export function createInitialWorkflowState(): MultiSlotWorkflowState {
  return {
    UTME: createInitialSlotState('UTME'),
    PUTME: createInitialSlotState('PUTME'),
    OLEVEL: createInitialSlotState('OLEVEL')
  };
}

export type WorkflowAction =
  | {
      type: 'SELECT_FILE';
      category: ResultCategory;
      file: File;
      fileName: string;
      previewUrl?: string;
    }
  | {
      type: 'REMOVE_FILE';
      category: ResultCategory;
    }
  | {
      type: 'START_PROCESSING';
      category: ResultCategory;
    }
  | {
      type: 'UPDATE_PROGRESS';
      category: ResultCategory;
      progress: number;
      statusMessage: string;
    }
  | {
      type: 'FINISH_PROCESSING_SUCCESS';
      category: ResultCategory;
      extractedData: ExtractedResultData;
    }
  | {
      type: 'FINISH_PROCESSING_ERROR';
      category: ResultCategory;
      error: string;
    }
  | {
      type: 'CONFIRM_SLOT';
      category: ResultCategory;
      payload: OcrReviewPayload;
    }
  | {
      type: 'EDIT_SLOT';
      category: ResultCategory;
    }
  | {
      type: 'RESET_ALL';
    };

export function workflowReducer(
  state: MultiSlotWorkflowState,
  action: WorkflowAction
): MultiSlotWorkflowState {
  switch (action.type) {
    case 'SELECT_FILE': {
      const current = state[action.category];
      return {
        ...state,
        [action.category]: {
          ...current,
          status: 'image_selected',
          file: action.file,
          fileName: action.fileName,
          previewUrl: action.previewUrl ?? null,
          extractedData: null, // Invalidate previous extraction until reviewed
          confirmedPayload: null, // Replacing invalidates previous confirmation
          error: null,
          progress: 0,
          statusMessage: 'Image selected. Ready to process.'
        }
      };
    }

    case 'REMOVE_FILE': {
      return {
        ...state,
        [action.category]: createInitialSlotState(action.category)
      };
    }

    case 'START_PROCESSING': {
      const current = state[action.category];
      return {
        ...state,
        [action.category]: {
          ...current,
          status: 'processing',
          progress: 5,
          statusMessage: 'Starting recognition...',
          error: null
        }
      };
    }

    case 'UPDATE_PROGRESS': {
      const current = state[action.category];
      return {
        ...state,
        [action.category]: {
          ...current,
          progress: action.progress,
          statusMessage: action.statusMessage
        }
      };
    }

    case 'FINISH_PROCESSING_SUCCESS': {
      const current = state[action.category];
      return {
        ...state,
        [action.category]: {
          ...current,
          status: 'ready_for_review',
          extractedData: action.extractedData,
          progress: 100,
          statusMessage: 'Recognition complete. Ready for review.',
          error: null
        }
      };
    }

    case 'FINISH_PROCESSING_ERROR': {
      const current = state[action.category];
      return {
        ...state,
        [action.category]: {
          ...current,
          status: 'needs_attention',
          error: action.error,
          progress: 0,
          statusMessage: ''
        }
      };
    }

    case 'CONFIRM_SLOT': {
      const current = state[action.category];
      return {
        ...state,
        [action.category]: {
          ...current,
          status: 'confirmed',
          confirmedPayload: action.payload,
          error: null
        }
      };
    }

    case 'EDIT_SLOT': {
      const current = state[action.category];
      if (current.status === 'confirmed' || current.status === 'ready_for_review') {
        return {
          ...state,
          [action.category]: {
            ...current,
            status: 'ready_for_review'
          }
        };
      }
      return state;
    }

    case 'RESET_ALL': {
      return createInitialWorkflowState();
    }

    default:
      return state;
  }
}

/**
 * Checks whether an individual slot is successfully confirmed.
 */
export function isSlotConfirmed(slot: ResultSlotState): boolean {
  return slot.status === 'confirmed' && slot.confirmedPayload !== null;
}

/**
 * Returns true if and only if all three required categories (UTME, PUTME, OLEVEL)
 * have been reviewed and confirmed.
 */
export function isWorkflowComplete(state: MultiSlotWorkflowState): boolean {
  return (
    isSlotConfirmed(state.UTME) &&
    isSlotConfirmed(state.PUTME) &&
    isSlotConfirmed(state.OLEVEL)
  );
}

/**
 * Identifies categories that are either missing an image, un-processed,
 * currently in error, or unconfirmed.
 */
export function getMissingCategories(state: MultiSlotWorkflowState): ResultCategory[] {
  return ALL_CATEGORIES.filter((cat) => !isSlotConfirmed(state[cat]));
}

/**
 * Returns human-readable names of incomplete categories.
 */
export function getMissingCategoryLabels(state: MultiSlotWorkflowState): string[] {
  return getMissingCategories(state).map((cat) => CATEGORY_LABELS[cat]);
}

/**
 * Evaluates whether the user can proceed to the Final Review screen.
 * Strictly requires all 3 categories to be confirmed.
 */
export function canProceedToFinalReview(state: MultiSlotWorkflowState): boolean {
  return isWorkflowComplete(state);
}

/**
 * Extracts the confirmed payload trio. Returns null if any slot is unconfirmed.
 */
export function getConfirmedData(state: MultiSlotWorkflowState): MultiSlotCompletePayload | null {
  if (!isWorkflowComplete(state)) return null;
  return {
    utme: state.UTME.confirmedPayload!,
    putme: state.PUTME.confirmedPayload!,
    olevel: state.OLEVEL.confirmedPayload!
  };
}

/**
 * Calculates the number of confirmed slots (0 to 3).
 */
export function getConfirmedCount(state: MultiSlotWorkflowState): number {
  return ALL_CATEGORIES.filter((cat) => isSlotConfirmed(state[cat])).length;
}

/**
 * Calculates the number of selected but unprocessed slots.
 */
export function getSelectedUnprocessedCount(state: MultiSlotWorkflowState): number {
  return ALL_CATEGORIES.filter((cat) => state[cat].status === 'image_selected').length;
}

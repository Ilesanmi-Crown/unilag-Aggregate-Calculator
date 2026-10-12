import { SubjectGrade, OlevelGrade } from '../core/types';

export type ResultCategory = 'UTME' | 'OLEVEL' | 'PUTME';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  format?: 'jpeg' | 'png' | 'webp';
  sizeBytes?: number;
}

export interface ExtractedUtmeSubject {
  name: string;
  score: number;
  confidence: ConfidenceLevel;
}

export interface ExtractedUtmeData {
  category: 'UTME';
  totalScore?: number;
  subjects: ExtractedUtmeSubject[];
  candidateName?: string;
  examYear?: string;
  registrationNumberMasked?: string;
  confidence: ConfidenceLevel;
  uncertainties: string[];
  rawText: string;
}

export interface ExtractedOlevelSubject {
  subjectName: string;
  grade: OlevelGrade; // A1, B2, B3, C4, C5, C6, D7, E8, F9
  confidence: ConfidenceLevel;
}

export interface ExtractedOlevelData {
  category: 'OLEVEL';
  subjects: ExtractedOlevelSubject[];
  examBody?: 'WAEC' | 'NECO' | 'NABTEB' | 'GCE' | 'OTHER';
  examYear?: string;
  sitting?: number;
  candidateName?: string;
  confidence: ConfidenceLevel;
  uncertainties: string[];
  rawText: string;
}

export interface ExtractedPutmeData {
  category: 'PUTME';
  score?: number; // 0 - 30.0
  maxScore: number; // 30.0
  candidateName?: string;
  examYear?: string;
  confidence: ConfidenceLevel;
  uncertainties: string[];
  rawText: string;
}

export type ExtractedResultData =
  | ExtractedUtmeData
  | ExtractedOlevelData
  | ExtractedPutmeData;

export interface OcrProgressInfo {
  status: 'idle' | 'validating' | 'loading_engine' | 'recognizing' | 'parsing' | 'review' | 'error';
  progress: number; // 0 to 100
  statusMessage: string;
  error?: string;
}

export interface OcrReviewPayload {
  category: ResultCategory;
  utmeScore?: number;
  putmeScore?: number;
  olevelSubjects?: SubjectGrade[];
  examYear?: string;
  examBody?: string;
}

export type UploadSlotStatus =
  | 'not_uploaded'
  | 'image_selected'
  | 'processing'
  | 'ready_for_review'
  | 'confirmed'
  | 'needs_attention';

export interface ResultSlotState {
  category: ResultCategory;
  status: UploadSlotStatus;
  file: File | null;
  fileName?: string;
  previewUrl: string | null;
  extractedData: ExtractedResultData | null;
  confirmedPayload: OcrReviewPayload | null;
  error: string | null;
  progress: number;
  statusMessage: string;
}

export type MultiSlotWorkflowState = {
  UTME: ResultSlotState;
  PUTME: ResultSlotState;
  OLEVEL: ResultSlotState;
};

export interface MultiSlotCompletePayload {
  utme: OcrReviewPayload;
  putme: OcrReviewPayload;
  olevel: OcrReviewPayload;
}

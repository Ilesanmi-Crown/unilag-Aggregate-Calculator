/**
 * UNILAG Aggregate Calculator — Shared Domain Types
 *
 * Strict TypeScript types for scoring components, session configurations,
 * departmental cut-offs, inputs, calculation results, and structured errors.
 */

export type VerificationStatus =
  | 'CONFIRMED'
  | 'HISTORICAL_ONLY'
  | 'UNVERIFIED'
  | 'PRELIMINARY';

export type OlevelGrade =
  | 'A1'
  | 'B2'
  | 'B3'
  | 'C4'
  | 'C5'
  | 'C6'
  | 'D7'
  | 'E8'
  | 'F9';

export type PassingOlevelGrade = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6';

export type CatchmentState =
  | 'EKITI'
  | 'LAGOS'
  | 'OGUN'
  | 'ONDO'
  | 'OSUN'
  | 'OYO';

export interface SubjectGrade {
  subjectName: string;
  grade: OlevelGrade;
}

export interface SessionRuleConfig {
  session: string;
  verificationStatus: VerificationStatus;
  isCalculationSupported: boolean;
  weights: {
    utmeMaxScore: number;       // 400
    utmeWeight: number;         // 50 (points)
    putmeMaxScore: number;      // 30 (points)
    putmeWeight: number;        // 30 (points)
    olevelMaxScore: number;     // 20 (points)
    olevelWeight: number;       // 20 (points)
  };
  eligibility: {
    minimumUtmeScore: number;   // 200
    maximumSittings: number;    // 1 (strictly one sitting)
    requiredSubjectCount: number; // 5 (default)
    minimumAge: number;         // 16
    minimumAgeDate?: string;    // e.g. "YYYY-09-30"
    historicalPutmePassMark?: number; // 12.0
  };
  olevelGrading: {
    gradePoints: Record<PassingOlevelGrade, number>;
    failingGradePoints: number; // 0
    minimumQualifyingGrade: PassingOlevelGrade; // 'C6'
  };
  roundingPolicy: {
    decimalPlaces: number;      // 3
    strategy: 'ROUND_HALF_UP';
  };
  source: {
    url: string;
    title: string;
    publishedDate?: string;
    notes?: string;
  };
}

export interface DepartmentCutoffRecord {
  faculty: string;
  programme: string;
  merit: number | null;
  catchment: {
    ekiti: number | null;
    lagos: number | null;
    ogun: number | null;
    ondo: number | null;
    osun: number | null;
    oyo: number | null;
  };
}

export interface CutoffDataset {
  session: string;
  source: {
    title: string;
    url: string;
    publishedDate: string;
    verificationStatus: VerificationStatus;
  };
  disclaimer: string;
  totalProgrammes: number;
  records: DepartmentCutoffRecord[];
}

export interface CandidateInputs {
  session: string;
  utmeScore: number;
  putmeScore: number;
  olevelGrades: SubjectGrade[];
  sittings?: number;
  allowPreliminarySession?: boolean;
}

export interface TargetCalculationInputs {
  session: string;
  targetAggregate: number;
  utmeScore: number;
  olevelGrades: SubjectGrade[];
  allowPreliminarySession?: boolean;
}

export interface AggregateBreakdown {
  utmePoints: number;
  putmePoints: number;
  olevelPoints: number;
  totalAggregate: number;
  formatted: {
    utmePoints: string;
    putmePoints: string;
    olevelPoints: string;
    totalAggregate: string;
  };
}

export interface EligibilityCheck {
  isEligibleForScreening: boolean;
  meetsUtmeMinimum: boolean;
  meetsSittingsRequirement: boolean;
  hasRequiredCreditCount: boolean;
  warnings: string[];
}

export interface AggregateResult {
  success: true;
  session: string;
  verificationStatus: VerificationStatus;
  breakdown: AggregateBreakdown;
  eligibility: EligibilityCheck;
  isPreliminary: boolean;
}

export type CalculationErrorCode =
  | 'UNSUPPORTED_SESSION'
  | 'UNVERIFIED_SESSION'
  | 'INVALID_UTME_SCORE'
  | 'INVALID_PUTME_SCORE'
  | 'INVALID_OLEVEL_GRADES'
  | 'INVALID_SITTINGS'
  | 'INVALID_TARGET_AGGREGATE'
  | 'INVALID_INPUT';

export interface CalculationError {
  success: false;
  code: CalculationErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type AggregateCalculationResponse = AggregateResult | CalculationError;

export type TargetStatus =
  | 'ACHIEVABLE'
  | 'ALREADY_SURPASSED'
  | 'MATHEMATICALLY_IMPOSSIBLE';

export interface TargetCalculationResult {
  success: true;
  session: string;
  verificationStatus: VerificationStatus;
  isPreliminary: boolean;
  targetAggregate: number;
  currentPointsFromUtmeAndOlevel: number;
  requiredPutmeScore: number;
  requiredPutmeScoreFormatted: string;
  isAchievable: boolean;
  status: TargetStatus;
  message: string;
  warning?: string;
}

export type TargetCalculationResponse = TargetCalculationResult | CalculationError;

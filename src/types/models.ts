export type ExamFormat =
  | 'MULTIPLE_CHOICE'
  | 'PERFORMANCE_BASED'
  | 'HANDS_ON_LAB'
  | 'MIXED'
  | 'ORAL_DEFENSE';

export type EntityStatus = 'ACTIVE' | 'RETIRED' | 'BEING_REPLACED';

export type CertLevel = 'ENTRY' | 'ASSOCIATE' | 'PROFESSIONAL' | 'EXPERT' | 'SPECIALTY';

export type LogicType = 'AND' | 'OR';

export type MemberType =
  | 'EXAM'
  | 'CERTIFICATION'
  | 'EXPERIENCE'
  | 'DEGREE'
  | 'OTHER_CREDENTIAL';

export type EdgeType = 'REQUIRED' | 'RECOMMENDED' | 'ALTERNATIVE';

export type SourceType =
  | 'VENDOR_PAGE'
  | 'SALARY_SURVEY'
  | 'JOB_POSTINGS_INDEX'
  | 'COMMUNITY_AGGREGATE'
  | 'OTHER';

export type EntityType = 'CERTIFICATION' | 'EXAM';

export interface VendorModel {
  id: string;
  name: string;
  shortName: string;
  websiteUrl: string;
  logoAssetRef: string;
  description: string;
  foundedYear?: number | null;
  notes?: string | null;
}

export interface DomainModel {
  id: string;
  name: string;
  description: string;
  isEmerging: boolean;
}

export interface ExamModel {
  id: string;
  vendorId: string;
  examCode: string;
  name: string;
  format: ExamFormat;
  costAmountUsd: number;
  costAmountCadOverride?: number | null;
  durationMinutes: number;
  questionCountMin?: number | null;
  questionCountMax?: number | null;
  passingScoreInfo?: string | null;
  status: EntityStatus;
  costLastVerifiedDate: string;
  statusLastVerifiedDate: string;
  officialUrl: string;
}

export interface ScoreBreakdownJson {
  marketValue: number;
  demand: number;
  rigor: number;
  community: number;
  currencyMultiplier: number;
  rawScore: number;
  overallScore: number;
}

export interface CertificationModel {
  id: string;
  vendorId: string;
  name: string;
  acronym: string;
  level: CertLevel;
  vendorLevelLabel?: string | null;
  status: EntityStatus;
  statusNotes?: string | null;
  renewalPeriodMonths: number;
  renewalRequirementsText?: string | null;
  description: string;
  officialUrl: string;
  computedScore?: number | null;
  scoreBreakdown?: ScoreBreakdownJson | null;
  statusLastVerifiedDate: string;
}

export interface SourceModel {
  id: string;
  type: SourceType;
  title: string;
  url: string;
  publisher: string;
  accessedDate: string;
  notes?: string | null;
}

export interface FieldSourceModel {
  id: string;
  entityType: EntityType;
  entityId: string;
  fieldName: string;
  sourceId: string;
}

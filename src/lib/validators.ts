export interface CitationRecord {
  entityType: 'CERTIFICATION' | 'EXAM';
  entityId: string;
  fieldName: string;
  sourceId: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const MANDATORY_CERTIFICATION_FACT_FIELDS = [
  'name',
  'level',
  'renewalPeriodMonths',
  'officialUrl',
];

export const MANDATORY_EXAM_FACT_FIELDS = [
  'examCode',
  'costAmountUsd',
  'durationMinutes',
  'format',
  'officialUrl',
];

/**
 * Enforces strict citation policy:
 * Rejects any save/update where a factual field lacks at least one corresponding FieldSource citation.
 */
export function validateCitations(
  entityType: 'CERTIFICATION' | 'EXAM',
  entityId: string,
  citations: CitationRecord[]
): ValidationResult {
  const errors: string[] = [];
  const requiredFields =
    entityType === 'CERTIFICATION'
      ? MANDATORY_CERTIFICATION_FACT_FIELDS
      : MANDATORY_EXAM_FACT_FIELDS;

  const citedFields = new Set(
    citations
      .filter((c) => c.entityType === entityType && c.entityId === entityId)
      .map((c) => c.fieldName)
  );

  for (const field of requiredFields) {
    if (!citedFields.has(field)) {
      errors.push(
        `[CitationPolicyViolation] Field '${field}' on ${entityType} '${entityId}' requires a cited source link.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates prerequisite group member edge consistency
 */
export function validatePrerequisiteEdgeType(
  groupLogicType: 'AND' | 'OR',
  memberEdgeType: 'REQUIRED' | 'RECOMMENDED' | 'ALTERNATIVE'
): { isValid: boolean; warning?: string } {
  if (memberEdgeType === 'RECOMMENDED') {
    return { isValid: true }; // Customary soft precursor
  }

  if (groupLogicType === 'AND' && memberEdgeType !== 'REQUIRED') {
    return {
      isValid: false,
      warning: `Members of an AND group must have edgeType 'REQUIRED' (or 'RECOMMENDED' if customary). Got '${memberEdgeType}'.`,
    };
  }

  if (groupLogicType === 'OR' && memberEdgeType !== 'ALTERNATIVE') {
    return {
      isValid: false,
      warning: `Members of an OR group must have edgeType 'ALTERNATIVE' (or 'RECOMMENDED' if customary). Got '${memberEdgeType}'.`,
    };
  }

  return { isValid: true };
}

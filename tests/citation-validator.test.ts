import { describe, it, expect } from 'vitest';
import {
  validateCitations,
  validatePrerequisiteEdgeType,
  CitationRecord,
} from '../src/lib/validators';

describe('Citation Policy & Referential Integrity Enforcement', () => {
  it('passes when all mandatory fact fields on Certification have citations', () => {
    const validCitations: CitationRecord[] = [
      { entityType: 'CERTIFICATION', entityId: 'cert:ccna', fieldName: 'name', sourceId: 'src:cisco' },
      { entityType: 'CERTIFICATION', entityId: 'cert:ccna', fieldName: 'level', sourceId: 'src:cisco' },
      { entityType: 'CERTIFICATION', entityId: 'cert:ccna', fieldName: 'renewalPeriodMonths', sourceId: 'src:cisco' },
      { entityType: 'CERTIFICATION', entityId: 'cert:ccna', fieldName: 'officialUrl', sourceId: 'src:cisco' },
    ];

    const result = validateCitations('CERTIFICATION', 'cert:ccna', validCitations);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('rejects save when any mandatory fact field on Certification lacks citation', () => {
    const missingLevelCitation: CitationRecord[] = [
      { entityType: 'CERTIFICATION', entityId: 'cert:ccna', fieldName: 'name', sourceId: 'src:cisco' },
      // 'level' missing
      { entityType: 'CERTIFICATION', entityId: 'cert:ccna', fieldName: 'renewalPeriodMonths', sourceId: 'src:cisco' },
      { entityType: 'CERTIFICATION', entityId: 'cert:ccna', fieldName: 'officialUrl', sourceId: 'src:cisco' },
    ];

    const result = validateCitations('CERTIFICATION', 'cert:ccna', missingLevelCitation);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("Field 'level' on CERTIFICATION 'cert:ccna' requires a cited source link");
  });

  it('enforces mandatory exam fact citations (cost, duration, format, code)', () => {
    const validExamCitations: CitationRecord[] = [
      { entityType: 'EXAM', entityId: 'exam:200-301', fieldName: 'examCode', sourceId: 'src:cisco' },
      { entityType: 'EXAM', entityId: 'exam:200-301', fieldName: 'costAmountUsd', sourceId: 'src:cisco' },
      { entityType: 'EXAM', entityId: 'exam:200-301', fieldName: 'durationMinutes', sourceId: 'src:cisco' },
      { entityType: 'EXAM', entityId: 'exam:200-301', fieldName: 'format', sourceId: 'src:cisco' },
      { entityType: 'EXAM', entityId: 'exam:200-301', fieldName: 'officialUrl', sourceId: 'src:cisco' },
    ];

    const result = validateCitations('EXAM', 'exam:200-301', validExamCitations);
    expect(result.isValid).toBe(true);
  });

  it('validates prerequisite group edge consistency', () => {
    expect(validatePrerequisiteEdgeType('AND', 'REQUIRED').isValid).toBe(true);
    expect(validatePrerequisiteEdgeType('OR', 'ALTERNATIVE').isValid).toBe(true);
    expect(validatePrerequisiteEdgeType('AND', 'RECOMMENDED').isValid).toBe(true); // customary precursor
    expect(validatePrerequisiteEdgeType('AND', 'ALTERNATIVE').isValid).toBe(false);
    expect(validatePrerequisiteEdgeType('OR', 'REQUIRED').isValid).toBe(false);
  });
});

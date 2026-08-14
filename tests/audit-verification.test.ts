import { describe, it, expect } from 'vitest';
import { runQuarterlyDataAudit } from '../scripts/audit-verification';

describe('Quarterly Data Verification Audit Runner', () => {
  it('executes database audit and verifies all 54 certifications have valid primary source coverage', async () => {
    const report = await runQuarterlyDataAudit(90);

    expect(report.totalCertifications).toBe(54);
    expect(report.totalExams).toBeGreaterThanOrEqual(50);
    expect(report.totalSources).toBeGreaterThanOrEqual(14);
    expect(report.coveragePercentage).toBe(100);
    expect(report.unverifiedSourcesCount).toBe(0);
    expect(report.staleRecords.length).toBe(0);
  });
});

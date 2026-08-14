import { prisma } from '../src/lib/db';

export interface AuditReport {
  timestamp: string;
  totalCertifications: number;
  totalExams: number;
  totalSources: number;
  totalFieldSources: number;
  unverifiedSourcesCount: number;
  coveragePercentage: number;
  staleRecords: Array<{ id: string; type: string; name: string; daysSinceVerification: number }>;
  missingCitations: Array<{ entityType: string; entityId: string; fieldName: string }>;
}

export async function runQuarterlyDataAudit(maxDaysThreshold = 90): Promise<AuditReport> {
  const [certs, exams, sources, fieldSources] = await Promise.all([
    prisma.certification.findMany({ select: { id: true, name: true, statusLastVerifiedDate: true } }),
    prisma.exam.findMany({ select: { id: true, name: true, costLastVerifiedDate: true } }),
    prisma.source.findMany({ select: { id: true, title: true, url: true, accessedDate: true } }),
    prisma.fieldSource.findMany(),
  ]);

  const now = new Date();
  const staleRecords: Array<{ id: string; type: string; name: string; daysSinceVerification: number }> = [];

  // Check certification freshness
  for (const cert of certs) {
    const verifiedDate = cert.statusLastVerifiedDate ? new Date(cert.statusLastVerifiedDate) : new Date(0);
    const diffDays = Math.floor((now.getTime() - verifiedDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays > maxDaysThreshold) {
      staleRecords.push({
        id: cert.id,
        type: 'CERTIFICATION',
        name: cert.name,
        daysSinceVerification: diffDays,
      });
    }
  }

  // Check exam freshness
  for (const exam of exams) {
    const verifiedDate = exam.costLastVerifiedDate ? new Date(exam.costLastVerifiedDate) : new Date(0);
    const diffDays = Math.floor((now.getTime() - verifiedDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays > maxDaysThreshold) {
      staleRecords.push({
        id: exam.id,
        type: 'EXAM',
        name: exam.name,
        daysSinceVerification: diffDays,
      });
    }
  }

  // Validate URL protocol validity
  let unverifiedSourcesCount = 0;
  for (const source of sources) {
    if (!source.url || (!source.url.startsWith('https://') && !source.url.startsWith('http://'))) {
      unverifiedSourcesCount++;
    }
  }

  const expectedFieldsPerCert = 4; // name, level, renewalPeriodMonths, officialUrl
  const expectedCitations = certs.length * expectedFieldsPerCert;
  const actualCertCitations = fieldSources.filter((fs) => fs.entityType === 'CERTIFICATION').length;
  const coveragePercentage = Math.min(100, Math.round((actualCertCitations / Math.max(1, expectedCitations)) * 100));

  return {
    timestamp: new Date().toISOString(),
    totalCertifications: certs.length,
    totalExams: exams.length,
    totalSources: sources.length,
    totalFieldSources: fieldSources.length,
    unverifiedSourcesCount,
    coveragePercentage,
    staleRecords,
    missingCitations: [],
  };
}

if (require.main === module) {
  runQuarterlyDataAudit()
    .then((report) => {
      console.log('📊 Quarterly Data Verification Audit Complete:');
      console.log(`- Certifications: ${report.totalCertifications}`);
      console.log(`- Exams: ${report.totalExams}`);
      console.log(`- Primary Sources: ${report.totalSources}`);
      console.log(`- Field Source Citations: ${report.totalFieldSources}`);
      console.log(`- Citation Coverage: ${report.coveragePercentage}%`);
      console.log(`- Stale Records (>90d): ${report.staleRecords.length}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Audit failed:', err);
      process.exit(1);
    });
}

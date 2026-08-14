import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateCertificationCost } from '@/lib/derived-cost';
import { getCadExchangeRate } from '@/lib/currency';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certId = id.startsWith('cert:') ? id : `cert:${id}`;

    const cert = await prisma.certification.findUnique({
      where: { id: certId },
      include: {
        vendor: true,
        domains: { include: { domain: true } },
        roles: { include: { role: true } },
        prerequisiteGroups: {
          include: {
            members: {
              include: {
                exam: true,
                certification: true,
              },
            },
            childGroups: {
              include: {
                members: {
                  include: {
                    exam: true,
                    certification: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cert) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    const cadRate = await getCadExchangeRate();
    const cost = calculateCertificationCost(cert.prerequisiteGroups, cadRate);

    // Fetch citations
    const certCitations = await prisma.fieldSource.findMany({
      where: {
        entityType: 'CERTIFICATION',
        entityId: cert.id,
      },
      include: { source: true },
    });

    return NextResponse.json({
      certification: {
        id: cert.id,
        name: cert.name,
        acronym: cert.acronym,
        level: cert.level,
        vendorLevelLabel: cert.vendorLevelLabel,
        status: cert.status,
        renewalPeriodMonths: cert.renewalPeriodMonths,
        renewalRequirementsText: cert.renewalRequirementsText,
        description: cert.description,
        officialUrl: cert.officialUrl,
        computedScore: cert.computedScore,
        scoreBreakdown: cert.scoreBreakdown,
        vendor: cert.vendor,
        domains: cert.domains.map((d) => d.domain),
        roles: cert.roles.map((r) => r.role),
        prerequisiteGroups: cert.prerequisiteGroups,
        cost: {
          minUsd: cost.minCostUsd,
          maxUsd: cost.maxCostUsd,
          minCad: cost.minCostCad,
          maxCad: cost.maxCostCad,
          isRange: cost.isRange,
          displayUsd: cost.isRange
            ? `$${cost.minCostUsd} – $${cost.maxCostUsd} USD`
            : `$${cost.minCostUsd} USD`,
          displayCad: cost.isRange
            ? `$${cost.minCostCad} – $${cost.maxCostCad} CAD`
            : `$${cost.minCostCad} CAD`,
          breakdownNotes: cost.breakdownNotes,
        },
        citations: certCitations.map((c) => ({
          fieldName: c.fieldName,
          sourceTitle: c.source.title,
          sourceUrl: c.source.url,
          publisher: c.source.publisher,
        })),
      },
      cadExchangeRate: cadRate,
    });
  } catch (error: any) {
    console.error('Error fetching certification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certification', details: error.message },
      { status: 500 }
    );
  }
}

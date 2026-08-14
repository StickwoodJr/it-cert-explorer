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
    const vendorId = id.startsWith('vendor:') ? id : `vendor:${id}`;

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        certifications: {
          include: {
            domains: {
              include: { domain: true },
            },
            roles: {
              include: { role: true },
            },
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
        },
        exams: true,
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    const cadRate = await getCadExchangeRate();

    // Map certifications with computed costs and source citations
    const certificationsWithCosts = await Promise.all(
      vendor.certifications.map(async (cert) => {
        const cost = calculateCertificationCost(cert.prerequisiteGroups, cadRate);

        // Fetch citations for this cert
        const citations = await prisma.fieldSource.findMany({
          where: {
            entityType: 'CERTIFICATION',
            entityId: cert.id,
          },
          include: {
            source: true,
          },
        });

        return {
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
          domains: cert.domains.map((d) => ({
            id: d.domain.id,
            name: d.domain.name,
          })),
          roles: cert.roles.map((r) => ({
            id: r.role.id,
            name: r.role.name,
          })),
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
          citations: citations.map((c) => ({
            fieldName: c.fieldName,
            sourceTitle: c.source.title,
            sourceUrl: c.source.url,
            publisher: c.source.publisher,
          })),
        };
      })
    );

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        shortName: vendor.shortName,
        websiteUrl: vendor.websiteUrl,
        logoAssetRef: vendor.logoAssetRef,
        description: vendor.description,
        foundedYear: vendor.foundedYear,
        totalCertifications: vendor.certifications.length,
        totalExams: vendor.exams.length,
      },
      certifications: certificationsWithCosts,
      exams: vendor.exams,
      cadExchangeRate: cadRate,
    });
  } catch (error: any) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor', details: error.message },
      { status: 500 }
    );
  }
}

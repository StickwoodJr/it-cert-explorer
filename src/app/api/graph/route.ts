import { NextRequest, NextResponse } from 'next/server';
import { buildGraphExport, GraphFilterOptions } from '@/lib/graph-builder';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: GraphFilterOptions = {
      domainId: searchParams.get('domain') || undefined,
      vendorId: searchParams.get('vendor') || undefined,
      level: searchParams.get('level') || undefined,
      roleId: searchParams.get('role') || undefined,
      maxCostUsd: searchParams.get('maxCost') ? parseFloat(searchParams.get('maxCost')!) : undefined,
      minScore: searchParams.get('minScore') ? parseFloat(searchParams.get('minScore')!) : undefined,
      includeRetired: searchParams.get('includeRetired') === 'true',
    };

    const graphData = await buildGraphExport(filters);
    return NextResponse.json(graphData);
  } catch (error: any) {
    console.error('Failed to generate graph export:', error);
    return NextResponse.json(
      { error: 'Failed to build graph export', details: error.message },
      { status: 500 }
    );
  }
}

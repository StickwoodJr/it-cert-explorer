import { describe, it, expect } from 'vitest';
import { buildGraphExport } from '../src/lib/graph-builder';

describe('Graph Builder & Pathway Modeling Suite', () => {
  it('builds unified cross-vendor graph with 54 flagship nodes and verified edges', async () => {
    const graph = await buildGraphExport();

    expect(graph.nodes.length).toBe(54);
    expect(graph.edges.length).toBeGreaterThanOrEqual(25);
    expect(graph.metadata.totalNodes).toBe(54);
    expect(graph.metadata.cadExchangeRate).toBeGreaterThan(1.0);

    // Confirm every node has valid structure
    for (const node of graph.nodes) {
      expect(node.id).toMatch(/^cert:/);
      expect(node.label).toBeTruthy();
      expect(node.fullName).toBeTruthy();
      expect(node.domains.length).toBeGreaterThan(0);
      expect(Array.isArray(node.roles)).toBe(true);
      expect(node.score).toBeGreaterThan(0);
      expect(node.computedCostUsd).toBeGreaterThanOrEqual(0);
    }
  });

  it('filters graph by vendor (Cisco pathway portal)', async () => {
    const ciscoGraph = await buildGraphExport({ vendorId: 'vendor:cisco' });

    expect(ciscoGraph.nodes.length).toBe(5); // CCST Net, CCST Cyber, CCNA, CCNP Ent, CCIE Ent
    expect(ciscoGraph.nodes.every((n) => n.vendorId === 'vendor:cisco')).toBe(true);

    // Verify Cisco internal edges (CCNA -> CCNP, CCNP -> CCIE)
    const ciscoEdgeSources = ciscoGraph.edges.map((e) => e.source);
    expect(ciscoEdgeSources).toContain('cert:cisco-ccna');
    expect(ciscoEdgeSources).toContain('cert:cisco-ccnp-enterprise');
  });

  it('filters graph by domain (Cybersecurity domain portal)', async () => {
    const cyberGraph = await buildGraphExport({ domainId: 'domain:cybersecurity' });

    expect(cyberGraph.nodes.length).toBe(20);
    expect(cyberGraph.nodes.every((n) => n.domains.includes('domain:cybersecurity'))).toBe(true);

    const certIds = cyberGraph.nodes.map((n) => n.id);
    expect(certIds).toContain('cert:isc2-cissp');
    expect(certIds).toContain('cert:offsec-oscp');
    expect(certIds).toContain('cert:comptia-security-plus');
  });

  it('filters graph by cost ceiling and minimum reputation score', async () => {
    const filteredGraph = await buildGraphExport({
      maxCostUsd: 400,
      minScore: 80,
    });

    expect(filteredGraph.nodes.length).toBeGreaterThan(0);
    for (const node of filteredGraph.nodes) {
      expect(node.computedCostUsd).toBeLessThanOrEqual(400);
      expect(node.score).toBeGreaterThanOrEqual(80);
    }
  });
});

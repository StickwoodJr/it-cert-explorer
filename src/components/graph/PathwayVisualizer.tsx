'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as d3 from 'd3';
import dagre from 'dagre';
import {
  GitFork,
  Compass,
  Radio,
  Clock,
  Grid,
  DollarSign,
  Maximize2,
  ExternalLink,
  Shield,
  Award,
  Layers,
  FileCheck,
  CheckCircle2,
  Info,
  BookOpen,
  Calendar,
  Zap,
  Filter,
  RotateCcw,
  Search,
  Briefcase,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CustomCertNode } from './CustomCertNode';
import { GraphNode, GraphEdge, GraphExport } from '@/lib/graph-builder';

export type ViewMode = 'DAG' | 'FORCE' | 'RADIAL' | 'TIMELINE' | 'MATRIX';

interface PathwayVisualizerProps {
  initialGraph: GraphExport;
  vendorFilter?: string;
  domainFilter?: string;
  className?: string;
}

const nodeTypes: any = {
  certNode: CustomCertNode,
};

const levelColors: Record<string, string> = {
  ENTRY: '#10b981',
  ASSOCIATE: '#0ea5e9',
  PROFESSIONAL: '#f59e0b',
  EXPERT: '#f43f5e',
  SPECIALTY: '#6366f1',
};

const allDomains = [
  { id: 'domain:networking', name: 'Networking' },
  { id: 'domain:linux', name: 'Linux' },
  { id: 'domain:cybersecurity', name: 'Cybersecurity' },
  { id: 'domain:azure', name: 'Microsoft / Azure' },
  { id: 'domain:cloud', name: 'Cloud' },
  { id: 'domain:ai-ml', name: 'AI & Machine Learning' },
];

const allRoles = [
  { id: 'role:network-engineer', name: 'Network Engineer' },
  { id: 'role:cloud-architect', name: 'Cloud Architect' },
  { id: 'role:soc-analyst', name: 'SOC Analyst / IR' },
  { id: 'role:pentester', name: 'Penetration Tester' },
  { id: 'role:sysadmin', name: 'Linux / SysAdmin' },
  { id: 'role:security-architect', name: 'Security Architect' },
  { id: 'role:ml-engineer', name: 'AI / ML Engineer' },
];

const allLevels = ['ENTRY', 'ASSOCIATE', 'PROFESSIONAL', 'EXPERT', 'SPECIALTY'];

interface TimelineBracket {
  id: string;
  title: string;
  timeframe: string;
  estimatedHours: string;
  color: string;
}

const timelineBrackets: TimelineBracket[] = [
  { id: 'FAST_TRACK', title: 'Fast-Track / Foundational', timeframe: '0 – 3 Months', estimatedHours: '40 – 80 Hours', color: '#10b981' },
  { id: 'ASSOCIATE_TIER', title: 'Associate Core', timeframe: '3 – 6 Months', estimatedHours: '120 – 250 Hours', color: '#0ea5e9' },
  { id: 'PROFESSIONAL_TIER', title: 'Professional Practitioner', timeframe: '6 – 12 Months', estimatedHours: '300 – 600 Hours', color: '#f59e0b' },
  { id: 'EXPERT_PINNACLE', title: 'Expert / Pinnacle Lab', timeframe: '12 – 24+ Months', estimatedHours: '800 – 1500+ Hours', color: '#f43f5e' },
];

function getTimelineBracketForNode(node: GraphNode): string {
  if (node.level === 'ENTRY') return 'FAST_TRACK';
  if (node.level === 'ASSOCIATE') return 'ASSOCIATE_TIER';
  if (node.level === 'PROFESSIONAL' || node.level === 'SPECIALTY') return 'PROFESSIONAL_TIER';
  return 'EXPERT_PINNACLE';
}

export default function PathwayVisualizer({
  initialGraph,
  vendorFilter,
  domainFilter,
  className = '',
}: PathwayVisualizerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('DAG');
  const [currency, setCurrency] = useState<'USD' | 'CAD'>('USD');
  const [direction, setDirection] = useState<'BT' | 'LR'>('BT');
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterSidebar, setShowFilterSidebar] = useState<boolean>(!vendorFilter);

  // Multi-facet filter states (VISUALIZATION_SPEC §5)
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    domainFilter ? [domainFilter.startsWith('domain:') ? domainFilter : `domain:${domainFilter}`] : []
  );
  const [selectedVendors, setSelectedVendors] = useState<string[]>(
    vendorFilter ? [vendorFilter.startsWith('vendor:') ? vendorFilter : `vendor:${vendorFilter}`] : []
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [costCeilingUsd, setCostCeilingUsd] = useState<number>(3000);
  const [minScoreThreshold, setMinScoreThreshold] = useState<number>(0);
  const [includeRetired, setIncludeRetired] = useState<boolean>(false);

  // Available vendors extracted from graph
  const availableVendors = useMemo(() => {
    const vMap = new Map<string, { id: string; name: string }>();
    initialGraph.nodes.forEach((n) => {
      if (!vMap.has(n.vendorId)) {
        vMap.set(n.vendorId, { id: n.vendorId, name: n.vendorName });
      }
    });
    return Array.from(vMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [initialGraph.nodes]);

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedDomains.length > 0 && !domainFilter) count += selectedDomains.length;
    if (selectedVendors.length > 0 && !vendorFilter) count += selectedVendors.length;
    if (selectedLevels.length > 0) count += selectedLevels.length;
    if (selectedRole !== 'ALL') count += 1;
    if (costCeilingUsd < 3000) count += 1;
    if (minScoreThreshold > 0) count += 1;
    if (searchQuery.trim()) count += 1;
    return count;
  }, [selectedDomains, selectedVendors, selectedLevels, selectedRole, costCeilingUsd, minScoreThreshold, searchQuery, domainFilter, vendorFilter]);

  const handleResetFilters = () => {
    setSelectedDomains(domainFilter ? [domainFilter] : []);
    setSelectedVendors(vendorFilter ? [vendorFilter] : []);
    setSelectedLevels([]);
    setSelectedRole('ALL');
    setCostCeilingUsd(3000);
    setMinScoreThreshold(0);
    setSearchQuery('');
  };

  // Filter nodes based on combinable multi-facet criteria
  const filteredGraph = useMemo(() => {
    let nodes = initialGraph.nodes;

    // 1. Domain Filter
    if (selectedDomains.length > 0) {
      nodes = nodes.filter((n) => n.domains.some((d) => selectedDomains.includes(d)));
    }

    // 2. Vendor Filter
    if (selectedVendors.length > 0) {
      nodes = nodes.filter((n) => selectedVendors.includes(n.vendorId));
    }

    // 3. Level Filter
    if (selectedLevels.length > 0) {
      nodes = nodes.filter((n) => selectedLevels.includes(n.level));
    }

    // 4. Role Filter preset
    if (selectedRole !== 'ALL') {
      // Role matching based on role preset
      nodes = nodes.filter((n) => {
        if (selectedRole === 'role:network-engineer') return n.domains.includes('domain:networking');
        if (selectedRole === 'role:cloud-architect') return n.domains.includes('domain:cloud') || n.domains.includes('domain:azure');
        if (selectedRole === 'role:soc-analyst') return n.domains.includes('domain:cybersecurity') && (n.level === 'ENTRY' || n.level === 'ASSOCIATE');
        if (selectedRole === 'role:pentester') return n.id.includes('oscp') || n.id.includes('pentest') || n.id.includes('ceh');
        if (selectedRole === 'role:sysadmin') return n.domains.includes('domain:linux') || n.id.includes('hybrid') || n.id.includes('network');
        if (selectedRole === 'role:security-architect') return n.domains.includes('domain:cybersecurity') && (n.level === 'PROFESSIONAL' || n.level === 'EXPERT');
        if (selectedRole === 'role:ml-engineer') return n.domains.includes('domain:ai-ml');
        return true;
      });
    }

    // 5. Cost Ceiling
    nodes = nodes.filter((n) => n.computedCostUsd <= costCeilingUsd);

    // 6. Minimum Score Threshold
    if (minScoreThreshold > 0) {
      nodes = nodes.filter((n) => n.score >= minScoreThreshold);
    }

    // 7. Status Filter
    if (!includeRetired) {
      nodes = nodes.filter((n) => n.status !== 'RETIRED');
    }

    // 8. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.label.toLowerCase().includes(q) ||
          n.fullName.toLowerCase().includes(q) ||
          n.vendorName.toLowerCase().includes(q) ||
          (n.examSummary && n.examSummary.toLowerCase().includes(q))
      );
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = initialGraph.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return { nodes, edges };
  }, [
    initialGraph,
    selectedDomains,
    selectedVendors,
    selectedLevels,
    selectedRole,
    costCeilingUsd,
    minScoreThreshold,
    includeRetired,
    searchQuery,
  ]);

  // Selected Node Details
  const selectedNode = useMemo(() => {
    if (!selectedCertId) return null;
    return initialGraph.nodes.find((n) => n.id === selectedCertId) || null;
  }, [selectedCertId, initialGraph.nodes]);

  // Dagre Layout computation for React Flow DAG
  const layoutedElements = useMemo(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: 80,
      ranksep: 120,
      align: 'UL',
    });

    filteredGraph.nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 290, height: 130 });
    });

    filteredGraph.edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const rfNodes: Node[] = filteredGraph.nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        id: node.id,
        type: 'certNode',
        draggable: false,
        position: {
          x: nodeWithPosition ? nodeWithPosition.x - 145 : 0,
          y: nodeWithPosition ? nodeWithPosition.y - 65 : 0,
        },
        data: {
          ...node,
          currency,
          selected: node.id === selectedCertId,
        },
      };
    });

    const rfEdges: Edge[] = filteredGraph.edges.map((edge) => {
      let strokeColor = '#0284c7'; // required
      let strokeDasharray = undefined;
      let strokeWidth = 2.5;
      let labelTextColor = '#38bdf8';
      let labelBorderColor = '#0369a1';

      if (edge.type === 'recommended') {
        strokeColor = '#10b981';
        strokeDasharray = '6 4';
        strokeWidth = 2;
        labelTextColor = '#34d399';
        labelBorderColor = '#059669';
      } else if (edge.type === 'alternative') {
        strokeColor = '#f59e0b';
        strokeDasharray = '3 3';
        strokeWidth = 2;
        labelTextColor = '#fbbf24';
        labelBorderColor = '#d97706';
      }

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: direction === 'BT' ? 'top' : 'right',
        targetHandle: direction === 'BT' ? 'bottom' : 'left',
        type: 'smoothstep',
        animated: edge.type === 'required',
        label: edge.label,
        labelStyle: {
          fill: labelTextColor,
          fontSize: 10,
          fontWeight: 700,
          fontFamily: 'monospace',
        },
        labelBgStyle: {
          fill: '#090d16',
          fillOpacity: 0.96,
          stroke: labelBorderColor,
          strokeWidth: 1.5,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [8, 5] as [number, number],
        labelBgBorderRadius: 6,
        style: {
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 16,
          height: 16,
        },
      };
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [filteredGraph, direction, currency, selectedCertId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedElements.edges);

  useEffect(() => {
    setNodes(layoutedElements.nodes);
    setEdges(layoutedElements.edges);
  }, [layoutedElements, setNodes, setEdges]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedCertId(node.id);
  }, []);

  // Force-Directed Graph D3 Renderer
  const forceSvgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (viewMode !== 'FORCE' || !forceSvgRef.current) return;

    const svg = d3.select(forceSvgRef.current);
    svg.selectAll('*').remove();

    const width = forceSvgRef.current.clientWidth || 900;
    const height = forceSvgRef.current.clientHeight || 600;

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    const nodesData = filteredGraph.nodes.map((d) => ({ ...d }));
    const edgesData = filteredGraph.edges.map((d) => ({ ...d }));

    const defs = svg.append('defs');
    ['required', 'recommended', 'alternative'].forEach((type) => {
      const color = type === 'required' ? '#0ea5e9' : type === 'recommended' ? '#10b981' : '#f59e0b';
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 28)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    const simulation = d3.forceSimulation(nodesData as any)
      .force('link', d3.forceLink(edgesData).id((d: any) => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(45));

    const link = g.append('g')
      .selectAll('line')
      .data(edgesData)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => (d.type === 'required' ? '#0ea5e9' : d.type === 'recommended' ? '#10b981' : '#f59e0b'))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d: any) => (d.type === 'recommended' ? '5,5' : d.type === 'alternative' ? '2,2' : 'none'))
      .attr('marker-end', (d: any) => `url(#arrow-${d.type})`);

    const node = g.append('g')
      .selectAll('g')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (_, d: any) => setSelectedCertId(d.id));

    // Outer domain color halo ring
    node.append('circle')
      .attr('r', 30)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => {
        const dom = d.domains?.[0];
        if (dom === 'domain:networking') return '#0284c7';
        if (dom === 'domain:linux') return '#f59e0b';
        if (dom === 'domain:cybersecurity') return '#f43f5e';
        if (dom === 'domain:azure') return '#06b6d4';
        if (dom === 'domain:cloud') return '#818cf8';
        if (dom === 'domain:ai-ml') return '#10b981';
        return '#0284c7';
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0.85);

    // Inner tier circle
    node.append('circle')
      .attr('r', 23)
      .attr('fill', '#0f172a')
      .attr('stroke', (d: any) => levelColors[d.level] || '#0ea5e9')
      .attr('stroke-width', (d: any) => (d.id === selectedCertId ? 4 : 2));

    node.append('text')
      .text((d: any) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 38)
      .attr('fill', '#f1f5f9')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'system-ui');

    node.append('text')
      .text((d: any) => `${d.score.toFixed(0)}`)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', (d: any) => levelColors[d.level] || '#0ea5e9')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [viewMode, filteredGraph, selectedCertId]);

  // Radial / Concentric Orbit D3 Renderer
  const radialSvgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (viewMode !== 'RADIAL' || !radialSvgRef.current) return;

    const svg = d3.select(radialSvgRef.current);
    svg.selectAll('*').remove();

    const width = radialSvgRef.current.clientWidth || 900;
    const height = radialSvgRef.current.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    const orbits = [
      { level: 'ENTRY', r: 90, label: 'Entry / Foundational', color: '#10b981' },
      { level: 'ASSOCIATE', r: 190, label: 'Associate Tier', color: '#0ea5e9' },
      { level: 'PROFESSIONAL', r: 300, label: 'Professional Tier', color: '#f59e0b' },
      { level: 'EXPERT', r: 410, label: 'Expert / Pinnacle', color: '#f43f5e' },
    ];

    orbits.forEach((orbit) => {
      g.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', orbit.r)
        .attr('fill', 'none')
        .attr('stroke', orbit.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 6')
        .attr('opacity', 0.35);

      g.append('text')
        .attr('x', centerX)
        .attr('y', centerY - orbit.r - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', orbit.color)
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('opacity', 0.8)
        .text(orbit.label.toUpperCase());
    });

    const nodesByLevel: Record<string, typeof filteredGraph.nodes> = {
      ENTRY: [],
      ASSOCIATE: [],
      PROFESSIONAL: [],
      EXPERT: [],
      SPECIALTY: [],
    };

    filteredGraph.nodes.forEach((n) => {
      const lvl = n.level === 'SPECIALTY' ? 'PROFESSIONAL' : n.level;
      if (nodesByLevel[lvl]) nodesByLevel[lvl].push(n);
    });

    const nodePositions: Record<string, { x: number; y: number; node: any }> = {};

    orbits.forEach((orbit) => {
      const levelNodes = nodesByLevel[orbit.level] || [];
      const total = levelNodes.length;
      levelNodes.forEach((node, i) => {
        const angle = (i / (total || 1)) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + orbit.r * Math.cos(angle);
        const y = centerY + orbit.r * Math.sin(angle);
        nodePositions[node.id] = { x, y, node };
      });
    });

    filteredGraph.edges.forEach((edge) => {
      const src = nodePositions[edge.source];
      const tgt = nodePositions[edge.target];
      if (src && tgt) {
        const color = edge.type === 'required' ? '#0ea5e9' : edge.type === 'recommended' ? '#10b981' : '#f59e0b';
        const path = d3.path();
        path.moveTo(src.x, src.y);
        path.quadraticCurveTo(centerX, centerY, tgt.x, tgt.y);

        g.append('path')
          .attr('d', path.toString())
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', edge.type === 'recommended' ? '4 4' : 'none')
          .attr('opacity', 0.6);
      }
    });

    Object.values(nodePositions).forEach(({ x, y, node }) => {
      const nodeG = g.append('g')
        .attr('transform', `translate(${x},${y})`)
        .attr('cursor', 'pointer')
        .on('click', () => setSelectedCertId(node.id));

      nodeG.append('circle')
        .attr('r', 18)
        .attr('fill', '#0f172a')
        .attr('stroke', levelColors[node.level] || '#0ea5e9')
        .attr('stroke-width', node.id === selectedCertId ? 3 : 1.5);

      nodeG.append('text')
        .text(node.label)
        .attr('text-anchor', 'middle')
        .attr('dy', 28)
        .attr('fill', '#f1f5f9')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold');

      nodeG.append('text')
        .text(`${node.score.toFixed(0)}`)
        .attr('text-anchor', 'middle')
        .attr('dy', 3.5)
        .attr('fill', levelColors[node.level] || '#0ea5e9')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'monospace');
    });
  }, [viewMode, filteredGraph, selectedCertId]);

  return (
    <div className={`relative flex flex-col w-full h-full bg-[#090d16] text-slate-100 rounded-xl border border-slate-800 overflow-hidden ${className}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border-b border-slate-800 z-10">
        {/* 5 View Mode Toggles */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap gap-1">
          <button
            onClick={() => setViewMode('DAG')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              viewMode === 'DAG' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            Ladder (DAG)
          </button>
          <button
            onClick={() => setViewMode('TIMELINE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              viewMode === 'TIMELINE' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline / Duration
          </button>
          <button
            onClick={() => setViewMode('FORCE')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              viewMode === 'FORCE' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Force Network
          </button>
          <button
            onClick={() => setViewMode('RADIAL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              viewMode === 'RADIAL' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Radial Orbits
          </button>
          <button
            onClick={() => setViewMode('MATRIX')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              viewMode === 'MATRIX' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Matrix Swimlanes
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2">
          {/* Toggle Multi-Facet Filter Sidebar */}
          <button
            onClick={() => setShowFilterSidebar((s) => !s)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition ${
              showFilterSidebar || activeFilterCount > 0
                ? 'bg-sky-950 text-sky-400 border-sky-600'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {activeFilterCount > 0 && <span className="bg-sky-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">{activeFilterCount}</span>}
          </button>

          {viewMode === 'DAG' && (
            <button
              onClick={() => setDirection((d) => (d === 'BT' ? 'LR' : 'BT'))}
              className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300 transition"
              title="Toggle ladder orientation (Vertical Ladder ↑ / Horizontal Flow →)"
            >
              {direction === 'BT' ? 'Vertical Ladder ↑' : 'Horizontal Flow →'}
            </button>
          )}

          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-0.5 rounded transition ${
                currency === 'USD' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('CAD')}
              className={`px-2 py-0.5 rounded transition ${
                currency === 'CAD' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CAD
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search certs, exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-8 pr-3 py-1 rounded w-44 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Role Preset Quick Bar (Wired 7 Roles) */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/90 border-b border-slate-800/80 overflow-x-auto text-xs">
        <span className="font-semibold text-slate-400 flex items-center gap-1 shrink-0 text-[11px]">
          <Briefcase className="w-3.5 h-3.5 text-sky-400" /> Role Presets:
        </span>
        <button
          onClick={() => setSelectedRole('ALL')}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition shrink-0 ${
            selectedRole === 'ALL'
              ? 'bg-sky-500 text-white font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Roles
        </button>
        {allRoles.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRole(r.id)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition shrink-0 ${
              selectedRole === r.id
                ? 'bg-sky-500 text-white font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Domain, Tier & Edge Visual Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">Domains:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0284c7]"></span> Networking</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Linux</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span> Cybersecurity</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#06b6d4]"></span> Azure / MS</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#818cf8]"></span> Cloud</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> AI / ML</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-slate-300">Tiers:</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400"></span> Entry</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sky-400"></span> Associate</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400"></span> Professional</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-400"></span> Expert</span>
          </div>
          <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
            <span className="font-semibold text-slate-300">Edge Types:</span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-sky-400">
              <span className="w-3.5 h-[3px] bg-sky-500 rounded-full inline-block"></span> Required
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
              <span className="w-3.5 h-0 border-t-2 border-dashed border-emerald-400 inline-block"></span> Recommended
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400">
              <span className="w-3.5 h-0 border-t-2 border-dotted border-amber-400 inline-block"></span> Alternative
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Filter Sidebar + Canvas Area */}
      <div className="relative flex-1 flex w-full min-h-[550px] overflow-hidden">
        {/* Multi-Facet Filter Sidebar (VISUALIZATION_SPEC §5) */}
        {showFilterSidebar && (
          <div className="w-72 bg-slate-950/95 border-r border-slate-800 p-4 overflow-y-auto space-y-5 text-xs z-20 shrink-0 backdrop-blur-md animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-sky-400" />
                Filter Pathways
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Domains Multi-Select */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Domains
              </span>
              <div className="space-y-1">
                {allDomains.map((d) => {
                  const isChecked = selectedDomains.includes(d.id);
                  return (
                    <label key={d.id} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedDomains((prev) =>
                            isChecked ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                          );
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                      />
                      <span>{d.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Vendor Multi-Select */}
            {!vendorFilter && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Vendors
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {availableVendors.map((v) => {
                    const isChecked = selectedVendors.includes(v.id);
                    return (
                      <label key={v.id} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedVendors((prev) =>
                              isChecked ? prev.filter((id) => id !== v.id) : [...prev, v.id]
                            );
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                        />
                        <span className="truncate">{v.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Level Multi-Select */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Tier / Level
              </span>
              <div className="space-y-1">
                {allLevels.map((lvl) => {
                  const isChecked = selectedLevels.includes(lvl);
                  return (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedLevels((prev) =>
                            isChecked ? prev.filter((l) => l !== lvl) : [...prev, lvl]
                          );
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                      />
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: levelColors[lvl] }} />
                        {lvl}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Cost Ceiling Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-mono font-bold text-slate-400 uppercase">Cost Ceiling</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${costCeilingUsd} USD
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={costCeilingUsd}
                onChange={(e) => setCostCeilingUsd(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Score Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-mono font-bold text-slate-400 uppercase">Min Score</span>
                <span className="font-mono font-bold text-amber-400">
                  {minScoreThreshold} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minScoreThreshold}
                onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Include Retired Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between cursor-pointer text-slate-300">
                <span className="text-[11px]">Show Retired / Phased Out</span>
                <input
                  type="checkbox"
                  checked={includeRetired}
                  onChange={(e) => setIncludeRetired(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* 1. React Flow DAG */}
          {viewMode === 'DAG' && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              panOnDrag={true}
              zoomOnScroll={true}
              fitView
              minZoom={0.2}
              maxZoom={2}
            >
              <Background color="#1e293b" gap={20} size={1} />
              <Controls className="react-flow__controls" />
              <MiniMap
                nodeColor={(n: any) => levelColors[n.data?.level] || '#0ea5e9'}
                maskColor="rgba(9, 13, 22, 0.85)"
                className="!bg-slate-900 !border-slate-800 !rounded-lg"
              />
            </ReactFlow>
          )}

          {/* 2. Timeline / Duration View */}
          {viewMode === 'TIMELINE' && (
            <div className="w-full h-full p-6 overflow-y-auto bg-[#090d16] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    Estimated Study Time & Roadmap Duration ({filteredGraph.nodes.length} Certifications)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Certifications positioned along the timeline axis by estimated preparation time and cumulative commitment from beginner to expert.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {timelineBrackets.map((bracket, index) => {
                  const certsInBracket = filteredGraph.nodes.filter(
                    (n) => getTimelineBracketForNode(n) === bracket.id
                  );

                  return (
                    <div
                      key={bracket.id}
                      className="flex flex-col rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden"
                    >
                      <div
                        className="p-3 border-b border-slate-800 flex flex-col gap-1"
                        style={{ borderTop: `3px solid ${bracket.color}` }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                            Phase {index + 1}
                          </span>
                          <span
                            className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950"
                            style={{ color: bracket.color }}
                          >
                            {bracket.timeframe}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">{bracket.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          Est. {bracket.estimatedHours}
                        </span>
                      </div>

                      <div className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[480px]">
                        {certsInBracket.length === 0 ? (
                          <p className="text-xs text-slate-500 italic p-2 text-center">No certifications match active filters.</p>
                        ) : (
                          certsInBracket.map((cert) => {
                            const costDisplay = currency === 'CAD' ? cert.costDisplayCad : cert.costDisplayUsd;
                            const isSelected = cert.id === selectedCertId;

                            return (
                              <div
                                key={cert.id}
                                onClick={() => setSelectedCertId(cert.id)}
                                className={`p-3 rounded-lg border bg-slate-950/90 cursor-pointer transition-all hover:scale-[1.02] ${
                                  isSelected
                                    ? 'border-sky-400 ring-1 ring-sky-400 shadow-lg'
                                    : 'border-slate-800/80 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                    {cert.vendorName}
                                  </span>
                                  <span className="text-[11px] font-mono font-bold text-amber-400">
                                    ★ {cert.score.toFixed(1)}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-100 leading-snug">{cert.label}</h5>
                                <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{cert.fullName}</p>
                                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800 text-slate-400">
                                  <span className="font-mono">{cert.examSummary}</span>
                                  <span className="font-mono font-bold text-emerald-400">{costDisplay}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. D3 Force Network */}
          {viewMode === 'FORCE' && (
            <svg ref={forceSvgRef} className="w-full h-full bg-[#090d16]" />
          )}

          {/* 4. D3 Radial Orbit */}
          {viewMode === 'RADIAL' && (
            <svg ref={radialSvgRef} className="w-full h-full bg-[#090d16]" />
          )}

          {/* 5. Matrix Swimlanes View */}
          {viewMode === 'MATRIX' && (
            <div className="w-full h-full p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#090d16]">
              {['ENTRY', 'ASSOCIATE', 'PROFESSIONAL', 'EXPERT'].map((lvl) => {
                const certsInLevel = filteredGraph.nodes.filter(
                  (n) => n.level === lvl || (lvl === 'PROFESSIONAL' && n.level === 'SPECIALTY')
                );
                return (
                  <div key={lvl} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h3
                        className="text-xs font-mono font-bold tracking-wider uppercase"
                        style={{ color: levelColors[lvl] }}
                      >
                        {lvl} ({certsInLevel.length})
                      </h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {certsInLevel.map((cert) => {
                        const costDisplay = currency === 'CAD' ? cert.costDisplayCad : cert.costDisplayUsd;
                        const isSelected = cert.id === selectedCertId;
                        return (
                          <div
                            key={cert.id}
                            onClick={() => setSelectedCertId(cert.id)}
                            className={`p-3.5 rounded-lg border bg-slate-900/90 cursor-pointer transition-all hover:scale-[1.02] ${
                              isSelected
                                ? 'border-sky-400 ring-1 ring-sky-400 shadow-lg'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-semibold text-slate-400">{cert.vendorName}</span>
                              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded">
                                ★ {cert.score.toFixed(1)}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-100 mb-1">{cert.label}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1 mb-2">{cert.fullName}</p>
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                              <span className="font-mono text-[11px] text-slate-400">{cert.examSummary}</span>
                              <span className="font-mono font-bold text-emerald-400">{costDisplay}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Certification Deep-Dive Drawer */}
          {selectedNode && (
            <div className="absolute top-0 right-0 w-96 h-full bg-slate-900/98 border-l border-slate-800 shadow-2xl p-5 overflow-y-auto z-30 backdrop-blur-md animate-in slide-in-from-right duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1"
                    style={{
                      backgroundColor: `${levelColors[selectedNode.level]}20`,
                      color: levelColors[selectedNode.level],
                    }}
                  >
                    {selectedNode.level}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">{selectedNode.label}</h3>
                  <p className="text-xs text-slate-400">{selectedNode.fullName}</p>
                </div>
                <button
                  onClick={() => setSelectedCertId(null)}
                  className="text-slate-400 hover:text-slate-100 p-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Score Composite Breakdown Card */}
              <div className="mb-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Reputation Composite
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {selectedNode.score.toFixed(1)} / 100
                  </span>
                </div>
                {selectedNode.scoreBreakdown && (
                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Market Value (30%)</span>
                        <span className="font-mono">{selectedNode.scoreBreakdown.marketValue}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedNode.scoreBreakdown.marketValue}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Hiring Demand (30%)</span>
                        <span className="font-mono">{selectedNode.scoreBreakdown.demand}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full rounded-full" style={{ width: `${selectedNode.scoreBreakdown.demand}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Exam Rigor (20%)</span>
                        <span className="font-mono">{selectedNode.scoreBreakdown.rigor}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${selectedNode.scoreBreakdown.rigor}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Community Respect (20%)</span>
                        <span className="font-mono">{selectedNode.scoreBreakdown.community}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedNode.scoreBreakdown.community}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cost & Lifecycle */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">Derived Cost</span>
                  <p className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {currency === 'CAD' ? selectedNode.costDisplayCad : selectedNode.costDisplayUsd}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide">Renewal Cycle</span>
                  <p className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                    {selectedNode.renewalMonths === 0 ? 'Non-expiring' : `${selectedNode.renewalMonths} Months`}
                  </p>
                </div>
              </div>

              {/* Action Link to Full Dedicated Certification Page */}
              <div className="space-y-2">
                <Link
                  href={`/certifications/${selectedNode.id.replace('cert:', '')}`}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition shadow-md"
                >
                  View Full Prerequisite & Citation Breakdown
                  <BookOpen className="w-3.5 h-3.5" />
                </Link>

                {selectedNode.officialUrl && (
                  <a
                    href={selectedNode.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-semibold transition"
                  >
                    Official Vendor Blueprint
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

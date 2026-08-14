'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Award, Shield, CheckCircle2, DollarSign, Network, Server, Cloud, Cpu, Layers } from 'lucide-react';
import VendorBadgeIcon from '@/components/common/VendorBadgeIcon';

export interface CertNodeData {
  id: string;
  label: string;
  fullName: string;
  vendorId: string;
  vendorName: string;
  level: 'ENTRY' | 'ASSOCIATE' | 'PROFESSIONAL' | 'EXPERT' | 'SPECIALTY';
  status: string;
  score: number;
  scoreBreakdown?: {
    marketValue: number;
    demand: number;
    rigor: number;
    community: number;
  };
  computedCostUsd: number;
  computedCostCad: number;
  isCostRange: boolean;
  costDisplayUsd: string;
  costDisplayCad: string;
  currency: 'USD' | 'CAD';
  examSummary?: string;
  officialUrl?: string;
  domains: string[];
  selected?: boolean;
  isAncestor?: boolean;
  isDescendant?: boolean;
  isDimmed?: boolean;
}

const levelStyles: Record<string, { bg: string; text: string; border: string; glow: string; label: string }> = {
  ENTRY: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    glow: 'rgba(16, 185, 129, 0.15)',
    label: 'Entry',
  },
  ASSOCIATE: {
    bg: 'bg-sky-950/40',
    text: 'text-sky-400',
    border: 'border-sky-500/40 hover:border-sky-400',
    glow: 'rgba(14, 165, 233, 0.15)',
    label: 'Associate',
  },
  PROFESSIONAL: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-500/40 hover:border-amber-400',
    glow: 'rgba(245, 158, 11, 0.15)',
    label: 'Professional',
  },
  EXPERT: {
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-500/40 hover:border-rose-400',
    glow: 'rgba(244, 63, 94, 0.15)',
    label: 'Expert',
  },
  SPECIALTY: {
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-400',
    border: 'border-indigo-500/40 hover:border-indigo-400',
    glow: 'rgba(99, 102, 241, 0.15)',
    label: 'Specialty',
  },
};

const domainStyles: Record<string, { label: string; border: string; bg: string; text: string; dot: string }> = {
  'domain:networking': { label: 'Networking', border: '#0284c7', bg: 'bg-sky-950/80', text: 'text-sky-400', dot: 'bg-sky-400' },
  'domain:linux': { label: 'Linux', border: '#f59e0b', bg: 'bg-amber-950/80', text: 'text-amber-400', dot: 'bg-amber-400' },
  'domain:cybersecurity': { label: 'Cybersecurity', border: '#f43f5e', bg: 'bg-rose-950/80', text: 'text-rose-400', dot: 'bg-rose-400' },
  'domain:azure': { label: 'Azure / MS', border: '#06b6d4', bg: 'bg-cyan-950/80', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'domain:cloud': { label: 'Cloud', border: '#818cf8', bg: 'bg-indigo-950/80', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  'domain:ai-ml': { label: 'AI / ML', border: '#10b981', bg: 'bg-emerald-950/80', text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

export const CustomCertNode = memo((props: NodeProps) => {
  const nodeData = props.data as unknown as CertNodeData;
  const selected = props.selected || nodeData?.selected;
  const style = levelStyles[nodeData?.level] || levelStyles.ASSOCIATE;
  const primaryDomain = nodeData?.domains?.[0] || 'domain:networking';
  const domainInfo = domainStyles[primaryDomain] || domainStyles['domain:networking'];
  const costDisplay = nodeData?.currency === 'CAD' ? nodeData?.costDisplayCad : nodeData?.costDisplayUsd;
  const isPhasingOut = nodeData?.status === 'BEING_REPLACED';
  const isRetired = nodeData?.status === 'RETIRED';
  const isAncestor = nodeData?.isAncestor;
  const isDescendant = nodeData?.isDescendant;
  const isDimmed = nodeData?.isDimmed;

  return (
    <div
      className={`relative w-72 rounded-lg border border-l-4 bg-slate-900/98 p-3.5 shadow-xl transition-all duration-200 ${
        isDimmed
          ? 'opacity-25 grayscale-[40%] scale-[0.98]'
          : isRetired
          ? 'opacity-65 border-dashed border-slate-700'
          : isPhasingOut
          ? 'border-amber-500/60 border-dashed'
          : style.border
      } ${
        selected
          ? 'ring-2 ring-sky-400 shadow-sky-950/60 scale-[1.03] z-20'
          : isAncestor
          ? 'ring-2 ring-emerald-400/90 shadow-emerald-950/50 z-10 scale-[1.01]'
          : isDescendant
          ? 'ring-2 ring-purple-400/90 shadow-purple-950/50 z-10 scale-[1.01]'
          : ''
      }`}
      style={{
        borderLeftColor: isRetired ? '#64748b' : domainInfo.border,
        boxShadow: selected
          ? `0 0 24px ${style.glow}`
          : isAncestor
          ? '0 0 16px rgba(16, 185, 129, 0.25)'
          : isDescendant
          ? '0 0 16px rgba(168, 85, 247, 0.25)'
          : `0 4px 14px rgba(0, 0, 0, 0.45)`,
      }}
    >
      {/* Handles for vertical ladder (Bottom-to-Top: leaves Top, arrives Bottom) */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-slate-600 !border-2 !border-slate-300 hover:!bg-sky-400"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-slate-600 !border-2 !border-slate-300 hover:!bg-sky-400"
      />

      {/* Handles for horizontal ladder (Left-to-Right: leaves Right, arrives Left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-slate-600 !border-2 !border-slate-300 hover:!bg-sky-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-slate-600 !border-2 !border-slate-300 hover:!bg-sky-400"
      />

      {/* Header with Domain Badge, Level & Score */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight uppercase ${domainInfo.bg} ${domainInfo.text} border border-current/20`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${domainInfo.dot}`} />
            {domainInfo.label}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${style.bg} ${style.text} border border-current/20`}
          >
            {style.label}
          </span>
          {isAncestor && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500 font-bold uppercase">
              Required Step
            </span>
          )}
          {isDescendant && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-950 text-purple-300 border border-purple-500 font-bold uppercase">
              Unlocked Next
            </span>
          )}
          {isPhasingOut && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950/90 text-amber-300 border border-amber-600/80 font-bold uppercase">
              Phasing Out
            </span>
          )}
          {isRetired && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700 font-bold uppercase">
              Retired
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
          <Award className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] font-mono font-bold text-slate-200">
            {nodeData?.score != null ? nodeData.score.toFixed(1) : '0.0'}
          </span>
        </div>
      </div>

      {/* Cert Title & Acronym */}
      <div className="mb-2">
        <h4 className="text-sm font-bold text-slate-100 leading-snug line-clamp-1 group-hover:text-sky-300">
          {nodeData?.label}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-1">{nodeData?.fullName}</p>
      </div>

      {/* Meta Footer (Vendor Badge, Exam, Cost) */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate max-w-[120px]">
          <VendorBadgeIcon vendorId={nodeData?.vendorId || ''} vendorName={nodeData?.vendorName || ''} size="sm" />
          <span className="font-medium text-slate-300 truncate">
            {nodeData?.vendorName}
          </span>
        </div>
        {nodeData?.examSummary && (
          <span className="font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded text-[10px]">
            {nodeData.examSummary}
          </span>
        )}
        <span className="font-mono font-semibold text-emerald-400">
          {costDisplay}
        </span>
      </div>
    </div>
  );
});

CustomCertNode.displayName = 'CustomCertNode';

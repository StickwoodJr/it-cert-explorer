'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Award, Shield, CheckCircle2, DollarSign } from 'lucide-react';

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
}

const levelStyles: Record<string, { bg: string; text: string; border: string; glow: string; label: string }> = {
  ENTRY: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    glow: 'rgba(16, 185, 129, 0.15)',
    label: 'Entry / Foundational',
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
    label: 'Expert / Pinnacle',
  },
  SPECIALTY: {
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-400',
    border: 'border-indigo-500/40 hover:border-indigo-400',
    glow: 'rgba(99, 102, 241, 0.15)',
    label: 'Specialty',
  },
};

export const CustomCertNode = memo((props: NodeProps) => {
  const nodeData = props.data as unknown as CertNodeData;
  const selected = props.selected;
  const style = levelStyles[nodeData?.level] || levelStyles.ASSOCIATE;
  const costDisplay = nodeData?.currency === 'CAD' ? nodeData?.costDisplayCad : nodeData?.costDisplayUsd;

  return (
    <div
      className={`relative w-72 rounded-lg border bg-slate-900/95 p-3.5 shadow-lg transition-all duration-200 ${style.border} ${
        selected ? 'ring-2 ring-sky-400 shadow-sky-950/50 scale-[1.02]' : ''
      }`}
      style={{
        boxShadow: selected ? `0 0 20px ${style.glow}` : `0 4px 12px rgba(0, 0, 0, 0.4)`,
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

      {/* Header with Level & Score */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${style.bg} ${style.text} border border-current/20`}
        >
          {nodeData?.level}
        </span>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
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

      {/* Meta Footer (Vendor, Exam, Cost) */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-medium text-slate-300 truncate max-w-[90px]">
          {nodeData?.vendorName}
        </span>
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

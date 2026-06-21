/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Network, Info, EyeOff } from 'lucide-react';
import { ChallengeNode, ConnectionRequirement } from '../types';
import { getNodeIcon, getNodeColorConfig } from '../lib/icons';

interface ReferenceDiagramProps {
  anchors: ChallengeNode[];
  requiredNodes: string[];
  palette: ChallengeNode[];
  requiredConnections: ConnectionRequirement[];
  onClose: () => void;
}

export default function ReferenceDiagram({
  anchors,
  requiredNodes,
  palette,
  requiredConnections,
  onClose
}: ReferenceDiagramProps) {
  // Combine all target correct architectural blocks (anchors + required nodes)
  const requiredPaletteNodes = palette.filter(p => requiredNodes.includes(p.id) && !p.isTrap);
  const refNodes = [
    ...anchors.map(a => ({ ...a, isAnchor: true })),
    ...requiredPaletteNodes.map(n => ({ ...n, isAnchor: false }))
  ];

  // Layering layout logic (re-calculates topological level paths dynamically!)
  const ranks: Record<string, number> = {};
  refNodes.forEach(n => {
    ranks[n.id] = 0;
  });

  // Iteratively relax ranks to layout columns left-to-right properly
  for (let io = 0; io < 6; io++) {
    requiredConnections.forEach(conn => {
      const fromRank = ranks[conn.from] ?? 0;
      const toRank = ranks[conn.to];
      if (toRank !== undefined && toRank <= fromRank) {
        ranks[conn.to] = fromRank + 1;
      }
    });
  }

  // Find max rank to determine layout scale
  let maxRank = 0;
  refNodes.forEach(n => {
    const r = ranks[n.id] ?? 0;
    if (r > maxRank) maxRank = r;
  });

  // Calculate layout coordinates
  const canvasWidth = 780;
  const canvasHeight = 420;

  // Group nodes by their ranks to center them vertically
  const rankGroups: Record<number, ChallengeNode[]> = {};
  refNodes.forEach(n => {
    const r = ranks[n.id] ?? 0;
    if (!rankGroups[r]) rankGroups[r] = [];
    rankGroups[r].push(n);
  });

  const nodePositions: Record<string, { x: number; y: number; width: number; height: number }> = {};
  const nodeW = 150;
  const nodeH = 50;

  // Assign neat coordinates
  Object.keys(rankGroups).forEach((rankStr) => {
    const r = parseInt(rankStr, 10);
    const grp = rankGroups[r];
    const columnCount = maxRank + 1;
    
    // Distribute columns evenly across the width
    const colSpace = (canvasWidth - 140) / Math.max(1, columnCount - 1);
    const x = 70 + r * colSpace - nodeW / 2;

    const numInCol = grp.length;
    const colYInterval = (canvasHeight - 60) / (numInCol + 1);

    grp.forEach((node, idx) => {
      const y = 30 + (idx + 1) * colYInterval - nodeH / 2;
      nodePositions[node.id] = { x, y, width: nodeW, height: nodeH };
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded">
              <Network size={18} />
            </div>
            <div>
              <h3 className="text-base font-display font-medium text-slate-100">
                Official Target Architecture Reference Blueprint
              </h3>
              <p className="text-[11px] text-slate-400">
                Study the optimal system topology, block dependencies, and path labels required to validate this stage successfully.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-100 text-sm font-mono p-1"
          >
            Esc ✕
          </button>
        </div>

        {/* Modal Content - SVG Canvas Flow and Details list */}
        <div className="p-6 space-y-6">
          
          {/* Legend indicator */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 border-b border-slate-800/50 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-900/60 border border-blue-500/50" />
              <span>Target Key Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-950/90 border border-slate-700 border-dashed" />
              <span>Static Anchor Point</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400">──➔</span>
              <span>Required Pipeline Path (labeled)</span>
            </div>
          </div>

          {/* Interactive SVG Flowchart diagram */}
          <div className="relative bg-slate-950 rounded-lg border border-slate-850 p-2 overflow-x-auto select-none">
            <svg 
              width={canvasWidth} 
              height={canvasHeight} 
              className="mx-auto"
            >
              {/* Definition for Marker Arrows */}
              <defs>
                <marker
                  id="ref-arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                </marker>
              </defs>

              {/* Grid Background lines */}
              <g stroke="#1e293b" strokeWidth="0.5" opacity="0.4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <line key={`x-${i}`} x1={i * 60} y1="0" x2={i * 60} y2={canvasHeight} />
                ))}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`y-${i}`} x1="0" y1={i * 50} x2={canvasWidth} y2={i * 50} />
                ))}
              </g>

              {/* A. Draw expected connection lines with path labels */}
              {requiredConnections.map((conn, idx) => {
                const fromPos = nodePositions[conn.from];
                const toPos = nodePositions[conn.to];
                if (!fromPos || !toPos) return null;

                const startX = fromPos.x + nodeW / 2;
                const startY = fromPos.y + nodeH / 2;
                const endX = toPos.x + nodeW / 2;
                const endY = toPos.y + nodeH / 2;

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const pathLabelText = conn.label || `${conn.from} ➔ ${conn.to}`;

                return (
                  <g key={`ref-conn-${idx}`}>
                    {/* Glow bridge path */}
                    <path
                      d={`M ${startX} ${startY} Q ${midX} ${(startY + endY) / 2 - 10}, ${endX} ${endY}`}
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="3.5"
                      opacity="0.4"
                    />
                    {/* Target arrow path */}
                    <path
                      d={`M ${startX} ${startY} Q ${midX} ${(startY + endY) / 2 - 10}, ${endX} ${endY}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      markerEnd="url(#ref-arrow)"
                    />
                    
                    {/* Label badge pill on path */}
                    <foreignObject
                      x={midX - 75}
                      y={((startY + endY) / 2 - 10) - 15}
                      width="150"
                      height="30"
                    >
                      <div className="flex justify-center items-center h-full">
                        <span 
                          className="px-1.5 py-0.5 rounded bg-slate-900 border border-blue-500/35 text-[8.5px] font-mono text-blue-300 font-bold tracking-tight shadow-md max-w-[140px] truncate"
                          title={pathLabelText}
                        >
                          {pathLabelText}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* B. Draw correct component box nodes */}
              {refNodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const nodeIcon = getNodeIcon(node.type);
                const colorConfig = getNodeColorConfig(node.type);

                // Inline helper to map config to hex color for SVG elements
                const getAccentHex = (accent: string) => {
                  switch (accent) {
                    case 'indigo': return '#6366f1';
                    case 'emerald': return '#10b981';
                    case 'amber': return '#f59e0b';
                    case 'purple': return '#a855f7';
                    case 'rose': return '#f43f5e';
                    case 'sky': return '#0ea5e9';
                    case 'teal': return '#14b8a6';
                    default: return '#94a3b8';
                  }
                };

                const hexColor = getAccentHex(colorConfig.accentColor);

                return (
                  <g key={`ref-node-${node.id}`} transform={`translate(${pos.x}, ${pos.y})`}>
                    {/* Outer card box */}
                    <rect
                      width={nodeW}
                      height={nodeH}
                      rx="6"
                      fill="#0b0f19"
                      stroke={node.isAnchor ? '#475569' : hexColor}
                      strokeWidth="1.5"
                      strokeDasharray={node.isAnchor ? '3,3' : undefined}
                      className="shadow-xl"
                    />
                    
                    {/* Category accent tag */}
                    <rect
                      x="0"
                      y="0"
                      width="4"
                      height={nodeH}
                      rx="2"
                      fill={hexColor}
                    />

                    {/* Node Details inside box */}
                    <foreignObject x="8" y="4" width={nodeW - 14} height={nodeH - 8}>
                      <div className="flex items-center gap-1.5 h-full">
                        <div className={`p-1.5 rounded ${colorConfig.badgeBg} flex-shrink-0`}>
                          {React.createElement(nodeIcon, { size: 14, style: { color: hexColor } })}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <span className="text-[10px] font-mono text-slate-500 font-medium uppercase tracking-wider block leading-none">
                            {node.type}
                          </span>
                          <span className="text-[10.5px] font-sans font-bold text-slate-200 truncate leading-tight mt-0.5" title={node.label}>
                            {node.label}
                          </span>
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Expanded text info explanation */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Info size={13} className="text-blue-400" />
              Required Blueprint Rationale
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block border-b border-slate-800 pb-1">🧩 Correct Components checklist:</span>
                <ul className="space-y-1.5 text-[11px] text-slate-400">
                  {refNodes.map((n) => (
                    <li key={n.id} className="flex items-start gap-1">
                      <span className="text-blue-500 font-bold shrink-0">✓</span>
                      <div>
                        <strong className="text-slate-300">{n.label}:</strong> {n.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block border-b border-slate-800 pb-1">🌐 Expected Pipeline Labels:</span>
                <ul className="space-y-1.5 text-[11px] text-slate-400">
                  {requiredConnections.map((req, idx) => {
                    const labelVal = req.label || `${req.from} ➔ ${req.to}`;
                    return (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span className="font-mono text-[10px] text-slate-300 bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-900/30">
                          {labelVal}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-600 rounded text-xs font-mono font-medium transition-all shadow-md flex items-center gap-1.5"
          >
            <EyeOff size={13} />
            Back to Active Workspace
          </button>
        </div>

      </div>
    </div>
  );
}

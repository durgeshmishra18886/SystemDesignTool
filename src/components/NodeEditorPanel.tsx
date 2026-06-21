/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Link, Check, HelpCircle, Server, MessageSquare } from 'lucide-react';
import { CanvasNode, NodeType, CanvasConnection, ConnectionRequirement } from '../types';
import { getNodeIcon, getNodeColorConfig } from '../lib/icons';
import { COMPONENT_QUESTION_BANK } from '../data/challenges';

interface NodeEditorPanelProps {
  node: CanvasNode | null;
  onUpdateJustification: (nodeId: string, text: string) => void;
  onUpdateAnswer: (nodeId: string, question: string, answer: string) => void;
  onStartConnection: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  isConnectingMode: boolean;
  connectingFromNodeId: string | null;
  onUpdateDimensions?: (nodeId: string, width: number, height: number) => void;
  connections: CanvasConnection[];
  requiredConnections: ConnectionRequirement[];
  onUpdateConnectionLabel: (connectionId: string, label: string) => void;
  allNodesOnCanvas: CanvasNode[];
}

export default function NodeEditorPanel({
  node,
  onUpdateJustification,
  onUpdateAnswer,
  onStartConnection,
  onDeleteNode,
  isConnectingMode,
  connectingFromNodeId,
  onUpdateDimensions,
  connections,
  requiredConnections,
  onUpdateConnectionLabel,
  allNodesOnCanvas
}: NodeEditorPanelProps) {
  if (!node) {
    return (
      <div className="h-full flex flex-col justify-center items-center p-8 text-center text-slate-500 bg-slate-900 border border-slate-800/80 rounded-xl">
        <Server size={36} className="text-slate-700 mb-3 animate-pulse" />
        <h4 className="text-sm font-display font-medium text-slate-400 mb-1">
          Inspect Architecture Property
        </h4>
        <p className="text-xs max-w-xs text-slate-500">
          Click any block on the canvas grid to justify its placement, answer target system design questions, or route networks.
        </p>
      </div>
    );
  }

  // Get configuration
  const IconComponent = getNodeIcon(node.type);
  const colors = getNodeColorConfig(node.type);
  const isConnectingThisNode = connectingFromNodeId === node.id;

  // Retrieve questions for this type from standard question bank
  const typeQuestions = COMPONENT_QUESTION_BANK[node.type] || [];

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 space-y-6 overflow-y-auto max-h-[75vh] animate-fade-in">
      
      {/* Component Header Block */}
      <div className="space-y-3 pb-4 border-b border-slate-800">
        <div className="flex items-start justify-between">
          <div className="flex gap-2.5 items-center">
            <div className={`p-2 rounded-lg ${colors.badgeBg} border ${colors.borderColor.replace('border-', 'border-')}`}>
              <IconComponent size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-100 text-base leading-snug">
                {node.label}
              </h3>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider mt-1 ${colors.badgeBg}`}>
                {node.type}
              </span>
            </div>
          </div>

          {!node.isAnchor && (
            <button
              type="button"
              onClick={() => onDeleteNode(node.id)}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors text-xs"
              title="Remove component"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {node.description}
        </p>
      </div>

      {/* Network actions - Tactful Connection initiation */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Connection Pipeline</span>
        {isConnectingMode ? (
          isConnectingThisNode ? (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-mono text-center animate-pulse">
              Select other Canvas node to route link...
            </div>
          ) : (
            <div className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg text-xs leading-relaxed text-slate-400">
              Click this node on the canvas to complete the link routing.
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={() => onStartConnection(node.id)}
            className="w-full py-2 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 rounded-lg text-xs font-mono text-blue-400 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Link size={14} />
            Start Connection Pipeline From Here
          </button>
        )}
      </div>

      {/* Handle active pipeline routing dropdown labels */}
      {(() => {
        const nodeConnections = connections.filter(c => c.from === node.id || c.to === node.id);
        if (nodeConnections.length === 0) return null;

        return (
          <div className="space-y-3 p-3.5 bg-slate-950/45 border border-slate-850 rounded-lg animate-fade-in">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              🌐 Routing Pipeline Labels
            </span>
            <div className="space-y-3">
              {nodeConnections.map((c) => {
                const fromN = allNodesOnCanvas.find(n => n.id === c.from);
                const toN = allNodesOnCanvas.find(n => n.id === c.to);
                if (!fromN || !toN) return null;

                const isFromMe = fromN.id === node.id;
                const otherN = isFromMe ? toN : fromN;

                return (
                  <div key={c.id} className="space-y-1.5 pb-2.5 border-b border-slate-850 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-[10px] font-mono leading-tight">
                      <span className="text-slate-500">
                        {isFromMe ? 'Outgoing link to:' : 'Incoming link from:'}
                      </span>
                      <span className="font-bold text-slate-350">
                        {otherN.label}
                      </span>
                    </div>
                    <select
                      value={c.label || ''}
                      onChange={(e) => onUpdateConnectionLabel(c.id, e.target.value)}
                      className="text-[11px] bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-md p-1.5 text-slate-300 w-full focus:outline-none"
                    >
                      <option value="">-- Select preloaded target route --</option>
                      {requiredConnections.map((req, ridx) => {
                        const labelText = req.label || `${req.from} ➔ ${req.to}`;
                        return (
                          <option key={ridx} value={labelText}>
                            {labelText}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-550 leading-relaxed italic">
              Matching stage requirements precisely is essential. Always label your routing pipeline paths!
            </p>
          </div>
        );
      })()}

      {/* Dynamic Size Controls */}
      <div className="space-y-2 p-3 bg-slate-950/40 border border-slate-850 rounded-lg">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
          📐 Dimension Scaling
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onUpdateDimensions?.(node.id, 160, 75)}
            className={`px-2.5 py-1 text-[10px] font-semibold font-mono border rounded-lg transition-all cursor-pointer ${
              (node.width === 160 && node.height === 75)
                ? 'bg-blue-950/40 border-blue-500/55 text-blue-400 shadow-inner'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Compact (160x75)
          </button>
          <button
            type="button"
            onClick={() => onUpdateDimensions?.(node.id, 220, 90)}
            className={`px-2.5 py-1 text-[10px] font-semibold font-mono border rounded-lg transition-all cursor-pointer ${
              (!node.width || (node.width === 220 && node.height === 90))
                ? 'bg-blue-950/40 border-blue-500/55 text-blue-400 shadow-inner'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard (220x90)
          </button>
          <button
            type="button"
            onClick={() => onUpdateDimensions?.(node.id, 280, 100)}
            className={`px-2.5 py-1 text-[10px] font-semibold font-mono border rounded-lg transition-all cursor-pointer ${
              (node.width === 280 && node.height === 100)
                ? 'bg-blue-950/40 border-blue-500/55 text-blue-400 shadow-inner'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Wide (280x100)
          </button>
        </div>
        <p className="text-[10px] text-slate-500 font-sans leading-normal italic">
          Tip: You can also drag the resize handle in the bottom-right corner of component cardboard boxes directly on the canvas!
        </p>
      </div>

      {/* Justify It Textbox */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-between">
          <span>📝 Write Your Justification</span>
          <span className="text-[9px] text-slate-600 font-normal">Saves to local blueprint</span>
        </label>
        <textarea
          value={node.justificationText}
          onChange={(e) => onUpdateJustification(node.id, e.target.value)}
          placeholder="Why did you place this functional node here? (e.g., 'Allows horizontal scaling by decouplin...', 'Pre-caches requests close to clients...')"
          rows={3}
          className="w-full p-3 bg-slate-95d bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-lg text-xs text-slate-300 font-sans focus:outline-none placeholder-slate-600 leading-relaxed"
        />
      </div>

      {/* Structured Recall System Questions */}
      {typeQuestions.length > 0 && (
        <div className="space-y-4">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <HelpCircle size={12} className="text-slate-600" />
            Target Recall Inquiries
          </span>
          <div className="space-y-4">
            {typeQuestions.map((q, idx) => {
              const currentVal = node.answers[q.question] || '';
              return (
                <div key={idx} className="space-y-1.5 p-3.5 bg-slate-950/40 border border-slate-850 rounded-lg">
                  <span className="text-xs font-medium text-slate-250 block font-sans">
                    {q.question}
                  </span>
                  <textarea
                    value={currentVal}
                    onChange={(e) => onUpdateAnswer(node.id, q.question, e.target.value)}
                    placeholder={q.placeholder}
                    rows={2}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800/80 focus:border-blue-500/30 rounded-md text-[11px] text-slate-300 font-sans focus:outline-none placeholder-slate-700 leading-normal"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

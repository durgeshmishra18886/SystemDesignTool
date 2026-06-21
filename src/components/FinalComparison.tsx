/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, CheckCircle2, ChevronRight, RotateCcw, Home, BookOpen, AlertCircle } from 'lucide-react';
import { Challenge, CanvasNode } from '../types';
import { getNodeIcon, getNodeColorConfig } from '../lib/icons';

interface FinalComparisonProps {
  challenge: Challenge;
  stagesNodes: Record<number, CanvasNode[]>;
  onHome: () => void;
  onRestart: () => void;
}

export default function FinalComparison({
  challenge,
  stagesNodes,
  onHome,
  onRestart
}: FinalComparisonProps) {
  const [activeStageId, setActiveStageId] = useState<number>(1);

  // Collect all nodes from all stages
  const getStageNodes = (stageId: number): CanvasNode[] => {
    return stagesNodes[stageId] || [];
  };

  const currentStageNodes = getStageNodes(activeStageId);
  const activeStageDetails = challenge.stages.find(s => s.id === activeStageId);

  // Compute overall performance summary metrics
  let totalRequiredCount = 0;
  let totalMatchedCount = 0;
  let trapsAvoided = 0;
  let totalTrapsEncountered = 0;

  challenge.stages.forEach((st) => {
    totalRequiredCount += st.requiredNodes.length;
    const placedNodes = stagesNodes[st.id] || [];
    const matched = placedNodes.filter(n => st.requiredNodes.includes(n.templateId) || n.isAnchor);
    totalMatchedCount += matched.length;

    // Traps
    const potentialTraps = st.palette.filter(p => p.isTrap).length;
    const triggeredTrapsOnStage = placedNodes.filter(n => n.isTrap).length;
    totalTrapsEncountered += triggeredTrapsOnStage;
    trapsAvoided += (potentialTraps - triggeredTrapsOnStage);
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* Banner / Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full animate-bounce">
          <Award size={32} />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-100 tracking-tight">
            Challenge Completed!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2 font-sans">
            Congratulations! You have successfully completed the stages of <span className="text-blue-400 font-semibold">{challenge.title}</span> and verified your architecture schema.
          </p>
        </div>
      </div>

      {/* Analytics scorecard panel */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">Core Subelements Aligned</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-bold text-emerald-400">
              {totalMatchedCount}
            </span>
            <span className="text-sm font-mono text-slate-500">placed successfully</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">Structural Traps Avoided</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-bold text-blue-450 text-blue-400">
              {trapsAvoided}
            </span>
            <span className="text-sm font-mono text-slate-500">bottlenecks bypassed</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">Triggered Traps</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-display font-bold ${totalTrapsEncountered > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-405 text-slate-400'}`}>
              {totalTrapsEncountered}
            </span>
            <span className="text-sm font-mono text-slate-500">triggered</span>
          </div>
        </div>
      </div>

      {/* Comparison tabs by stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-800 bg-slate-950">
          {challenge.stages.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStageId(st.id)}
              className={`px-5 py-3.5 text-xs font-mono font-medium border-r border-slate-800 transition-all cursor-pointer ${
                activeStageId === st.id
                  ? 'bg-slate-900 text-blue-400 border-b-2 border-b-blue-500'
                  : 'text-slate-550 text-slate-400 hover:bg-slate-900/50'
              }`}
            >
              Stage {st.id}: {st.title.split(':')[1] || st.title}
            </button>
          ))}
        </div>

        {/* Stage analysis description */}
        {activeStageDetails && (
          <div className="p-5 bg-slate-950/20 border-b border-slate-850/65">
            <h3 className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
              Stage Objective Review
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {activeStageDetails.objective}
            </p>
          </div>
        )}

        {/* List of placed blocks, user justification vs dynamic reference text */}
        <div className="divide-y divide-slate-850 p-6 space-y-6 max-h-[50vh] overflow-y-auto">
          {currentStageNodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const colors = getNodeColorConfig(node.type);
            const isTrap = node.isTrap;

            return (
              <div key={node.id} className="pt-4 first:pt-0 grid md:grid-cols-2 gap-6 items-start">
                
                {/* Left: User item and why they placed it */}
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <div className={`p-1.5 rounded ${colors.badgeBg}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-semibold ${isTrap ? 'text-rose-400' : 'text-slate-205'}`}>
                        {node.label}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Your Built-in Justification
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs leading-relaxed text-slate-350 italic font-sans min-h-[50px]">
                    {node.justificationText || (
                      <span className="text-slate-600 font-sans">
                        No justification supplied for this block.
                      </span>
                    )}
                  </div>

                  {/* Recall Answers (if any) */}
                  {Object.keys(node.answers).length > 0 && (
                    <div className="space-y-1 bg-slate-950/50 p-2.5 rounded border border-slate-850/60">
                      <span className="text-[10px] font-mono text-slate-550 text-slate-400 block font-semibold">Technical Recall Answers:</span>
                      {Object.entries(node.answers).map(([qText, ansText], i) => (
                        <div key={i} className="text-[10px] font-sans text-slate-400 mt-1 first:mt-0 leading-normal">
                          <strong className="text-slate-300">Q: {qText}</strong>
                          <p className="text-slate-350 italic ml-1 select-none">Ans: {ansText || 'Not configured.'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Expert Course Reference standard */}
                <div className="space-y-3 md:bg-blue-950/5 p-4 rounded-lg md:border md:border-blue-900/10">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400">
                    <BookOpen size={13} />
                    Expert Curriculum Explanation
                  </div>

                  {isTrap ? (
                    <div className="p-3.5 bg-rose-950/15 border border-rose-900/20 rounded-lg text-xs font-sans text-slate-400 leading-relaxed">
                      <strong className="text-rose-300">Scaling Failure Warning:</strong> {node.trapExplanation}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-350 leading-relaxed font-sans">
                      {node.referenceJustification}
                    </p>
                  )}
                </div>

              </div>
            );
          })}

          {currentStageNodes.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500 italic">
              No architectural blocks discovered for this stage.
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
        <button
          type="button"
          onClick={onRestart}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-755 rounded-xl text-xs font-mono text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw size={14} />
          Reset This Challenge
        </button>

        <button
          type="button"
          onClick={onHome}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 border border-blue-600 rounded-xl text-xs font-mono text-white flex items-center justify-center gap-2 font-medium hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer"
        >
          <Home size={14} />
          Main Select Portal
        </button>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { StageFeedback, ChallengeNode } from '../types';

interface ValidationReportProps {
  feedback: StageFeedback | null;
  palette: ChallengeNode[];
  onConfirmNext: () => void;
  onClose: () => void;
  isLastStage: boolean;
  onBypassStage?: () => void;
}

export default function ValidationReport({
  feedback,
  palette,
  onConfirmNext,
  onClose,
  isLastStage,
  onBypassStage
}: ValidationReportProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!feedback) return null;

  // Compile map of trap descriptions for active traps
  const activeTrapsWithDetails = feedback.traps.map((trapId) => {
    return palette.find((p) => p.id === trapId);
  }).filter((t): t is ChallengeNode => !!t);

  // 1. Dynamic Design Accuracy Scoring Calculation
  const totalTargetItems = feedback.matched.length + feedback.missing.length + feedback.connectionsResult.matched.length + feedback.connectionsResult.missing.length;
  const totalMatchedItems = feedback.matched.length + feedback.connectionsResult.matched.length;

  // Base matches percentage
  const rawScore = totalTargetItems > 0 ? (totalMatchedItems / totalTargetItems) * 100 : 100;
  
  // Deduct 15 percentage points per active architectural trap placed
  const trapCount = feedback.traps.length;
  const score = Math.max(0, Math.round(rawScore - (trapCount * 15)));

  // User is allowed to advance to the next stage if they reach at least 70% correct design
  const isPassingScore = score >= 70;
  const hasErrors = feedback.missing.length > 0 || feedback.traps.length > 0 || feedback.connectionsResult.missing.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${score >= 100 ? 'bg-emerald-500/10 text-emerald-400' : isPassingScore ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-450'}`}>
              {score >= 100 ? <Sparkles size={18} /> : isPassingScore ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            </div>
            <h3 className="text-xl font-display font-medium text-slate-100">
              {score >= 100 ? 'Seamless Blueprint Approval!' : isPassingScore ? 'Architectural Gateway Authorized' : 'System Evaluation Required'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-100 text-sm font-mono p-1"
          >
            Esc ✕
          </button>
        </div>

        {/* Modal Body Contents */}
        <div className="p-6 space-y-6">
          {/* Scoring Progress Bar Display */}
          <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">
                Design Accuracy Score
              </span>
              <span className={`text-xl font-mono font-bold ${score >= 100 ? 'text-emerald-400' : isPassingScore ? 'text-blue-400' : 'text-rose-400'}`}>
                {score}%
              </span>
            </div>
            
            {/* Visual dynamic progress bar */}
            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                style={{ width: `${score}%` }} 
                className={`h-full rounded-full transition-all duration-550 ${
                  score >= 100 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : isPassingScore 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400' 
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
              />
            </div>

            {/* Explanatory description of pass status */}
            <p className="text-xs text-slate-400 leading-relaxed font-sans pt-1">
              {score >= 100 ? (
                <span className="text-emerald-300 font-bold block mb-0.5">✨ Pristine Architecture (100% Verified):</span>
              ) : isPassingScore ? (
                <span className="text-blue-300 font-bold block mb-0.5">✓ Passing Grade Unlocked (≥ 70% threshold):</span>
              ) : (
                <span className="text-rose-400 font-bold block mb-0.5">⚠️ Insufficient Accuracy (&lt; 70% requirement):</span>
              )}
              {score >= 100 ? (
                `Magnificent blueprint! Your design is fully optimized and robust. You are fully ready to scale to production or advance to the next project stages!`
              ) : isPassingScore ? (
                `Your blueprint scored ${score}%, passing our strict 70% gateway criteria. Although a few details are still missing or misplaced, you are authorized to advance to the next challenge node now! You can also close this audit and refine for a perfect 100% score.`
              ) : (
                `Your current layout scored only ${score}%, which is under the 70% minimum threshold. You must address the critical errors highlighted below to authorize moving to the next challenge.`
              )}
            </p>

            {!isPassingScore && onBypassStage && (
              <div className="mt-3.5 p-3.5 rounded-lg border border-rose-900/40 bg-rose-950/20 text-xs">
                <span className="font-bold text-rose-300 block mb-1">
                  💡 Stuck on this level? Bypass & reveal solution template!
                </span>
                <p className="text-slate-450 mb-3 font-sans leading-relaxed">
                  If you accept to continue without the required passing score, we will automatically unlock the next staged gate and open the complete target diagram blueprint for you, so you can see exactly how the actual components and routes should connect.
                </p>
                <button
                  type="button"
                  onClick={onBypassStage}
                  className="px-4 py-2 bg-gradient-to-r from-rose-950 to-rose-900 hover:from-rose-900 hover:to-rose-800 text-rose-200 border border-rose-800 hover:border-rose-605 rounded text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  👁️ Reveal Actual Diagram & Continue Anyway
                </button>
              </div>
            )}
          </div>

          {/* Main Error/Audit Summary Panel */}
          {hasErrors ? (
            <div className="p-4 bg-amber-955/20 border border-amber-900/30 rounded-lg text-slate-300 text-xs space-y-1.5 font-sans">
              <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                <AlertCircle size={14} /> Architectural Action Needed (Total Remaining Gaps: {feedback.missing.length + feedback.traps.length + feedback.connectionsResult.missing.length})
              </span>
              <p className="text-slate-400 leading-relaxed">
                To maximize resilience and performance, inspect the failure breakdown list below. Resolving these issues will protect your system against outages, data loss, and cpu blockades.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-300 text-xs">
              <span className="font-semibold flex items-center gap-1.5 mb-1 text-emerald-250">
                <CheckCircle2 size={14} /> Perfect System Configuration
              </span>
              All core constraints are fully satisfied. Excellent operational alignment.
            </div>
          )}

          {/* Trap components section - CRITICAL EDUCATIONAL COMPONENT */}
          {activeTrapsWithDetails.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono text-rose-450 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <XCircle size={13} className="text-rose-500" />
                ⚠️ Placed Architectural Traps (Each traps deducts 15% points)
              </h4>
              <div className="space-y-3">
                {activeTrapsWithDetails.map((trap) => (
                  <div key={trap.id} className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-lg animate-fade-in text-xs">
                    <span className="font-bold text-rose-300 block mb-1">
                      Critical Bottleneck: Placed &quot;{trap.label}&quot;
                    </span>
                    <p className="text-slate-450 leading-relaxed font-sans text-[11.5px]">
                      <strong className="text-rose-250">Failure Analysis:</strong> {trap.trapExplanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Core Elements Section */}
          {(feedback.missing.length > 0 || feedback.connectionsResult.missing.length > 0) && (
            <div className="space-y-3">
              <h4 className="text-[11.5px] font-mono text-amber-500 uppercase tracking-widest font-bold">
                ⚠️ Missing Blueprint Gaps
              </h4>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {/* Missing Nodes */}
                {feedback.missing.length > 0 && (
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex flex-col gap-2">
                    <span className="text-[11.5px] font-semibold text-slate-350">Missing Subsystems:</span>
                    <ul className="space-y-1.5">
                      {feedback.missing.map((nodeId) => {
                        const original = palette.find(p => p.id === nodeId);
                        return (
                          <li key={nodeId} className="text-[11px] text-amber-250 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            {original ? original.label : nodeId}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Missing Connections */}
                {feedback.connectionsResult.missing.length > 0 && (
                  <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex flex-col gap-2">
                    <span className="text-[11.5px] font-semibold text-slate-350">Required Pipelines:</span>
                    <ul className="space-y-1.5">
                      {feedback.connectionsResult.missing.map((connLabel, idx) => (
                        <li key={idx} className="text-[11px] text-amber-250 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                          <span>{connLabel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Matched Blocks / Successfully Verified Components */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold">
              ✓ Successfully Verified Configurations
            </h4>
            <div className="flex flex-wrap gap-2">
              {feedback.matched.map((nodeId) => {
                const original = palette.find(p => p.id === nodeId);
                return (
                  <span key={nodeId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10.5px] font-mono text-emerald-450">
                    <CheckCircle2 size={11} />
                    {original ? original.label : nodeId}
                  </span>
                );
              })}
              {feedback.connectionsResult.matched.map((connLabel, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10.5px] font-mono text-blue-400">
                  <CheckCircle2 size={11} />
                  Route: {connLabel}
                </span>
              ))}
              {feedback.matched.length === 0 && feedback.connectionsResult.matched.length === 0 && (
                <span className="text-xs text-slate-500 italic">No connections or nodes successfully placed yet.</span>
              )}
            </div>
          </div>

          {/* Extras / Alternative customizations (Does not block) */}
          {feedback.extras.length > 0 && (
            <div className="space-y-1 bg-slate-950 p-3 rounded border border-slate-850 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 block font-mono uppercase">Alternative custom elements built:</span>
              <p className="text-[11.5px] text-slate-400 leading-relaxed font-sans">
                You placed <span className="text-slate-300 font-semibold">{feedback.extras.join(', ')}</span>. Excellent operational foresight—these blocks do not impede correctness and can monitor telemetry or cache edge queries gracefully.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-mono text-slate-300 transition-colors cursor-pointer"
          >
            Adjust blueprint
          </button>
          
          <button
            type="button"
            disabled={!isPassingScore}
            onClick={onConfirmNext}
            className={`px-4 py-2 rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              !isPassingScore
                ? 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-600 hover:shadow-lg hover:shadow-blue-500/10'
            }`}
          >
            {isLastStage ? 'Final Performance Review' : 'Unlock Next Staged Gate'}
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}

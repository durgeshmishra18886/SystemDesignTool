/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Eye, EyeOff, KeyRound } from 'lucide-react';

interface HintLadderProps {
  hints: string[];
}

export default function HintLadder({ hints }: HintLadderProps) {
  const [revealedCount, setRevealedCount] = useState<number>(0);

  const handleReveal = () => {
    if (revealedCount < hints.length) {
      setRevealedCount(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setRevealedCount(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800/85 rounded-xl p-5 space-y-4">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded">
            <HelpCircle size={15} />
          </div>
          <div>
            <h4 className="text-sm font-display font-semibold text-slate-100">
              Architectural Hint Ladder
            </h4>
            <p className="text-[11px] font-mono text-slate-500">
              Scaffolded suggestions ({revealedCount} of {hints.length} revealed)
            </p>
          </div>
        </div>

        {revealedCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 underline"
          >
            Reset Hints
          </button>
        )}
      </div>

      {/* Scaffold Cards Stack */}
      <div className="space-y-2.5">
        {hints.map((hintText, idx) => {
          const isRevealed = idx < revealedCount;
          const isNext = idx === revealedCount;

          if (isRevealed) {
            return (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs leading-relaxed text-slate-350 font-sans flex gap-2.5 animate-fade-in"
              >
                <div className="text-blue-400 shrink-0 select-none font-mono">
                  [Tip #{idx + 1}]
                </div>
                <div>{hintText}</div>
              </div>
            );
          }

          if (isNext) {
            return (
              <button
                key={idx}
                type="button"
                onClick={handleReveal}
                className="w-full p-3 bg-slate-950/20 hover:bg-slate-950 border border-slate-800 border-dashed rounded-lg text-left text-xs font-mono text-slate-400 hover:text-blue-400 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <KeyRound size={13} className="text-slate-500 group-hover:text-blue-400" />
                  Reveal Incremental Tip #{idx + 1}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 px-2 py-0.5 rounded">
                  UNCLOAK
                </span>
              </button>
            );
          }

          // Locked and stacked hints
          return (
            <div
              key={idx}
              className="p-3 bg-slate-950/5 border border-slate-800/40 rounded-lg text-xs font-mono text-slate-600 select-none flex items-center gap-2"
            >
              <EyeOff size={13} className="text-slate-700" />
              Locked Suggestion Tip #{idx + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

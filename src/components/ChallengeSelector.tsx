/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Video, MessageSquare, Flame, Clock, Award, Star, BookOpen } from 'lucide-react';
import { Challenge } from '../types';

interface ChallengeSelectorProps {
  challenges: Challenge[];
  onSelectChallenge: (challengeId: string) => void;
}

export default function ChallengeSelector({ challenges, onSelectChallenge }: ChallengeSelectorProps) {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Visual Identity Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-mono mb-4 animate-fade-in">
          <Award size={14} />
          SYSTEM DESIGN INTERACTIVE STUDIO
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-100 mb-4 tracking-tight">
          System Design Practice Canvas
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-sans">
          Test, validate, and master high-scale architecture layouts with our interactive staging sandbox.
          Place functional components, bridge channels, and justify your choices under engineering constraints.
        </p>
      </div>

      {/* Challenge Grid cards */}
      <div className="grid md:grid-cols-2 gap-8 items-stretch mb-12">
        {challenges.map((challenge) => {
          const isYoutube = challenge.id === 'youtube';
          const IconComponent = isYoutube ? Video : MessageSquare;
          const difficulty = isYoutube ? 'Hard' : 'Medium-Hard';
          const difficultyColor = isYoutube ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          const timeEst = isYoutube ? '30 mins' : '20 mins';

          return (
            <div
              key={challenge.id}
              className="group relative flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/5 cursor-pointer"
              onClick={() => onSelectChallenge(challenge.id)}
            >
              {/* Radial gradient glow behind card on hover */}
              <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

              <div>
                {/* Meta details */}
                <div className="flex justify-between items-center mb-5">
                  <div className={`p-3 rounded-lg ${isYoutube ? 'bg-rose-500/10 text-rose-400' : 'bg-sky-500/10 text-sky-400'}`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColor}`}>
                      {difficulty}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-400 bg-slate-800 border border-slate-700">
                      <Clock size={12} />
                      {timeEst}
                    </span>
                  </div>
                </div>

                {/* Challenge Title */}
                <h3 className="text-xl font-display font-medium text-slate-100 group-hover:text-blue-400 transition-colors mb-3">
                  {challenge.title}
                </h3>

                {/* Challenge Description */}
                <p className="text-slate-405 text-sm leading-relaxed mb-6">
                  {challenge.description}
                </p>

                {/* Architecture Topics Tag List */}
                <div className="mb-6">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BookOpen size={12} />
                    Target Architectural Concepts
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {isYoutube ? (
                      <>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">Dynamic Transcoding</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">HLS/DASH Streaming</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">Global CDN Caching</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">Decoupled Kafka Pipelines</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">Stateful WebSockets</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">Redis Pub/Sub Sync</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">Session State Tables</span>
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-mono">Bi-Directional Streaming</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400 group-hover:text-blue-400 transition-colors">
                <span>STAGE SYSTEM DESIGN</span>
                <span className="flex items-center gap-1 text-blue-500">
                  Load Blank Blueprint →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide details */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 max-w-3xl mx-auto">
        <h4 className="font-display font-medium text-slate-205 mb-3 flex items-center gap-2">
          <Award size={18} className="text-yellow-500" />
          Rules of Engagement
        </h4>
        <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
          <li><strong>Staged Architecture:</strong> Complex systems are broken into independent write-paths, read-paths, and offline scaling checkpoints.</li>
          <li><strong>Strict Guardrails:</strong> Each stage provides locked anchor nodes representing client gateways and databases. Add correct components and link them.</li>
          <li><strong>Audit & Defend:</strong> You must justify your components and answers. Trap options lurk in the palette to expose architectural anti-patterns!</li>
          <li><strong>Reference Overlays:</strong> Successfully passing each stage unlocks the final global comparison matrix against reference books.</li>
        </ul>
      </div>
    </div>
  );
}

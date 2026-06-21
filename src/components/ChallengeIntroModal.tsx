/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { 
  Play, 
  HelpCircle, 
  Video, 
  MessageSquare, 
  Layers, 
  ArrowRight, 
  Target, 
  Settings, 
  Zap, 
  BookOpen 
} from 'lucide-react';
import { Challenge } from '../types';

interface ChallengeIntroModalProps {
  challenge: Challenge;
  onClose: () => void;
}

export default function ChallengeIntroModal({ challenge, onClose }: ChallengeIntroModalProps) {
  const isYoutube = challenge.id === 'youtube';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between text-slate-100">
        
        {/* Decorative Top Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-rose-500 rounded-t-2xl shrink-0" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isYoutube ? 'bg-rose-500/10 text-rose-400' : 'bg-sky-500/10 text-sky-400'}`}>
              {isYoutube ? <Video size={24} /> : <MessageSquare size={24} />}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-500 block">
                SYSTEM DESIGN DEPLOYMENT MISSION
              </span>
              <h2 className="text-xl font-display font-bold text-slate-100">
                {challenge.title}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-slate-950/40 p-1.5 border border-slate-800 rounded-md font-mono text-xs cursor-pointer"
          >
            Skip ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto font-sans leading-relaxed text-sm">
          
          {/* Section 1: Executive Platform Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Zap size={14} className="text-amber-500" />
              Platform Mission & Scale Requirement
            </h3>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-850">
              {isYoutube ? (
                <p className="text-slate-300">
                  <span className="font-semibold text-white">YouTube</span> is a global video platform serving billions of users. 
                  The ultimate goal is to process massive write workloads (heavy video uploads) and high-volume, low-latency playback reads 
                  (dynamic dynamic streaming). Our architecture leverages asynchronous chunk division, dynamic bitter-rate transcoders, 
                  and high-speed edge distribution cache models to avoid CPU exhaustion and prevent origin disk saturation.
                </p>
              ) : (
                <p className="text-slate-300">
                  <span className="font-semibold text-white">Slack/WhatsApp Messenger</span> represents an ultra-high concurrency system 
                  demanding persistent bidirectional sockets, message queuing during channel offline states, and rapid broadcast synchronizers.
                  Standard HTTP architectures melt under this continuous load, requiring fully stateful websocket backbones.
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Expected Stage-by-Stage Architecture Flow */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Layers size={14} className="text-blue-500" />
              What You Need to Design (The Staged Roadmap)
            </h3>
            
            <div className="space-y-3.5">
              {challenge.stages.map((stage, idx) => (
                <div 
                  key={stage.id} 
                  className="flex items-start gap-4 p-3.5 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:border-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold font-mono text-slate-200">
                      {stage.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 block uppercase font-mono tracking-wide">
                      {stage.subtitle}
                    </span>
                    <p className="text-xs text-slate-400 leading-normal">
                      {stage.objective}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: User Action Requirements */}
          <div className="p-4 bg-blue-950/20 rounded-xl border border-blue-500/15 space-y-3.5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5">
              <Target size={14} />
              Your Expected Deliverables & Objectives:
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 list-none pl-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 text-sm leading-none mt-0.5">▪</span>
                <span><strong>Drag & Drop components:</strong> Open the palette and drag correct architectural nodes (e.g., Gateways, Handlers, Message queues) into the active design canvas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 text-sm leading-none mt-0.5">▪</span>
                <span><strong>Construct correct pipelines:</strong> Wire logical connection lines between nodes representing specific network pathways.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 text-sm leading-none mt-0.5">▪</span>
                <span><strong>Define Route Protocol labels:</strong> Selection dropdowns are active on connection lines. Choose custom route protocols or pick from our recommended options!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 text-sm leading-none mt-0.5">▪</span>
                <span><strong>Justify trade-offs:</strong> Click nodes to write operational arguments answering challenging production-grade questions.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-slate-900 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer hover:scale-[1.02]"
          >
            <Play size={14} />
            Start Design Staging Area
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Laptop,
  Cpu,
  Database,
  Shuffle,
  Zap,
  Globe,
  HardDrive,
  LucideIcon
} from 'lucide-react';
import { NodeType } from '../types';

export const getNodeIcon = (type: NodeType): LucideIcon => {
  switch (type) {
    case 'Client':
      return Laptop;
    case 'Compute':
      return Cpu;
    case 'Database':
      return Database;
    case 'Queue':
      return Shuffle;
    case 'Cache':
      return Zap;
    case 'Network':
      return Globe;
    case 'Storage':
      return HardDrive;
    default:
      return Cpu;
  }
};

export interface NodeTypeConfig {
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  badgeBg: string;
}

export const getNodeColorConfig = (type: NodeType): NodeTypeConfig => {
  switch (type) {
    case 'Client':
      return {
        bgColor: 'bg-[#151c2c]',
        borderColor: 'border-indigo-500/60',
        textColor: 'text-indigo-250 text-indigo-200',
        accentColor: 'indigo',
        badgeBg: 'bg-indigo-505/10 bg-indigo-500/10 text-indigo-300'
      };
    case 'Compute':
      return {
        bgColor: 'bg-[#121f1c]',
        borderColor: 'border-emerald-500/60',
        textColor: 'text-emerald-250 text-emerald-200',
        accentColor: 'emerald',
        badgeBg: 'bg-emerald-505/10 bg-emerald-500/10 text-emerald-300'
      };
    case 'Database':
      return {
        bgColor: 'bg-[#221c17]',
        borderColor: 'border-amber-500/60',
        textColor: 'text-amber-250 text-amber-200',
        accentColor: 'amber',
        badgeBg: 'bg-amber-505/10 bg-amber-500/10 text-amber-300'
      };
    case 'Queue':
      return {
        bgColor: 'bg-[#1c1825]',
        borderColor: 'border-purple-500/60',
        textColor: 'text-purple-250 text-purple-200',
        accentColor: 'purple',
        badgeBg: 'bg-purple-505/10 bg-purple-500/10 text-purple-300'
      };
    case 'Cache':
      return {
        bgColor: 'bg-[#22171a]',
        borderColor: 'border-rose-500/60',
        textColor: 'text-rose-250 text-rose-200',
        accentColor: 'rose',
        badgeBg: 'bg-rose-505/10 bg-rose-500/10 text-rose-300'
      };
    case 'Network':
      return {
        bgColor: 'bg-[#111e29]',
        borderColor: 'border-sky-500/60',
        textColor: 'text-sky-250 text-sky-200',
        accentColor: 'sky',
        badgeBg: 'bg-sky-505/10 bg-sky-500/10 text-sky-300'
      };
    case 'Storage':
      return {
        bgColor: 'bg-[#101f22]',
        borderColor: 'border-teal-500/60',
        textColor: 'text-teal-250 text-teal-200',
        accentColor: 'teal',
        badgeBg: 'bg-teal-505/10 bg-teal-500/10 text-teal-300'
      };
    default:
      return {
        bgColor: 'bg-[#181f2a]',
        borderColor: 'border-slate-500/60',
        textColor: 'text-slate-250 text-slate-200',
        accentColor: 'slate',
        badgeBg: 'bg-slate-500/10 text-slate-300'
      };
  }
};

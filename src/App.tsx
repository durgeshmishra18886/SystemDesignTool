/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Compass, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Plus, 
  Link,
  Sparkles,
  Layers,
  ArrowLeftRight,
  Database,
  Cpu,
  Tv,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { 
  Challenge, 
  CanvasNode, 
  CanvasConnection, 
  StageFeedback, 
  ProjectState, 
  NodeType,
  ChallengeNode
} from './types';

import { SYSTEM_CHALLENGES } from './data/challenges';
import { getNodeIcon, getNodeColorConfig } from './lib/icons';

// Import our modular subcomponents
import ChallengeSelector from './components/ChallengeSelector';
import ValidationReport from './components/ValidationReport';
import HintLadder from './components/HintLadder';
import NodeEditorPanel from './components/NodeEditorPanel';
import FinalComparison from './components/FinalComparison';
import ReferenceDiagram from './components/ReferenceDiagram';
import ChallengeIntroModal from './components/ChallengeIntroModal';
import { BookOpen, Eye, EyeOff, FileText } from 'lucide-react';

// Calculates distance from rect center (0,0) to standard border along direction (dx, dy)
function getBoxOffset(dx: number, dy: number, w: number, h: number): number {
  if (dx === 0 && dy === 0) return 0;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  
  if (absDx * h > absDy * w) {
    // Hits vertical left/right edges first
    const dist = Math.sqrt(dx * dx + dy * dy);
    return (w / 2) * (dist / absDx);
  } else {
    // Hits horizontal top/bottom edges first
    const dist = Math.sqrt(dx * dx + dy * dy);
    return (h / 2) * (dist / absDy);
  }
}

const LOCAL_STORAGE_KEY = 'system-design-practice-state-v1';

export interface ThemeConfig {
  id: string;
  name: string;
  icon: string;
  isLight: boolean;
  pageBg: string;            // Body wrapper
  headerBg: string;          // Header bar
  headerBorder: string;      // Header border wrapper
  sidebarBg: string;         // Left palette & right editor panel
  sidebarBorder: string;     // Panel border lines
  sidebarHeading: string;    // Sidebar inner subtags
  nodeCardBg: string;        // Node palette cards
  nodeCardHover: string;     // Palette card hover
  canvasBg: string;          // Grid board bg
  textPrimary: string;       // Primary headers & active state text
  textSecondary: string;     // Standard explanations/captions
  textMuted: string;         // Mini timestamps/subtexts
  accentText: string;        // Active selection tag texts / highlight colors
  accentBtn: string;         // Primary actions (Validate page)
  accentBorder: string;      // Active selection rings/lines
  nodeHeaderBg: string;      // Node headers mapping
  nodeBodyBg: string;        // Node block body
  nodeBorder: string;        // Node border styles
  inputBgSelect: string;     // Dropdowns / inputs inside flow context
}

export const SYSTEM_THEMES: Record<string, ThemeConfig> = {
  slate: {
    id: 'slate',
    name: 'Slate Twilight',
    icon: '🌌',
    isLight: false,
    pageBg: 'bg-slate-950 text-slate-100',
    headerBg: 'bg-slate-900/80 backdrop-blur-md',
    headerBorder: 'border-slate-805 border-slate-800/85',
    sidebarBg: 'bg-slate-900',
    sidebarBorder: 'border-slate-850 border-slate-800/80',
    sidebarHeading: 'text-slate-400 bg-slate-950/40 border-slate-850',
    nodeCardBg: 'bg-slate-950/40 hover:bg-slate-950/80 border-slate-800/90',
    nodeCardHover: 'hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5',
    canvasBg: 'bg-slate-950',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    accentText: 'text-blue-400',
    accentBtn: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 border border-blue-600',
    accentBorder: 'border-blue-500 focus:ring-blue-500',
    nodeHeaderBg: 'bg-slate-805/60 bg-slate-800/60',
    nodeBodyBg: 'bg-slate-900/95',
    nodeBorder: 'border-slate-800',
    inputBgSelect: 'bg-slate-950 border-slate-800 text-slate-200'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Purple',
    icon: '🔮',
    isLight: false,
    pageBg: 'bg-[rgb(9,6,17)] text-purple-100',
    headerBg: 'bg-[rgb(16,10,29)]/80 backdrop-blur-md',
    headerBorder: 'border-purple-950/85',
    sidebarBg: 'bg-[rgb(16,10,29)]',
    sidebarBorder: 'border-purple-950/80',
    sidebarHeading: 'text-purple-300 bg-purple-950/40 border-purple-900/60',
    nodeCardBg: 'bg-[rgb(9,6,17)] hover:bg-fuchsia-950/15 border-purple-900/60',
    nodeCardHover: 'hover:border-fuchsia-500/40 hover:shadow-lg hover:shadow-fuchsia-500/10',
    canvasBg: 'bg-[rgb(7,4,14)]',
    textPrimary: 'text-purple-50',
    textSecondary: 'text-purple-300',
    textMuted: 'text-purple-500',
    accentText: 'text-fuchsia-400',
    accentBtn: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-500/20 border border-fuchsia-600',
    accentBorder: 'border-fuchsia-500 focus:ring-fuchsia-500',
    nodeHeaderBg: 'bg-purple-950/40',
    nodeBodyBg: 'bg-[rgb(21,12,39)]/95',
    nodeBorder: 'border-purple-900',
    inputBgSelect: 'bg-slate-950 border-purple-900 text-purple-200'
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Light',
    icon: '☀️',
    isLight: true,
    pageBg: 'bg-[#f1f5f9] text-slate-900',
    headerBg: 'bg-white/90 backdrop-blur-md',
    headerBorder: 'border-slate-200',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-slate-200',
    sidebarHeading: 'text-slate-600 bg-slate-100 border-slate-200',
    nodeCardBg: 'bg-slate-50 hover:bg-slate-105/90 hover:bg-slate-100/90 border-slate-200',
    nodeCardHover: 'hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5',
    canvasBg: 'bg-slate-50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    accentText: 'text-indigo-600',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/15 border border-indigo-600',
    accentBorder: 'border-indigo-500 focus:ring-indigo-500',
    nodeHeaderBg: 'bg-slate-110 bg-slate-100',
    nodeBodyBg: 'bg-white',
    nodeBorder: 'border-slate-200 shadow-sm',
    inputBgSelect: 'bg-slate-100 border-slate-200 text-slate-800'
  },
  hacker: {
    id: 'hacker',
    name: 'Green Terminal',
    icon: '📟',
    isLight: false,
    pageBg: 'bg-[#030603] text-emerald-400 font-mono',
    headerBg: 'bg-[#060c06]/90 backdrop-blur-md',
    headerBorder: 'border-emerald-950',
    sidebarBg: 'bg-[#060c06]',
    sidebarBorder: 'border-emerald-950',
    sidebarHeading: 'text-emerald-500 bg-black border-emerald-950/60',
    nodeCardBg: 'bg-[#030603] hover:bg-emerald-950/20 border-emerald-950',
    nodeCardHover: 'hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10',
    canvasBg: 'bg-[#010401]',
    textPrimary: 'text-emerald-350',
    textSecondary: 'text-emerald-500/80',
    textMuted: 'text-emerald-900',
    accentText: 'text-emerald-400',
    accentBtn: 'bg-emerald-900/60 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/45 shadow-emerald-500/10',
    accentBorder: 'border-emerald-500 focus:ring-emerald-500',
    nodeHeaderBg: 'bg-emerald-950/40',
    nodeBodyBg: 'bg-[#030903]/95',
    nodeBorder: 'border-emerald-950',
    inputBgSelect: 'bg-black border-emerald-950 text-emerald-400'
  }
};

export default function App() {
  // Current challenge selection
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  
  // Current active level/stage (1-indexed)
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  
  // Placed nodes and links, mapped by stage id
  const [nodes, setNodes] = useState<Record<number, CanvasNode[]>>({});
  const [connections, setConnections] = useState<Record<number, CanvasConnection[]>>({});
  
  // Active selected component inspect target
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Completed challenges, for final comparison view triggering
  const [isFinalSummaryActive, setIsFinalSummaryActive] = useState<boolean>(false);

  // Network connection mode state
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<{ x: number; y: number } | null>(null);

  // Sidebar toggle controllers
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'palette' | 'inspector'>('palette');

  // Sync left sidebar open/tab state with node selection
  useEffect(() => {
    if (selectedNodeId) {
      setActiveSidebarTab('inspector');
      setIsLeftSidebarOpen(true);
    }
  }, [selectedNodeId]);

  // Sync cursor tracker with active connection mode
  useEffect(() => {
    if (!connectingFromNodeId) {
      setConnectingMousePos(null);
    }
  }, [connectingFromNodeId]);

  // Validation report slide state
  const [validationReport, setValidationReport] = useState<StageFeedback | null>(null);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  const [expandedConnectionId, setExpandedConnectionId] = useState<string | null>(null);
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);
  const [showChallengeIntroModal, setShowChallengeIntroModal] = useState<boolean>(false);
  const [theme, setTheme] = useState<'slate' | 'cyber' | 'nordic' | 'hacker'>(() => {
    return (localStorage.getItem('sys_design_theme') as any) || 'slate';
  });

  // HTML Element bounding box reference
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizingNode, setResizingNode] = useState<{ id: string; startWidth: number; startHeight: number; startX: number; startY: number } | null>(null);

  // Synchronize dynamic global mouse/touch triggers for seamless dragging/resizing
  useEffect(() => {
    if (!resizingNode && !draggedNode) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (resizingNode && canvasRef.current) {
        const deltaX = e.clientX - resizingNode.startX;
        const deltaY = e.clientY - resizingNode.startY;

        const nextWidth = Math.max(140, Math.min(resizingNode.startWidth + deltaX, 400));
        const nextHeight = Math.max(70, Math.min(resizingNode.startHeight + deltaY, 250));

        updateNodeDimensions(resizingNode.id, nextWidth, nextHeight);
      } else if (draggedNode && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const nextX = Math.round(mouseX - draggedNode.offsetX);
        const nextY = Math.round(mouseY - draggedNode.offsetY);

        updateNodeCoordinates(draggedNode.id, nextX, nextY);
      }
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];

      if (resizingNode && canvasRef.current) {
        const deltaX = touch.clientX - resizingNode.startX;
        const deltaY = touch.clientY - resizingNode.startY;

        const nextWidth = Math.max(140, Math.min(resizingNode.startWidth + deltaX, 400));
        const nextHeight = Math.max(70, Math.min(resizingNode.startHeight + deltaY, 250));

        updateNodeDimensions(resizingNode.id, nextWidth, nextHeight);
      } else if (draggedNode && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;

        const nextX = Math.round(touchX - draggedNode.offsetX);
        const nextY = Math.round(touchY - draggedNode.offsetY);

        updateNodeCoordinates(draggedNode.id, nextX, nextY);
      }
    };

    const handleWindowMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: true });
    window.addEventListener('touchend', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [resizingNode, draggedNode, currentStageId]);

  // Resolve current active challenge object
  const activeChallenge = useMemo(() => {
    return SYSTEM_CHALLENGES.find(c => c.id === selectedChallengeId) || null;
  }, [selectedChallengeId]);

  // Resolve current active stage details
  const activeStageDetails = useMemo(() => {
    if (!activeChallenge) return null;
    return activeChallenge.stages.find(s => s.id === currentStageId) || null;
  }, [activeChallenge, currentStageId]);

  // ----------------------------------------------------
  // LocalStorage Persistency & State synchronization
  // ----------------------------------------------------
  useEffect(() => {
    try {
      const persisted = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (persisted) {
        const decoded = JSON.parse(persisted) as ProjectState;
        if (decoded.currentChallengeId) {
          setSelectedChallengeId(decoded.currentChallengeId);
          setCurrentStageId(decoded.currentStageId || 1);
          setNodes(decoded.nodes || {});
          setConnections(decoded.connections || {});
        }
      }
    } catch (e) {
      console.warn('Unable to decode system design storage state', e);
    }
  }, []);

  const saveStateToStorage = (
    challengeId: string | null,
    stageId: number,
    nextNodes: Record<number, CanvasNode[]>,
    nextConns: Record<number, CanvasConnection[]>
  ) => {
    if (!challengeId) return;
    const model: ProjectState = {
      currentChallengeId: challengeId,
      currentStageId: stageId,
      completedStages: [],
      nodes: nextNodes,
      connections: nextConns,
      justifications: {},
      answers: {}
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(model));
  };

  // ----------------------------------------------------
  // Stage Anchors & State initialization
  // ----------------------------------------------------
  const handleSelectChallenge = (challengeId: string) => {
    const freshChallenge = SYSTEM_CHALLENGES.find(c => c.id === challengeId);
    if (!freshChallenge) return;

    setSelectedChallengeId(challengeId);
    setCurrentStageId(1);
    setIsFinalSummaryActive(false);
    setSelectedNodeId(null);
    setConnectingFromNodeId(null);
    setValidationReport(null);
    setShowValidationModal(false);
    setShowChallengeIntroModal(true); // Always launch onboarding/overview modal!

    // Bootstrap nodes and connections mapping
    const initialNodes: Record<number, CanvasNode[]> = {};
    const initialConns: Record<number, CanvasConnection[]> = {};

    freshChallenge.stages.forEach((stage) => {
      initialNodes[stage.id] = stage.anchors.map((anchor) => ({
        id: anchor.id,
        templateId: anchor.id,
        type: anchor.type,
        label: anchor.label,
        description: anchor.description,
        x: anchor.x || 100,
        y: anchor.y || 200,
        isAnchor: true,
        referenceJustification: anchor.referenceJustification,
        justificationText: '',
        answers: {}
      }));
      initialConns[stage.id] = [];
    });

    setNodes(initialNodes);
    setConnections(initialConns);
    saveStateToStorage(challengeId, 1, initialNodes, initialConns);
  };

  // Reset the active stage to native anchor bounds
  const handleResetStage = () => {
    if (!activeChallenge || !activeStageDetails) return;

    const confirmed = window.confirm('Scrub entire current stage blueprint state and restore anchors?');
    if (!confirmed) return;

    const freshStageNodes = activeStageDetails.anchors.map((anchor) => ({
      id: anchor.id,
      templateId: anchor.id,
      type: anchor.type,
      label: anchor.label,
      description: anchor.description,
      x: anchor.x || 100,
      y: anchor.y || 200,
      isAnchor: true,
      referenceJustification: anchor.referenceJustification,
      justificationText: '',
      answers: {}
    }));

    const nextNodes = { ...nodes, [currentStageId]: freshStageNodes };
    const nextConns = { ...connections, [currentStageId]: [] };

    setNodes(nextNodes);
    setConnections(nextConns);
    setSelectedNodeId(null);
    setConnectingFromNodeId(null);
    setValidationReport(null);
    saveStateToStorage(selectedChallengeId, currentStageId, nextNodes, nextConns);
  };

  const handleReturnHome = () => {
    const ok = window.confirm('Return to main selec portal? Your draft blueprints are preserved.');
    if (ok) {
      setSelectedChallengeId(null);
    }
  };

  // ----------------------------------------------------
  // Resize Handling for Canvas Nodes
  // ----------------------------------------------------
  const handleResizeMouseDown = (e: React.MouseEvent, nodeId: string, currentWidth: number, currentHeight: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasRef.current || isFinalSummaryActive) return;

    setResizingNode({
      id: nodeId,
      startWidth: currentWidth,
      startHeight: currentHeight,
      startX: e.clientX,
      startY: e.clientY
    });
  };

  const handleResizeTouchStart = (e: React.TouchEvent, nodeId: string, currentWidth: number, currentHeight: number) => {
    e.stopPropagation();
    if (!canvasRef.current || isFinalSummaryActive) return;
    const touch = e.touches[0];

    setResizingNode({
      id: nodeId,
      startWidth: currentWidth,
      startHeight: currentHeight,
      startX: touch.clientX,
      startY: touch.clientY
    });
  };

  // ----------------------------------------------------
  // Drag Handling for Canvas Nodes
  // ----------------------------------------------------
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string, currentX: number, currentY: number) => {
    e.preventDefault();
    if (!canvasRef.current || isFinalSummaryActive) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDraggedNode({
      id: nodeId,
      offsetX: mouseX - currentX,
      offsetY: mouseY - currentY
    });

    setSelectedNodeId(nodeId);
    
    // If in connecting mode and we click a target, establish connection
    if (connectingFromNodeId && connectingFromNodeId !== nodeId) {
      handleCompleteConnection(connectingFromNodeId, nodeId);
    }
  };

  const handleNodeTouchStart = (e: React.TouchEvent, nodeId: string, currentX: number, currentY: number) => {
    if (!canvasRef.current || isFinalSummaryActive) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    setDraggedNode({
      id: nodeId,
      offsetX: touchX - currentX,
      offsetY: touchY - currentY
    });

    setSelectedNodeId(nodeId);

    if (connectingFromNodeId && connectingFromNodeId !== nodeId) {
      handleCompleteConnection(connectingFromNodeId, nodeId);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (connectingFromNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (connectingFromNodeId && canvasRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  };

  const handleDragEnd = () => {
    setDraggedNode(null);
    setResizingNode(null);
  };

  const updateNodeCoordinates = (nodeId: string, x: number, y: number) => {
    setNodes((prevNodes) => {
      const currentNodes = prevNodes[currentStageId] || [];
      const targetNode = currentNodes.find(n => n.id === nodeId);
      if (!targetNode) return prevNodes;

      const nodeWidth = targetNode.width || 220;
      const nodeHeight = targetNode.height || 90;

      const clampedX = Math.max(10, Math.min(x, 900 - nodeWidth - 10));
      const clampedY = Math.max(10, Math.min(y, 550 - nodeHeight - 10));

      const nextStageNodes = currentNodes.map(n => n.id === nodeId ? { ...n, x: clampedX, y: clampedY } : n);
      const nextNodes = { ...prevNodes, [currentStageId]: nextStageNodes };
      // Save updated state to storage
      saveStateToStorage(selectedChallengeId, currentStageId, nextNodes, connections);
      return nextNodes;
    });
  };

  const updateNodeDimensions = (nodeId: string, width: number, height: number) => {
    setNodes((prevNodes) => {
      const currentNodes = prevNodes[currentStageId] || [];
      const nextStageNodes = currentNodes.map(n => n.id === nodeId ? { ...n, width, height } : n);
      const nextNodes = { ...prevNodes, [currentStageId]: nextStageNodes };
      // Save updated state to storage
      saveStateToStorage(selectedChallengeId, currentStageId, nextNodes, connections);
      return nextNodes;
    });
  };

  // ----------------------------------------------------
  // Adding, Deleting, Connecting Nodes
  // ----------------------------------------------------
  const handleAddNodeFromPalette = (template: ChallengeNode) => {
    if (!activeChallenge || !activeStageDetails) return;

    const currentNodes = nodes[currentStageId] || [];
    // Prevent duplicating identical blocks (except if they want dynamic multiples, but palette blocks are unique for v1)
    if (currentNodes.find(n => n.templateId === template.id)) {
      alert(`"${template.label}" is already placed. Position it on the grid!`);
      return;
    }

    // Place at slightly offset dynamic positions close to the center
    const x = 300 + Math.random() * 80;
    const y = 200 + Math.random() * 60;

    const newInstance: CanvasNode = {
      id: `${template.id}-${Date.now()}`,
      templateId: template.id,
      type: template.type,
      label: template.label,
      description: template.description,
      x,
      y,
      isAnchor: false,
      isTrap: template.isTrap,
      trapExplanation: template.trapExplanation,
      referenceJustification: template.referenceJustification,
      justificationText: '',
      answers: {}
    };

    const nextStageNodes = [...currentNodes, newInstance];
    const nextNodes = { ...nodes, [currentStageId]: nextStageNodes };

    setNodes(nextNodes);
    setSelectedNodeId(newInstance.id);
    saveStateToStorage(selectedChallengeId, currentStageId, nextNodes, connections);
  };

  const handleDeleteNodeInstance = (nodeId: string) => {
    const currentNodes = nodes[currentStageId] || [];
    const target = currentNodes.find(n => n.id === nodeId);
    if (!target || target.isAnchor) return; // anchors are locked

    const nextStageNodes = currentNodes.filter(n => n.id !== nodeId);
    const nextNodes = { ...nodes, [currentStageId]: nextStageNodes };

    // Remove any connected paths connected to this node
    const currentConns = connections[currentStageId] || [];
    const nextStageConns = currentConns.filter(c => c.from !== nodeId && c.to !== nodeId);
    const nextConns = { ...connections, [currentStageId]: nextStageConns };

    setNodes(nextNodes);
    setConnections(nextConns);
    setSelectedNodeId(null);
    if (connectingFromNodeId === nodeId) setConnectingFromNodeId(null);

    saveStateToStorage(selectedChallengeId, currentStageId, nextNodes, nextConns);
  };

  // Initiate connection pipeline
  const handleStartConnection = (nodeId: string) => {
    setConnectingFromNodeId(nodeId);
  };

  // Complete connection pipeline link
  const handleCompleteConnection = (fromId: string, toId: string) => {
    if (fromId === toId) {
      setConnectingFromNodeId(null);
      return;
    }

    const currentConns = connections[currentStageId] || [];
    
    // Check if link already exists
    const linkExists = currentConns.some(
      c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
    );

    if (linkExists) {
      alert('A network pipeline already connects these layers.');
      setConnectingFromNodeId(null);
      return;
    }

    const newConnection: CanvasConnection = {
      id: `${fromId}->${toId}`,
      from: fromId,
      to: toId
    };

    const nextStageConns = [...currentConns, newConnection];
    const nextConns = { ...connections, [currentStageId]: nextStageConns };

    setConnections(nextConns);
    setConnectingFromNodeId(null);
    setExpandedConnectionId(newConnection.id); // Auto-expand label choice modal immediately
    saveStateToStorage(selectedChallengeId, currentStageId, nodes, nextConns);
  };

  const handleDeleteConnection = (connId: string) => {
    const currentConns = connections[currentStageId] || [];
    const nextStageConns = currentConns.filter(c => c.id !== connId);
    const nextConns = { ...connections, [currentStageId]: nextStageConns };

    setConnections(nextConns);
    saveStateToStorage(selectedChallengeId, currentStageId, nodes, nextConns);
  };

  const handleUpdateConnectionLabel = (connectionId: string, label: string) => {
    const currentConns = connections[currentStageId] || [];
    const nextStageConns = currentConns.map(c => 
      c.id === connectionId ? { ...c, label } : c
    );
    const nextConns = { ...connections, [currentStageId]: nextStageConns };

    setConnections(nextConns);
    saveStateToStorage(selectedChallengeId, currentStageId, nodes, nextConns);
  };

  // ----------------------------------------------------
  // Justifications & Interactive Questions Handlers
  // ----------------------------------------------------
  const handleUpdateJustification = (nodeId: string, text: string) => {
    const currentNodes = nodes[currentStageId] || [];
    const nextStageNodes = currentNodes.map(n => n.id === nodeId ? { ...n, justificationText: text } : n);
    const nextNodes = { ...nodes, [currentStageId]: nextStageNodes };

    setNodes(nextNodes);
    saveStateToStorage(selectedChallengeId, currentStageId, nextNodes, connections);
  };

  const handleUpdateAnswer = (nodeId: string, question: string, answer: string) => {
    const currentNodes = nodes[currentStageId] || [];
    const nextStageNodes = currentNodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          answers: {
            ...n.answers,
            [question]: answer
          }
        };
      }
      return n;
    });
    const nextNodes = { ...nodes, [currentStageId]: nextStageNodes };

    setNodes(nextNodes);
    saveStateToStorage(selectedChallengeId, currentStageId, nextNodes, connections);
  };

  // ----------------------------------------------------
  // Stage Validation Engine
  // ----------------------------------------------------
  const handleAuditStage = () => {
    if (!activeChallenge || !activeStageDetails) return;

    const placedNodes = nodes[currentStageId] || [];
    const placedConns = connections[currentStageId] || [];

    // 1. Identify missing nodes
    const missing: string[] = [];
    activeStageDetails.requiredNodes.forEach((reqId) => {
      const hasNode = placedNodes.some(n => n.templateId === reqId);
      if (!hasNode) missing.push(reqId);
    });

    // 2. Identify correctly placed/matched nodes
    const matched: string[] = [];
    placedNodes.forEach((n) => {
      if (activeStageDetails.requiredNodes.includes(n.templateId) || n.isAnchor) {
        matched.push(n.templateId);
      }
    });

    // 3. Identify traps placed
    const traps: string[] = [];
    placedNodes.forEach((n) => {
      if (n.isTrap) traps.push(n.templateId);
    });

    // 4. Identify extra components
    const extras: string[] = [];
    placedNodes.forEach((n) => {
      if (!activeStageDetails.requiredNodes.includes(n.templateId) && !n.isAnchor && !n.isTrap) {
        extras.push(n.label);
      }
    });

    // 5. Evaluate Required Connections
    // A connection requirement matches if ANY link goes between nodes whose templateIds match req.from and req.to
    const matchedConnections: string[] = [];
    const missingConnections: string[] = [];

    activeStageDetails.requiredConnections.forEach((req) => {
      const correctLabel = req.label || `${req.from} ➔ ${req.to}`;

      // Find matches in the current connections lines
      const isConnected = placedConns.some((conn) => {
        const fromNode = placedNodes.find(n => n.id === conn.from);
        const toNode = placedNodes.find(n => n.id === conn.to);
        if (!fromNode || !toNode) return false;

        const labelMatches = conn.label === correctLabel;

        const typesMatch = (
          (fromNode.templateId === req.from && toNode.templateId === req.to) ||
          (fromNode.templateId === req.to && toNode.templateId === req.from) // Direction-agile matching
        );

        return typesMatch && labelMatches;
      });

      if (isConnected) {
        matchedConnections.push(correctLabel);
      } else {
        missingConnections.push(correctLabel);
      }
    });

    const report: StageFeedback = {
      matched: [...new Set(matched)],
      missing,
      traps,
      extras,
      connectionsResult: {
        matched: matchedConnections,
        missing: missingConnections
      }
    };

    setValidationReport(report);
    setShowValidationModal(true);
  };

  const handleConfirmNextStage = () => {
    if (!activeChallenge) return;

    setShowValidationModal(false);
    const stagesCount = activeChallenge.stages.length;

    if (currentStageId < stagesCount) {
      const nextStage = currentStageId + 1;
      setCurrentStageId(nextStage);
      setSelectedNodeId(null);
      setConnectingFromNodeId(null);
      setValidationReport(null);
      saveStateToStorage(selectedChallengeId, nextStage, nodes, connections);
    } else {
      // All levels successfully accomplished!
      setIsFinalSummaryActive(true);
    }
  };

  const handleBypassStage = () => {
    setShowReferenceModal(true);
    handleConfirmNextStage();
  };

  // Reset current selections
  const handleRestartChallenge = () => {
    if (!selectedChallengeId) return;
    handleSelectChallenge(selectedChallengeId);
  };

  // Resolve current stage nodes & connections for render
  const activeStageNodes = nodes[currentStageId] || [];
  const activeStageConnections = connections[currentStageId] || [];
  const currentlySelectedNode = activeStageNodes.find(n => n.id === selectedNodeId) || null;

  // ----------------------------------------------------
  // Main Render Logic
  // ----------------------------------------------------
  if (!selectedChallengeId || !activeChallenge) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <ChallengeSelector 
          challenges={SYSTEM_CHALLENGES} 
          onSelectChallenge={handleSelectChallenge} 
        />
      </div>
    );
  }

  if (isFinalSummaryActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
        {/* Navigation Bar */}
        <div className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-display font-bold text-slate-100 flex items-center gap-1.5 text-sm">
              <Tv size={16} className="text-blue-500" />
              SYSTEM DESIGN PRACTITIONER STUDIO
            </span>
            <button
              onClick={handleReturnHome}
              className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 bg-slate-900 border border-slate-800 rounded-md transition-colors"
            >
              Select Portal ✕
            </button>
          </div>
        </div>

        <FinalComparison
          challenge={activeChallenge}
          stagesNodes={nodes}
          onHome={() => setSelectedChallengeId(null)}
          onRestart={handleRestartChallenge}
        />
      </div>
    );
  }

  const isLastLevel = currentStageId === activeChallenge.stages.length;
  const currentTheme = SYSTEM_THEMES[theme] || SYSTEM_THEMES.slate;

  return (
    <div className={`min-h-screen ${currentTheme.pageBg} flex flex-col justify-between overflow-x-hidden transition-all duration-300`}>
      
      {/* 1. Header Bar Area */}
      <header className={`border-b ${currentTheme.headerBorder} ${currentTheme.headerBg} h-14 flex items-center justify-between px-6 shrink-0 relative z-30 transition-colors`}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleReturnHome}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-950/40 py-1.5 px-2.5 rounded border border-slate-800"
          >
            ← Home
          </button>
          <div>
            <span className="text-[10px] font-mono text-blue-500 uppercase font-bold tracking-widest block">
              Active Challenge
            </span>
            <span className={`text-xs font-display font-bold ${currentTheme.isLight ? 'text-slate-900' : 'text-slate-100'} block`}>
              {activeChallenge.title.split('(')[0].trim()}
            </span>
          </div>
        </div>

        {/* Level Progression Indicator dots */}
        <div className="hidden md:flex items-center gap-1">
          {activeChallenge.stages.map((st) => (
            <div key={st.id} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border transition-all ${
                  st.id === currentStageId
                    ? 'bg-blue-600 text-white border-blue-500 font-bold scale-110 shadow-lg shadow-blue-500/20'
                    : st.id < currentStageId
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {st.id}
              </div>
              {st.id < activeChallenge.stages.length && (
                <div className={`w-12 h-[1px] ${st.id < currentStageId ? 'bg-emerald-900' : 'bg-slate-900'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher Selector dropdown */}
          <div className="flex items-center gap-1 px-2 py-1 relative rounded border border-slate-800 bg-slate-950/40 text-xs font-mono">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider mr-1 font-bold select-none">Theme</span>
            <select
              value={theme}
              onChange={(e) => {
                const choice = e.target.value as any;
                setTheme(choice);
                localStorage.setItem('sys_design_theme', choice);
              }}
              className="bg-transparent text-slate-300 font-bold hover:text-white cursor-pointer focus:outline-none focus:ring-0 text-xs py-0.5 border-none"
            >
              {Object.values(SYSTEM_THEMES).map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200 text-xs">
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowChallengeIntroModal(true)}
            className="text-xs font-mono text-slate-300 hover:text-blue-400 p-1.5 hover:bg-blue-500/10 rounded transition-all flex items-center gap-1.5 border border-slate-800 cursor-pointer"
            title="Read complete platform details and stage-by-stage requirements"
          >
            <HelpCircle size={13} className="text-blue-400" />
            Platform Mission Overview
          </button>
          <button
            onClick={() => setShowReferenceModal(true)}
            className="text-xs font-mono text-slate-300 hover:text-amber-400 p-1.5 hover:bg-amber-500/10 rounded transition-all flex items-center gap-1.5 border border-slate-800 cursor-pointer"
            title="View target blueprint diagram reference"
          >
            <BookOpen size={13} />
            Show Reference Blueprint
          </button>
          <button
            onClick={handleResetStage}
            className="text-xs font-mono text-slate-405 hover:text-rose-400 text-slate-400 p-1.5 hover:bg-rose-500/10 rounded transition-all flex items-center gap-1 border border-slate-800"
          >
            <RotateCcw size={12} />
            Reset Stage
          </button>
          <button
            onClick={handleAuditStage}
            className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono rounded font-medium flex items-center gap-1.5 transition-all shadow-lg hover:shadow-blue-500/15 cursor-pointer"
          >
            <CheckCircle2 size={13} />
            Validate Blueprint
          </button>
        </div>
      </header>

      {/* 2. Challenge Stage Objective Box */}
      <div className="bg-slate-900/40 border-b border-slate-900 py-3.5 px-6 shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1 font-bold">
              <Layers size={12} />
               {activeStageDetails?.title}
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 max-w-4xl">
              <span className="font-semibold text-slate-200">Stage Objective:</span> {activeStageDetails?.objective}
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-bold text-slate-500 shrink-0">
            {currentStageId} / {activeChallenge.stages.length} COMPLETE
          </span>
        </div>
      </div>

      {/* 3. Main Workspace Grid Body */}
      <main className="grow flex flex-col lg:flex-row items-stretch min-h-0 bg-slate-950 overflow-hidden relative z-10">
        
        {/* LEFT COLUMN: Unified Switchable Side Panel */}
        <aside className={`w-full shrink-0 border-slate-900 bg-slate-900/60 flex flex-col justify-start overflow-y-auto transition-all duration-300 relative ${
          isLeftSidebarOpen 
            ? 'lg:w-[340px] border-r p-4 space-y-4 opacity-100 shadow-2xl' 
            : 'w-0 lg:w-0 border-r-0 p-0 opacity-0 overflow-hidden pointer-events-none'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              Arch Control Deck
            </span>
            <button
              onClick={() => setIsLeftSidebarOpen(false)}
              className="p-1 px-2 bg-slate-950 border border-slate-850 hover:border-blue-500/50 text-slate-400 hover:text-white rounded transition-all text-[10px] flex items-center gap-1 font-mono cursor-pointer"
              title="Hide Control Deck to save space"
            >
              Close <ChevronLeft size={12} />
            </button>
          </div>

          {/* Navigator Tabs Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850">
            <button
              onClick={() => setActiveSidebarTab('palette')}
              className={`py-1.5 px-2 text-xs font-semibold font-mono rounded transition-all cursor-pointer ${
                activeSidebarTab === 'palette'
                  ? 'bg-slate-900 text-blue-400 border border-slate-800 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧱 Parts Palette
            </button>
            <button
              onClick={() => setActiveSidebarTab('inspector')}
              className={`py-1.5 px-2 text-xs font-semibold font-mono rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'inspector'
                  ? 'bg-slate-900 text-emerald-400 border border-slate-800 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔎 Inspector
              {selectedNodeId && (
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </button>
          </div>

          {/* Tab Content 1: Palette */}
          {activeSidebarTab === 'palette' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-lg text-left">
                <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Architectural Parts Builder
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Click any software building block below to instantiate it onto the active canvas. Double connections mean tight data linking!
                </p>
              </div>

              <div className="space-y-2.5">
                {activeStageDetails?.palette.map((item) => {
                  const Icon = getNodeIcon(item.type);
                  const config = getNodeColorConfig(item.type);
                  const isAlreadyPlaced = activeStageNodes.some(n => n.templateId === item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => !isAlreadyPlaced && handleAddNodeFromPalette(item)}
                      className={`group relative p-3 border rounded-xl transition-all cursor-pointer select-none text-left flex gap-3 ${
                        isAlreadyPlaced
                          ? 'bg-slate-900/10 border-slate-900 opacity-40 cursor-not-allowed'
                          : 'bg-slate-900 border-slate-800 hover:border-blue-500/40 hover:bg-slate-950/20 hover:translate-x-0.5'
                      }`}
                      title={isAlreadyPlaced ? "Already active on grid" : "Click to place on canvas"}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${config.badgeBg} flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </h4>
                        <p className="text-[10px] text-slate-450 text-slate-400 mt-0.5 line-clamp-2 leading-relaxed font-sans">
                          {item.description}
                        </p>
                      </div>
                      
                      {!isAlreadyPlaced && (
                        <Plus 
                          size={14} 
                          className="absolute right-2.5 top-2.5 text-slate-600 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content 2: Inspector / Properties */}
          {activeSidebarTab === 'inspector' && (
            <div className="space-y-4 animate-fade-in">
              {currentlySelectedNode && (
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  ← Release Selection / Back to Palette
                </button>
              )}

              <NodeEditorPanel
                node={currentlySelectedNode}
                onUpdateJustification={handleUpdateJustification}
                onUpdateAnswer={handleUpdateAnswer}
                onStartConnection={handleStartConnection}
                onDeleteNode={(nodeId) => {
                  handleDeleteNodeInstance(nodeId);
                  setSelectedNodeId(null);
                }}
                isConnectingMode={connectingFromNodeId !== null}
                connectingFromNodeId={connectingFromNodeId}
                onUpdateDimensions={updateNodeDimensions}
                connections={activeStageConnections}
                requiredConnections={activeStageDetails?.requiredConnections || []}
                onUpdateConnectionLabel={handleUpdateConnectionLabel}
                allNodesOnCanvas={activeStageNodes}
              />

              {/* Hint Ladder per stage - visible if not active on card to assist */}
              {!currentlySelectedNode && activeStageDetails && (
                <div className="pt-2 border-t border-slate-850/60">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 font-bold">
                    💡 Blueprint Design Advice
                  </span>
                  <HintLadder hints={activeStageDetails.hints} />
                </div>
              )}
            </div>
          )}
        </aside>

        {/* MIDDLE COLUMN: Scalable interactive blueprint canvas */}
        <div className="grow bg-slate-950 flex flex-col justify-between items-center relative min-h-[400px]">
          
          {/* Floating trigger to re-open Unified Sidebar */}
          {!isLeftSidebarOpen && (
            <button
              onClick={() => setIsLeftSidebarOpen(true)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-35 bg-slate-900 hover:bg-slate-800 border-y border-r border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white px-3 py-7 rounded-r-xl shadow-2xl flex flex-col items-center gap-2.5 text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer group"
              title="Expand Side Control Deck"
            >
              <ChevronRight size={14} className="text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              <span className="[writing-mode:vertical-lr] font-bold tracking-widest select-none">Open Controls</span>
            </button>
          )}

          {/* Active connect indicator banner overlay */}
          {connectingFromNodeId && (
            <div className="absolute top-4 left-4 right-4 z-20 bg-blue-600/90 text-white font-mono text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-xl backdrop-blur-sm animate-pulse">
              <span className="flex items-center gap-2">
                🔌 NETWORK LINK MODE: Select target block's "Finish Link" or body to complete connection...
              </span>
              <button
                onClick={() => setConnectingFromNodeId(null)}
                className="text-white hover:text-slate-100 px-2 py-0.5 bg-blue-700/80 rounded hover:bg-blue-800 font-bold transition-all"
              >
                Cancel ✕
              </button>
            </div>
          )}

          {/* Scrolling container box representing architecture workspace */}
          <div className="w-full flex justify-center items-center p-4 grow overflow-auto">
            <div
              id="canvas-board"
              ref={canvasRef}
              onMouseMove={handleCanvasMouseMove}
              onTouchMove={handleCanvasTouchMove}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
              className={`w-[900px] h-[550px] relative rounded-xl border ${currentTheme.isLight ? 'border-slate-205 border-slate-200' : 'border-slate-900'} blueprint-grid overflow-hidden shadow-inner cursor-default shrink-0`}
              style={{
                backgroundColor: currentTheme.isLight ? '#f8fafc' : currentTheme.id === 'cyber' ? '#07040e' : currentTheme.id === 'hacker' ? '#010401' : '#0b0f19',
                backgroundImage: `radial-gradient(${currentTheme.isLight ? 'rgba(71, 85, 105, 0.08)' : currentTheme.id === 'cyber' ? 'rgba(168, 85, 247, 0.12)' : currentTheme.id === 'hacker' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(148, 163, 184, 0.08)'} 1.2px, transparent 1.2px), linear-gradient(${currentTheme.isLight ? 'rgba(71, 85, 105, 0.015)' : 'rgba(148, 163, 184, 0.015)'} 1px, transparent 1px), linear-gradient(90deg, ${currentTheme.isLight ? 'rgba(71, 85, 105, 0.015)' : 'rgba(148, 163, 184, 0.015)'} 1px, transparent 1px)`,
                backgroundSize: '20px 20px, 80px 80px, 80px 80px'
              }}
              onClick={() => {
                // Cancel active connecting mode if clicks blank canvas
                setSelectedNodeId(null);
                setConnectingFromNodeId(null);
              }}
            >
              <div className="absolute top-3 left-4 font-mono text-[9px] text-slate-500/40 tracking-wider pointer-events-none select-none uppercase">
                SYSTEM CANVAS GRID COORDINATES: 900 x 550 // ZOOM: STATIC 100%
              </div>

              {/* A. SVG Connections Vector Lines */}
              <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 10 }}>
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#4B80CA" />
                  </marker>
                </defs>
                
                {/* Visual Draft Connection Line (glowing dashed path tracking cursor) */}
                {(() => {
                  if (!connectingFromNodeId) return null;
                  const startNode = activeStageNodes.find(n => n.id === connectingFromNodeId);
                  if (!startNode) return null;

                  const startWidth = startNode.width || 220;
                  const startHeight = startNode.height || 90;
                  const fromX = startNode.x + startWidth / 2;
                  const fromY = startNode.y + startHeight / 2;
                  
                  // Use connectingMousePos, but fallback to startNode position if mouse has not moved inside canvas yet
                  const toX = connectingMousePos?.x ?? fromX;
                  const toY = connectingMousePos?.y ?? fromY;

                  return (
                    <g>
                      <line
                        x1={fromX}
                        y1={fromY}
                        x2={toX}
                        y2={toY}
                        stroke="#4b80ca"
                        strokeWidth="2"
                        strokeDasharray="6,4"
                        markerEnd="url(#arrow)"
                        className="opacity-80 animate-pulse flow-dot"
                      />
                      <circle
                        cx={toX}
                        cy={toY}
                        r="4"
                        fill="#60a5fa"
                        className="animate-ping"
                      />
                    </g>
                  );
                })()}

                {activeStageConnections.map((conn) => {
                  const fromNode = activeStageNodes.find(n => n.id === conn.from);
                  const toNode = activeStageNodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const fromWidth = fromNode.width || 220;
                  const fromHeight = fromNode.height || 90;
                  const toWidth = toNode.width || 220;
                  const toHeight = toNode.height || 90;

                  const pFrom = { x: fromNode.x + fromWidth / 2, y: fromNode.y + fromHeight / 2 };
                  const pTo = { x: toNode.x + toWidth / 2, y: toNode.y + toHeight / 2 };

                  const dx = pTo.x - pFrom.x;
                  const dy = pTo.y - pFrom.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);

                  if (dist < 30) return null;

                  const startOffset = getBoxOffset(dx, dy, fromWidth, fromHeight);
                  const endOffset = getBoxOffset(dx, dy, toWidth, toHeight) + 12;

                  const startX = pFrom.x + (dx * startOffset) / dist;
                  const startY = pFrom.y + (dy * startOffset) / dist;

                  const endX = pFrom.x + (dx * (dist - endOffset)) / dist;
                  const endY = pFrom.y + (dy * (dist - endOffset)) / dist;

                  return (
                    <g key={conn.id} className="pointer-events-auto">
                      {/* Interactive thicker background line for easy delete */}
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="transparent"
                        strokeWidth="12"
                        className="cursor-pointer"
                        title="Connection path"
                      />
                      {/* Visual aesthetic softer matte blue tracer path */}
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#4b80ca"
                        strokeWidth="2.5"
                        markerEnd="url(#arrow)"
                        className="flow-dot opacity-80"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* B. Floating HTML Overlay labels & delete buttons at line midpoints */}
              {activeStageConnections.map((conn) => {
                const fromNode = activeStageNodes.find(n => n.id === conn.from);
                const toNode = activeStageNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const fromWidth = fromNode.width || 220;
                const fromHeight = fromNode.height || 90;
                const toWidth = toNode.width || 220;
                const toHeight = toNode.height || 90;

                const midX = ((fromNode.x + fromWidth / 2) + (toNode.x + toWidth / 2)) / 2;
                const midY = ((fromNode.y + fromHeight / 2) + (toNode.y + toHeight / 2)) / 2;

                const isExpanded = expandedConnectionId === conn.id;

                if (!isExpanded) {
                  // Collapsed Badge Overlay
                  return (
                    <button
                      key={`overlay-${conn.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedConnectionId(conn.id);
                      }}
                      style={{
                        position: 'absolute',
                        left: `${midX}px`,
                        top: `${midY}px`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 25
                      }}
                      className="px-2.5 py-1 rounded-full border border-blue-500/40 bg-slate-950 hover:bg-slate-900 text-[10px] font-mono text-blue-300 font-bold tracking-tight shadow-md select-none max-w-[190px] truncate cursor-pointer hover:border-blue-400 hover:text-white transition-all flex items-center gap-1 hover:scale-105 pointer-events-auto"
                      title="Click to select or modify pipeline route label"
                    >
                      {conn.label ? (
                        <span>{conn.label}</span>
                      ) : (
                        <span className="text-amber-400 italic">⚠️ Unlabeled Route</span>
                      )}
                      <span className="opacity-60 text-[8px] font-sans text-blue-400">✏️</span>
                    </button>
                  );
                }

                return (
                  <div
                    key={`overlay-${conn.id}`}
                    style={{
                      position: 'absolute',
                      left: `${midX}px`,
                      top: `${midY}px`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 35
                    }}
                    className="flex flex-col items-center gap-1.5 p-2.5 bg-slate-900 border border-blue-500 shadow-2xl rounded-lg pointer-events-auto min-w-[210px] animate-fade-in"
                  >
                    {/* Select dropdown preloaded with exact expected values */}
                    <div className="w-full space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                          Route Options:
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedConnectionId(null);
                          }}
                          className="text-[8px] font-mono font-bold text-slate-400 hover:text-white bg-slate-950 px-1 border border-slate-800 rounded"
                          title="Minimize label panel"
                        >
                          Collapse ▢
                        </button>
                      </div>
                      <select
                        value={conn.label || ''}
                        onChange={(e) => {
                          handleUpdateConnectionLabel(conn.id, e.target.value);
                          setExpandedConnectionId(null); // Auto-collapse immediately upon selecting option!
                        }}
                        className="text-[10px] bg-slate-950 border border-slate-800 hover:border-slate-705 rounded p-1 text-slate-200 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-sans font-medium"
                      >
                        <option value="">-- Click to choose route --</option>
                        {(() => {
                          const allReqs = activeStageDetails?.requiredConnections || [];
                          // Find requirements that match these connected templates (direction-agile)
                          const matches = allReqs.filter(req => 
                            (fromNode.templateId === req.from && toNode.templateId === req.to) ||
                            (fromNode.templateId === req.to && toNode.templateId === req.from)
                          );

                          return (
                            <>
                              {matches.length > 0 && (
                                <optgroup label="✨ RECOMMENDED ROUTE FOR THIS PAIR">
                                  {matches.map((req, idx) => {
                                    const labelVal = req.label || `${req.from} ➔ ${req.to}`;
                                    return <option key={`m-${idx}`} value={labelVal}>{labelVal}</option>;
                                  })}
                                </optgroup>
                              )}
                              <optgroup label="🌐 COMMON NETWORK PROTOCOLS">
                                {[
                                  "gRPC Remote Procedure Call",
                                  "HTTP REST API Query / Command",
                                  "HTTPS Secure File Upload Stream",
                                  "WebSocket Bidirectional Sync",
                                  "TCP Stateful Duplex Stream",
                                  "Kafka Message Events Topic",
                                  "Redis Cache GET / SET Key"
                                ].map((proto, idx) => (
                                  <option key={`proto-${idx}`} value={proto}>{proto}</option>
                                ))}
                              </optgroup>
                            </>
                          );
                        })()}
                      </select>
                    </div>

                    {/* Direct Text Input for editing or custom typing */}
                    <div className="w-full flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Or customize text label..."
                        value={conn.label || ''}
                        onChange={(e) => {
                          handleUpdateConnectionLabel(conn.id, e.target.value);
                        }}
                        className="text-[9.5px] bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-slate-100 placeholder-slate-600 rounded px-1.5 py-1 flex-1 focus:outline-none focus:border-blue-500/60 font-sans"
                        title="Edit route label"
                      />
                    </div>

                    {/* Bottom Action buttons and link tracing identification */}
                    <div className="flex items-center justify-between w-full mt-0.5 pt-1.5 border-t border-slate-800/60 text-[8px] font-mono leading-tight">
                      <span className="text-slate-500 max-w-[130px] truncate" title={`${fromNode.label} ➔ ${toNode.label}`}>
                        {fromNode.label.split('(')[0]} ➔ {toNode.label.split('(')[0]}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConnection(conn.id);
                        }}
                        className="px-1.5 py-0.5 bg-rose-950/20 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 border border-slate-850 hover:border-rose-900 rounded transition-colors cursor-pointer font-bold"
                        title="Delete this connection on canvas"
                      >
                        Delete ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* C. Drag & Drop HTML Nodes */}
              {activeStageNodes.map((item) => {
                const colors = getNodeColorConfig(item.type);
                const Icon = getNodeIcon(item.type);
                const isSelected = item.id === selectedNodeId;

                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, item.id, item.x, item.y)}
                    onTouchStart={(e) => handleNodeTouchStart(e, item.id, item.x, item.y)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(item.id);
                    }}
                    className={`absolute p-3 border rounded-xl flex flex-col justify-between transition-shadow select-none ${
                      colors.bgColor
                    } ${
                      isSelected
                        ? `ring-2 ring-blue-500/80 shadow-xl shadow-blue-500/10 ${colors.borderColor}`
                        : `border-slate-800/80 ${colors.borderColor}/30`
                    } ${
                      item.isAnchor 
                        ? 'border-indigo-500/40' 
                        : 'shadow-lg'
                    }`}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${item.width || 220}px`,
                      height: `${item.height || 90}px`,
                      zIndex: isSelected ? 21 : 15,
                      cursor: 'grab'
                    }}
                  >
                    {/* Floating top-left Remove workflow helper button */}
                    {!item.isAnchor && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNodeInstance(item.id);
                          if (selectedNodeId === item.id) {
                            setSelectedNodeId(null);
                          }
                        }}
                        className={`absolute -top-2.5 -left-2 p-1 px-2 rounded-full border border-slate-800 bg-slate-900 hover:bg-rose-950/40 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-[9px] font-bold font-mono tracking-wide shadow-md flex items-center gap-1 transition-all group/btn cursor-pointer ${isFinalSummaryActive ? 'pointer-events-none' : ''}`}
                        title="Remove component from canvas"
                      >
                        ✕ Remove
                      </button>
                    )}

                    {/* Floating top-right Link workflow helper button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (connectingFromNodeId) {
                          if (connectingFromNodeId !== item.id) {
                            handleCompleteConnection(connectingFromNodeId, item.id);
                          }
                        } else {
                          handleStartConnection(item.id);
                        }
                      }}
                      className={`absolute -top-2.5 -right-2 p-1 px-2 rounded-full border text-[9px] font-bold font-mono tracking-wide shadow-md flex items-center gap-1 transition-all group/btn cursor-pointer ${
                        connectingFromNodeId === item.id
                          ? 'bg-amber-600 border-amber-500 text-white animate-pulse'
                          : (connectingFromNodeId && connectingFromNodeId !== item.id)
                            ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 animate-bounce'
                            : 'bg-slate-900 border-slate-755 border-slate-800 text-slate-350 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-850'
                      } ${isFinalSummaryActive ? 'pointer-events-none' : ''}`}
                      title={
                        connectingFromNodeId === item.id
                          ? "Connecting path drafting from here"
                          : (connectingFromNodeId && connectingFromNodeId !== item.id)
                            ? "Complete network pipeline routing to here"
                            : "Click to start pipeline linkage"
                      }
                    >
                      {connectingFromNodeId === item.id ? (
                        <span>Draft...</span>
                      ) : (connectingFromNodeId && connectingFromNodeId !== item.id) ? (
                        <span className="flex items-center gap-1">🔌 Connect</span>
                      ) : (
                        <>
                          <Link size={10} className="text-blue-400 group-hover/btn:text-white" />
                          <span>Link</span>
                        </>
                      )}
                    </button>

                    {/* Inner Content Grid */}
                    <div className="flex items-start gap-2 h-full overflow-hidden">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${colors.badgeBg} border ${colors.borderColor}/40 flex items-center justify-center`}>
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 pr-1 flex flex-col justify-between h-full w-full">
                        <div className="space-y-0.5">
                          {/* Rich visible label without aggressive truncations */}
                          <div className="text-[11px] font-bold text-white leading-normal block whitespace-normal break-words line-clamp-2">
                            {item.label}
                          </div>
                          <span className={`inline-block text-[8px] px-1 py-0.5 rounded uppercase font-mono font-bold tracking-widest border ${colors.borderColor}/30 ${colors.badgeBg}`}>
                            {item.type}
                          </span>
                        </div>
                        
                        {item.isAnchor && (
                          <span className="text-[8px] font-sans text-indigo-400 font-semibold uppercase tracking-wider block">
                            ⚡ Anchored Layer
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive drag-resize handle */}
                    <div
                      onMouseDown={(e) => handleResizeMouseDown(e, item.id, item.width || 220, item.height || 90)}
                      onTouchStart={(e) => handleResizeTouchStart(e, item.id, item.width || 220, item.height || 90)}
                      className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1 select-none z-30 group"
                      title="Drag to resize component box"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        className="text-slate-500 group-hover:text-amber-400 transition-colors pointer-events-none"
                      >
                        <path
                          d="M10,0 L0,10 M10,4 L4,10 M10,7 L7,10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Touch instructions and reset info */}
          <div className="py-2.5 px-6 w-full text-center text-[11px] font-mono text-slate-500 border-t border-slate-900 bg-slate-900/15 shrink-0 select-none">
            CONTROLS: Click "Link" button on block to route connection // Drag blocks freely // Right-click empty grid to close selection
          </div>
        </div>

      </main>

      {/* 4. Unified Dialog Validator Slide overlay modals */}
      {showValidationModal && (
        <ValidationReport
          feedback={validationReport}
          palette={activeStageDetails?.palette || []}
          onConfirmNext={handleConfirmNextStage}
          onClose={() => setShowValidationModal(false)}
          isLastStage={isLastLevel}
          onBypassStage={handleBypassStage}
        />
      )}

      {showReferenceModal && activeStageDetails && (
        <ReferenceDiagram
          anchors={activeStageDetails.anchors}
          requiredNodes={activeStageDetails.requiredNodes}
          palette={activeStageDetails.palette}
          requiredConnections={activeStageDetails.requiredConnections}
          onClose={() => setShowReferenceModal(false)}
        />
      )}

      {showChallengeIntroModal && activeChallenge && (
        <ChallengeIntroModal
          challenge={activeChallenge}
          onClose={() => setShowChallengeIntroModal(false)}
        />
      )}
    </div>
  );
}

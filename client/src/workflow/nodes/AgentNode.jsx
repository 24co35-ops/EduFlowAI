import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlignLeft, 
  Lightbulb, 
  Calendar, 
  Search, 
  Video, 
  FileCode, 
  Globe, 
  HelpCircle,
  Cpu,
  Copy,
  Check,
  ShieldCheck,
  BarChart2,
  ExternalLink,
  Tag
} from 'lucide-react';
import { AGENT_REGISTRY } from '../engine/agentDefinitions';

const ICON_MAP = {
  FileText,
  CheckCircle,
  Sparkles,
  AlignLeft,
  Lightbulb,
  Calendar,
  Search,
  Video,
  FileCode,
  Globe,
  HelpCircle
};

export const AgentNode = memo(({ id, data, selected }) => {
  const agentDef = AGENT_REGISTRY[data?.agentId] || AGENT_REGISTRY['summarizer'];
  const IconComponent = ICON_MAP[agentDef.icon] || Sparkles;

  const status = data?.status || 'idle';
  const executionTimeMs = data?.executionTimeMs || 84;
  const selectedModel = data?.selectedModel || agentDef.defaultModel;
  const temperature = data?.temperature ?? agentDef.defaultTemperature;
  const previewOutput = data?.previewOutput || agentDef.defaultPreview;

  const [copied, setCopied] = React.useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded-full border border-cyan-500/50 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <Clock className="w-2.5 h-2.5 animate-spin text-cyan-400" /> Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> {executionTimeMs}ms
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-300 bg-rose-950/90 px-2 py-0.5 rounded-full border border-rose-500/50">
            <AlertCircle className="w-2.5 h-2.5 text-rose-400" /> Error
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
            Ready
          </span>
        );
    }
  };

  const copyToClipboard = (e) => {
    e.stopPropagation();
    if (previewOutput) {
      navigator.clipboard.writeText(previewOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Render specialized high-impact UI body per agent type
  const renderAgentBody = () => {
    switch (agentDef.agentId) {
      case 'youtube-analyzer':
        return (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 group/video aspect-[16/8] flex flex-col justify-end p-2.5">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
              <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-red-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>1h 42m</span>
              </div>
              <div className="z-20 flex items-center justify-between text-[11px] text-slate-200">
                <span className="font-semibold truncate">MIT 6.006: Algorithmic Complexity</span>
                <Play className="w-3.5 h-3.5 text-red-400 fill-current" />
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 z-20 overflow-hidden">
                <div className="bg-red-500 h-full w-2/3 rounded-full" />
              </div>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2 px-0.5">
              {previewOutput}
            </p>
          </div>
        );

      case 'quiz-generator':
        return (
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200">
              <p className="font-semibold text-white mb-1.5">Q: What is the average time complexity of Quicksort?</p>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">A) O(n²)</div>
                <div className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between">
                  <span>B) O(n log n)</span>
                  <Check className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Deterministic scoring lock enabled</span>
            </div>
          </div>
        );

      case 'concept-extractor':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {['#MasterTheorem', '#Divide&Conquer', '#RecursionTree', '#Big-O'].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25"
                >
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2">
              {previewOutput}
            </p>
          </div>
        );

      case 'essay-grader':
        return (
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-300">Thesis & Argument:</span>
                <span className="font-bold text-rose-300 font-mono">28/30 (93%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[93%]" />
              </div>
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-slate-300">Evidence & Citations:</span>
                <span className="font-bold text-rose-300 font-mono">27/30 (90%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[90%]" />
              </div>
            </div>
          </div>
        );

      case 'fact-checker':
        return (
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-[10px] leading-tight">
                <p className="font-bold text-white">100% Curriculum Grounded</p>
                <p className="text-emerald-300/80 mt-0.5">3/3 claims verified with zero hallucination</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2">
              {previewOutput}
            </p>
          </div>
        );

      default:
        return (
          <div className="text-[11px] leading-relaxed text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/70 font-sans min-h-[58px] max-h-32 overflow-y-auto custom-scrollbar">
            {previewOutput ? (
              <p className="whitespace-pre-line text-slate-300 selection:bg-purple-600/30">
                {previewOutput}
              </p>
            ) : (
              <p className="text-slate-500 italic flex items-center gap-1">
                <span>Awaiting execution inputs...</span>
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div 
      className={`relative w-80 rounded-2xl transition-all duration-300 select-none backdrop-blur-2xl border ${
        selected 
          ? 'bg-slate-900/95 border-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.4)] scale-[1.02]' 
          : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 shadow-2xl hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]'
      } ${status === 'running' ? 'ring-2 ring-cyan-400/80 animate-node-exec' : ''}`}
    >
      {/* Dynamic Left Input Handles with Halo */}
      <div className="absolute -left-3 top-10 flex flex-col gap-5 z-20">
        {agentDef.inputs.map((inp) => (
          <div key={inp.id} className="group relative flex items-center">
            <Handle
              type="target"
              position={Position.Left}
              id={inp.id}
              style={{ backgroundColor: inp.color || '#38bdf8' }}
              className="!w-4 !h-4 !border-2 !border-slate-950 hover:!scale-150 transition-all cursor-crosshair shadow-[0_0_10px_currentColor]"
            />
            <span className="absolute left-6 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 text-[10px] font-mono bg-slate-950/95 text-cyan-200 px-2 py-1 rounded-lg border border-slate-800 shadow-2xl pointer-events-none whitespace-nowrap z-50 backdrop-blur-md">
              <span className="font-bold">{inp.name}</span> <span className="text-slate-400">({inp.type})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Node Header with Ambient Luminous Tint */}
      <div 
        className="p-3.5 border-b border-slate-800/80 flex items-center justify-between rounded-t-2xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${agentDef.accentColor}12 0%, rgba(15, 23, 42, 0.4) 100%)`
        }}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105"
            style={{ 
              backgroundColor: `${agentDef.accentColor}20`, 
              borderColor: `${agentDef.accentColor}40`,
              color: agentDef.accentColor 
            }}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-outfit">
              {data?.label || agentDef.label}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
              <Cpu className="w-2.5 h-2.5 text-indigo-400" />
              <span className="truncate max-w-[120px]">{selectedModel.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Node Body */}
      <div className="p-3.5 space-y-3">
        {renderAgentBody()}

        {/* Micro Telemetry Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">T: {temperature}</span>
            <span className="text-slate-700">•</span>
            <span className="text-purple-400">watsonx</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={copyToClipboard}
              title="Copy Output"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Right Output Handles with Halo */}
      <div className="absolute -right-3 top-10 flex flex-col gap-5 z-20">
        {agentDef.outputs.map((out) => (
          <div key={out.id} className="group relative flex items-center justify-end">
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-x-1 text-[10px] font-mono bg-slate-950/95 text-purple-200 px-2 py-1 rounded-lg border border-slate-800 shadow-2xl pointer-events-none whitespace-nowrap z-50 backdrop-blur-md">
              <span className="font-bold">{out.name}</span> <span className="text-slate-400">({out.type})</span>
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={out.id}
              style={{ backgroundColor: out.color || '#8b5cf6' }}
              className="!w-4 !h-4 !border-2 !border-slate-950 hover:!scale-150 transition-all cursor-crosshair shadow-[0_0_10px_currentColor]"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

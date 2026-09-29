import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Upload, 
  Maximize2, 
  LayoutTemplate, 
  ChevronDown,
  Layers,
  Save,
  Check,
  Share2,
  Users,
  Zap,
  HelpCircle
} from 'lucide-react';
import { WORKFLOW_TEMPLATES } from '../engine/templates';

export default function CanvasToolbar({
  workflowName,
  setWorkflowName,
  isRunning,
  executionStep,
  totalSteps,
  onRunWorkflow,
  onStopWorkflow,
  onClearCanvas,
  onLoadTemplate,
  onExportJson,
  onImportJson,
  onFitView
}) {
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <header className="h-14 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 px-4 flex items-center justify-between z-20 select-none shadow-xl">
      
      {/* Left: Breadcrumbs & Workflow Title */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="hover:text-slate-300 cursor-pointer">EduFlowAI</span>
          <span>/</span>
          <span className="text-purple-400 font-semibold">Studio</span>
          <span>/</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Sparkles className="w-3.5 h-3.5 text-white animate-subtle-glow" />
          </div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-white hover:bg-slate-900/60 focus:bg-slate-900 px-2 py-1 rounded-lg border border-transparent focus:border-purple-500/50 outline-none font-outfit max-w-[200px] sm:max-w-[260px] truncate transition-colors"
            placeholder="Untitled AI Workflow..."
          />
        </div>

        <button
          onClick={handleSave}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:scale-105"
          title="Save to Cloud"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-slate-400" />}
          <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
        </button>
      </div>

      {/* Middle: Execution Engine Action */}
      <div className="flex items-center gap-3">
        {isRunning ? (
          <button
            onClick={onStopWorkflow}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Flow ({executionStep}/{totalSteps})</span>
          </button>
        ) : (
          <button
            onClick={onRunWorkflow}
            className="relative group flex items-center gap-2 px-5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(147,51,234,0.35)] hover:shadow-[0_0_28px_rgba(147,51,234,0.55)] transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current text-purple-200 group-hover:scale-110 transition-transform" />
            <span>Run Pipeline</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] bg-white/20 rounded font-mono text-purple-100 shadow-inner">
              ⌘ Enter
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Multiplayer Avatars, Templates & Utilities */}
      <div className="flex items-center gap-2">
        
        {/* Multiplayer Presence (Figma-style) */}
        <div className="hidden xl:flex items-center -space-x-2 mr-2">
          <div className="w-7 h-7 rounded-full bg-cyan-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow" title="Alex (Student) - Viewing">
            AL
          </div>
          <div className="w-7 h-7 rounded-full bg-purple-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow" title="Prof. Davis - Co-editing">
            PD
          </div>
          <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow" title="Sarah (TA) - Online">
            ST
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-400">
            +3
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          title="Share Workflow Link"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
          <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
        </button>

        {/* Template Gallery Dropdown */}
        <div className="relative">
          <button
            onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {templateDropdownOpen && (
            <div className="absolute right-0 top-11 w-80 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-outfit">Curated Academic Pipelines</h4>
                  <p className="text-[10px] text-slate-400">One-click multi-agent blueprints</p>
                </div>
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="space-y-1">
                {WORKFLOW_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      onLoadTemplate(tmpl);
                      setTemplateDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 transition-colors flex flex-col gap-1 group border border-transparent hover:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                        {tmpl.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {tmpl.nodes.length} nodes
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fit to View */}
        <button
          onClick={onFitView}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors"
          title="Fit Canvas to View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Export / Import JSON */}
        <button
          onClick={onExportJson}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors"
          title="Export Workflow JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <label
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          title="Import Workflow JSON"
        >
          <Upload className="w-3.5 h-3.5" />
          <input
            type="file"
            accept=".json"
            onChange={onImportJson}
            className="hidden"
          />
        </label>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-colors"
          title="Clear Canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

      </div>

    </header>
  );
}

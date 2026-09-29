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
    <header className="h-14 bg-[#E5DED0] border-b border-[#141C2B]/15 px-4 flex items-center justify-between z-20 select-none shadow-sm font-typewriter">
      
      {/* Left: Breadcrumbs & Workflow Title */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[#141C2B]/60">
          <span className="hover:text-[#141C2B] cursor-pointer">EduFlowAI</span>
          <span>/</span>
          <span className="text-[#2C4A8F] font-bold">Studio</span>
          <span>/</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#141C2B] text-[#EFE9DD] flex items-center justify-center font-mono font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EFE9DD]" />
          </div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-serif font-bold text-[#141C2B] hover:bg-[#EFE9DD] focus:bg-[#EFE9DD] px-2 py-1 border border-transparent focus:border-[#2C4A8F] outline-none max-w-[200px] sm:max-w-[260px] truncate transition-colors"
            placeholder="Untitled AI Workflow..."
          />
        </div>

        <button
          onClick={handleSave}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 hover:border-[#141C2B] transition-all"
          title="Save to Cloud"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Save className="w-3.5 h-3.5 text-[#141C2B]/60" />}
          <span>{savedSuccess ? '[ Saved! ]' : '[ Save ]'}</span>
        </button>
      </div>

      {/* Middle: Execution Engine Action */}
      <div className="flex items-center gap-3">
        {isRunning ? (
          <button
            onClick={onStopWorkflow}
            className="flex items-center gap-2 px-4 py-1.5 bg-rose-700 text-white text-xs font-mono font-bold transition-all animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>[ Stop Flow ({executionStep}/{totalSteps}) ]</span>
          </button>
        ) : (
          <button
            onClick={onRunWorkflow}
            className="btn-filled flex items-center gap-2 px-5 py-1.5 text-xs font-mono font-bold"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#EFE9DD]" />
            <span>[ Run Pipeline ]</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] bg-white/20 font-mono text-white">
              ⌘ Enter
            </kbd>
          </button>
        )}
      </div>

      {/* Right: Multiplayer Avatars, Templates & Utilities */}
      <div className="flex items-center gap-2">
        
        {/* Multiplayer Presence */}
        <div className="hidden xl:flex items-center -space-x-1 mr-2 font-mono">
          <div className="w-7 h-7 bg-[#2C4A8F] border border-[#141C2B] flex items-center justify-center text-[10px] font-bold text-white" title="Alex (Student) - Viewing">
            AL
          </div>
          <div className="w-7 h-7 bg-[#141C2B] border border-[#141C2B] flex items-center justify-center text-[10px] font-bold text-[#EFE9DD]" title="Prof. Davis - Co-editing">
            PD
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="btn-outline flex items-center gap-1 px-2.5 py-1 text-xs font-mono"
          title="Share Workflow Link"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Share2 className="w-3.5 h-3.5 text-[#2C4A8F]" />}
          <span className="hidden sm:inline">{copiedShare ? '[ Copied ]' : '[ Share ]'}</span>
        </button>

        {/* Template Gallery Dropdown */}
        <div className="relative">
          <button
            onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
            className="btn-outline flex items-center gap-1.5 px-3 py-1 text-xs font-mono"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-[#2C4A8F]" />
            <span className="hidden sm:inline">[ Templates ]</span>
            <ChevronDown className="w-3 h-3 text-[#141C2B]/60" />
          </button>

          {templateDropdownOpen && (
            <div className="absolute right-0 top-11 w-80 bg-[#E5DED0] border border-[#141C2B]/20 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 font-typewriter">
              <div className="p-2 border-b border-[#141C2B]/10 mb-1 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-serif font-bold text-[#141C2B]">Curated Academic Blueprints</h4>
                  <p className="text-[10px] font-mono text-[#141C2B]/60">One-click multi-agent pipelines</p>
                </div>
                <Zap className="w-4 h-4 text-[#2C4A8F]" />
              </div>
              <div className="space-y-1">
                {WORKFLOW_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      onLoadTemplate(tmpl);
                      setTemplateDropdownOpen(false);
                    }}
                    className="w-full text-left p-2.5 hover:bg-[#EFE9DD] transition-colors flex flex-col gap-1 border border-transparent hover:border-[#141C2B]/15"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#141C2B]">
                        {tmpl.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#EFE9DD] text-[#2C4A8F] border border-[#2C4A8F]/20">
                        {tmpl.nodes.length} nodes
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#141C2B]/70 line-clamp-2 leading-relaxed">
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
          className="p-1.5 text-[#141C2B]/70 hover:text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 transition-colors"
          title="Fit Canvas to View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Export / Import JSON */}
        <button
          onClick={onExportJson}
          className="p-1.5 text-[#141C2B]/70 hover:text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 transition-colors"
          title="Export Workflow JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <label
          className="p-1.5 text-[#141C2B]/70 hover:text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 transition-colors cursor-pointer"
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
          className="p-1.5 text-[#141C2B]/70 hover:text-rose-700 bg-[#EFE9DD] border border-[#141C2B]/20 transition-colors"
          title="Clear Canvas"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

      </div>

    </header>
  );
}

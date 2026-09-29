import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  AlignLeft, 
  Lightbulb, 
  Calendar, 
  Video, 
  FileCode, 
  Globe, 
  HelpCircle,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AGENT_CATEGORIES, AGENT_REGISTRY } from '../engine/agentDefinitions';

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

export default function NodePalette({ onAddNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const agents = Object.values(AGENT_REGISTRY);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || agent.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const onDragStart = (event, agentId) => {
    event.dataTransfer.setData('application/reactflow/agentId', agentId);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (isCollapsed) {
    return (
      <div className="absolute left-4 top-20 z-20">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl text-slate-300 hover:text-white hover:border-purple-500/50 transition-all flex items-center gap-2 group"
          title="Open Agent Palette"
        >
          <Layers className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800 flex flex-col h-full shadow-2xl z-20 select-none">
      {/* Palette Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide font-outfit">AI Agent Palette</h3>
            <p className="text-[10px] text-slate-400 font-mono">11 Modular Nodes</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          title="Collapse Palette"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AI agents..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-2 border-b border-slate-800/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {AGENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {filteredAgents.map((agent) => {
          const Icon = ICON_MAP[agent.icon] || Sparkles;
          return (
            <div
              key={agent.agentId}
              draggable
              onDragStart={(e) => onDragStart(e, agent.agentId)}
              onClick={() => onAddNode(agent.agentId)}
              className="group p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing hover:shadow-lg flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center border shadow-inner"
                    style={{
                      backgroundColor: `${agent.accentColor}18`,
                      borderColor: `${agent.accentColor}30`,
                      color: agent.accentColor
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {agent.label}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      {agent.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNode(agent.agentId);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-purple-600 rounded-md transition-all shadow"
                  title="Add to Canvas"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/40 text-[9px] text-slate-500 font-mono">
                <span>{agent.inputs.length} in</span>
                <span>•</span>
                <span>{agent.outputs.length} out</span>
                <span className="ml-auto text-indigo-400">{agent.defaultModel.split(' ')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Palette Footer Tip */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-center text-[10px] text-slate-500">
        💡 Drag agents onto canvas or click to add
      </div>
    </aside>
  );
}

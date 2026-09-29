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
      <div className="absolute left-4 top-20 z-20 font-typewriter">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 bg-[#E5DED0] border border-[#141C2B]/20 text-[#141C2B] hover:border-[#141C2B] transition-all flex items-center gap-2 group shadow-sm"
          title="Open Agent Palette"
        >
          <Layers className="w-5 h-5 text-[#2C4A8F] group-hover:scale-110 transition-transform" />
          <ChevronRight className="w-4 h-4 text-[#141C2B]/60" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-[#E5DED0] border-r border-[#141C2B]/15 flex flex-col h-full shadow-sm z-20 select-none font-typewriter">
      {/* Palette Header */}
      <div className="p-4 border-b border-[#141C2B]/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#141C2B] text-[#EFE9DD] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#141C2B]">AI Agent Palette</h3>
            <p className="text-[10px] text-[#141C2B]/60 font-mono">11 Modular Nodes</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 text-[#141C2B]/60 hover:text-[#141C2B] hover:bg-[#EFE9DD] transition-colors"
          title="Collapse Palette"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#141C2B]/10">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#141C2B]/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AI agents..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] placeholder-[#141C2B]/40 focus:outline-none focus:border-[#2C4A8F] transition-colors font-mono"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-2 border-b border-[#141C2B]/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {AGENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 text-[10px] font-mono font-bold whitespace-nowrap transition-all border ${
              activeCategory === cat.id
                ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                : 'text-[#141C2B]/70 hover:text-[#141C2B] hover:bg-[#EFE9DD] border-transparent'
            }`}
          >
            [ {cat.label} ]
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
              className="group p-3 bg-[#EFE9DD] hover:bg-[#EFE9DD]/80 border border-[#141C2B]/15 hover:border-[#141C2B] transition-all cursor-grab active:cursor-grabbing flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center border border-[#141C2B]/20 bg-[#E5DED0] text-[#2C4A8F]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#141C2B] group-hover:text-[#2C4A8F] transition-colors">
                      {agent.label}
                    </h4>
                    <span className="text-[9px] font-mono text-[#141C2B]/60 uppercase">
                      {agent.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNode(agent.agentId);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#141C2B] hover:bg-[#141C2B] hover:text-[#EFE9DD] transition-all border border-[#141C2B]/20"
                  title="Add to Canvas"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <p className="text-[11px] font-mono text-[#141C2B]/70 line-clamp-2 leading-relaxed">
                {agent.description}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-[#141C2B]/10 text-[9px] text-[#141C2B]/60 font-mono">
                <span>{agent.inputs.length} in</span>
                <span>•</span>
                <span>{agent.outputs.length} out</span>
                <span className="ml-auto text-[#2C4A8F] font-bold">{agent.defaultModel.split(' ')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Palette Footer Tip */}
      <div className="p-3 border-t border-[#141C2B]/10 bg-[#E5DED0] text-center text-[10px] font-mono text-[#141C2B]/60">
        💡 Drag agents onto canvas or click to place
      </div>
    </aside>
  );
}

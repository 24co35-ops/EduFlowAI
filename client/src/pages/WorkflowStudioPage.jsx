import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AgentNode } from '../workflow/nodes/AgentNode';
import { DataFlowEdge } from '../workflow/edges/DataFlowEdge';
import NodePalette from '../workflow/components/NodePalette';
import InspectorDrawer from '../workflow/components/InspectorDrawer';
import CanvasToolbar from '../workflow/components/CanvasToolbar';
import { AGENT_REGISTRY } from '../workflow/engine/agentDefinitions';
import { WORKFLOW_TEMPLATES } from '../workflow/engine/templates';
import { getTopologicalOrder, executeAgentNode } from '../workflow/engine/workflowRunner';

const nodeTypes = {
  agentNode: AgentNode
};

const edgeTypes = {
  dataFlow: DataFlowEdge
};

function WorkflowStudioContent() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const defaultTemplate = WORKFLOW_TEMPLATES[0];

  const [workflowName, setWorkflowName] = useState(() => {
    return localStorage.getItem('eduflow_workflow_name') || defaultTemplate.title;
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(() => {
    try {
      const saved = localStorage.getItem('eduflow_canvas_nodes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultTemplate.nodes;
  });

  const [edges, setEdges, onEdgesChange] = useEdgesState(() => {
    try {
      const saved = localStorage.getItem('eduflow_canvas_edges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultTemplate.edges;
  });

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const isCancelledRef = useRef(false);

  // Auto-fit view when React Flow mounts
  const onInitHandler = useCallback((instance) => {
    setReactFlowInstance(instance);
    setTimeout(() => {
      instance.fitView({ padding: 0.3, duration: 600 });
    }, 150);
  }, []);

  // Auto-persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eduflow_canvas_nodes', JSON.stringify(nodes));
      localStorage.setItem('eduflow_canvas_edges', JSON.stringify(edges));
      localStorage.setItem('eduflow_workflow_name', workflowName);
    } catch (err) {
      console.warn('Canvas storage quota or error:', err);
    }
  }, [nodes, edges, workflowName]);

  // Handle Edge Connection
  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'dataFlow',
            animated: true,
            data: { isExecuting: false }
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Node Selection
  const onNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Update selected node data
  const handleUpdateNode = useCallback(
    (nodeId, updatedFields) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...updatedFields
              }
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [setNodes, setEdges, selectedNodeId]
  );

  // Add new agent node
  const handleAddNode = useCallback(
    (agentId, customPosition) => {
      const def = AGENT_REGISTRY[agentId] || AGENT_REGISTRY['summarizer'];
      const newNodeId = `node-${Date.now().toString(36)}`;
      
      const position = customPosition || {
        x: 350 + Math.random() * 100,
        y: 150 + Math.random() * 100
      };

      const newNode = {
        id: newNodeId,
        type: 'agentNode',
        position,
        data: {
          agentId,
          label: def.label,
          category: def.category,
          status: 'idle',
          selectedModel: def.defaultModel,
          temperature: def.defaultTemperature,
          previewOutput: def.defaultPreview
        }
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNodeId);
    },
    [setNodes]
  );

  // Drag and Drop from Palette
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const agentId = event.dataTransfer.getData('application/reactflow/agentId');
      if (!agentId || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      handleAddNode(agentId, position);
    },
    [reactFlowInstance, handleAddNode]
  );

  // Load Pre-built Template
  const handleLoadTemplate = useCallback(
    (template) => {
      setWorkflowName(template.title);
      setNodes(template.nodes);
      setEdges(template.edges);
      setSelectedNodeId(template.nodes[0]?.id || null);
    },
    [setNodes, setEdges]
  );

  // Clear Canvas
  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
    }
  }, [setNodes, setEdges]);

  // Export / Import JSON
  const handleExportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ name: workflowName, nodes, edges }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${workflowName.replace(/\s+/g, '_')}.eduflow.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [workflowName, nodes, edges]);

  const handleImportJson = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result);
          if (parsed.nodes && parsed.edges) {
            setWorkflowName(parsed.name || 'Imported Workflow');
            setNodes(parsed.nodes);
            setEdges(parsed.edges);
          }
        } catch (err) {
          alert('Invalid EduFlow workflow JSON file.');
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges]
  );

  // Run Workflow Pipeline
  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;

    setIsRunning(true);
    isCancelledRef.current = false;

    // Reset status to idle first
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle' }
      }))
    );

    const orderedNodes = getTopologicalOrder(nodes, edges);
    setTotalSteps(orderedNodes.length);

    let cumulativeContext = '';

    for (let i = 0; i < orderedNodes.length; i++) {
      if (isCancelledRef.current) break;

      const currentNode = orderedNodes[i];
      setExecutionStep(i + 1);

      // 1. Mark node as running
      setNodes((nds) =>
        nds.map((n) =>
          n.id === currentNode.id
            ? { ...n, data: { ...n.data, status: 'running' } }
            : n
        )
      );

      // 2. Pulse incoming edges
      setEdges((eds) =>
        eds.map((e) =>
          e.target === currentNode.id
            ? { ...e, data: { ...e.data, isExecuting: true } }
            : e
        )
      );

      // 3. Execute inference simulation
      const result = await executeAgentNode(currentNode, { context: cumulativeContext });

      cumulativeContext = result.output;

      if (isCancelledRef.current) break;

      // 4. Mark node as completed & turn off edge pulse
      setNodes((nds) =>
        nds.map((n) =>
          n.id === currentNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: 'completed',
                  executionTimeMs: result.latencyMs,
                  previewOutput: result.output
                }
              }
            : n
        )
      );

      setEdges((eds) =>
        eds.map((e) =>
          e.target === currentNode.id
            ? { ...e, data: { ...e.data, isExecuting: false } }
            : e
        )
      );
    }

    setIsRunning(false);
  }, [nodes, edges, setNodes, setEdges]);

  const handleStopWorkflow = useCallback(() => {
    isCancelledRef.current = true;
    setIsRunning(false);
    setEdges((eds) => eds.map((e) => ({ ...e, data: { ...e.data, isExecuting: false } })));
  }, [setEdges]);

  // Global Keyboard Shortcuts (Cmd+Enter to run)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) {
          handleRunWorkflow();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, handleRunWorkflow]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#EFE9DD] relative select-none font-typewriter text-[#141C2B]">
      
      {/* Top Canvas Toolbar */}
      <CanvasToolbar
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        isRunning={isRunning}
        executionStep={executionStep}
        totalSteps={totalSteps}
        onRunWorkflow={handleRunWorkflow}
        onStopWorkflow={handleStopWorkflow}
        onClearCanvas={handleClearCanvas}
        onLoadTemplate={handleLoadTemplate}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onFitView={() => reactFlowInstance?.fitView({ padding: 0.2, duration: 400 })}
      />

      {/* Main Canvas Workspace Container */}
      <div className="flex-1 flex relative overflow-hidden" ref={reactFlowWrapper}>
        
        {/* Left Agent Palette */}
        <NodePalette onAddNode={handleAddNode} />

        {/* Center Infinite React Flow Workspace */}
        <div 
          className="flex-1 h-full relative" 
          onDrop={onDrop} 
          onDragOver={onDragOver}
          style={{
            backgroundColor: '#EFE9DD'
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInitHandler}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2.0}
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color="rgba(20, 28, 43, 0.2)"
            />
            <Controls className="!bg-[#E5DED0] !border-[#141C2B]/20 !rounded-none !shadow-sm [&>button]:!bg-transparent [&>button]:!border-[#141C2B]/15 [&>button]:!text-[#141C2B] hover:[&>button]:!bg-[#EFE9DD] [&>button]:!rounded-none !p-1" />
            <MiniMap
              nodeColor={(node) => {
                switch (node.data?.status) {
                  case 'running': return '#2C4A8F';
                  case 'completed': return '#15803d';
                  case 'error': return '#be123c';
                  default: return '#141C2B';
                }
              }}
              maskColor="rgba(239, 233, 221, 0.85)"
              className="!bg-[#E5DED0] !border-[#141C2B]/20 !rounded-none overflow-hidden !shadow-sm !m-4"
            />
          </ReactFlow>

          {/* Floating Empty Canvas CTA */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="p-8 stationery-card border border-[#141C2B]/20 bg-[#E5DED0] text-center max-w-sm pointer-events-auto space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 flex items-center justify-center mx-auto text-[#2C4A8F]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-[#141C2B]">Canvas is Ready</h3>
                  <p className="text-xs font-mono text-[#141C2B]/70 leading-relaxed">
                    Drag AI agents from the left palette or load a curated workflow blueprint.
                  </p>
                </div>
                <button
                  onClick={() => handleLoadTemplate(defaultTemplate)}
                  className="btn-filled text-xs font-mono font-bold px-5 py-2.5"
                >
                  [ Load Starter Pipeline ]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Inspector Drawer */}
        <InspectorDrawer
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSelectedNodeId(null)}
        />

      </div>
    </div>
  );
}

export default function WorkflowStudioPage() {
  return (
    <ReactFlowProvider>
      <WorkflowStudioContent />
    </ReactFlowProvider>
  );
}

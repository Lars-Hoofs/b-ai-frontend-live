'use client';

import { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from './WorkflowNodes';
import { NodeConfigPanel } from './NodeConfigPanel';
import { RiSaveLine, RiAddLine, RiPlayLine } from '@remixicon/react';

const nodeCategories = [
  {
    category: 'Triggers',
    nodes: [
      { type: 'TRIGGER_MESSAGE', label: 'Bericht Ontvangen', description: 'Start wanneer gebruiker bericht stuurt' },
      { type: 'TRIGGER_WAIT', label: 'Wachten', description: 'Wacht een bepaalde tijd' },
      { type: 'TRIGGER_INACTIVITY', label: 'Inactiviteit', description: 'Gebruiker X tijd inactief' },
      { type: 'TRIGGER_USER_INPUT', label: 'Wacht op Input', description: 'Wacht op specifieke gebruikers input' },
    ],
  },
  {
    category: 'Voorwaarden',
    nodes: [
      { type: 'CONDITION_KEYWORD', label: 'Bevat Sleutelwoord', description: 'Check of bericht sleutelwoord bevat' },
      { type: 'CONDITION_EQUALS', label: 'Is Gelijk Aan', description: 'Check of waarde exact gelijk is' },
      { type: 'CONDITION_CONTAINS', label: 'Bevat Tekst', description: 'Check of tekst aanwezig is' },
      { type: 'CONDITION_VARIABLE', label: 'Check Variabele', description: 'Controleer variabele waarde' },
    ],
  },
  {
    category: 'Acties',
    nodes: [
      { type: 'ACTION_MESSAGE', label: 'Verstuur Bericht', description: 'Stuur bericht naar gebruiker' },
      { type: 'ACTION_EMAIL', label: 'Verstuur Email', description: 'Stuur email notificatie' },
      { type: 'ACTION_API_CALL', label: 'API Aanroep', description: 'Roep externe API aan' },
      { type: 'ACTION_ASSIGN_HUMAN', label: 'Wijs Toe aan Mens', description: 'Overdracht naar menselijke agent' },
      { type: 'ACTION_SET_VARIABLE', label: 'Zet Variabele', description: 'Bewaar waarde in variabele' },
    ],
  },
  {
    category: 'AI Acties',
    nodes: [
      { type: 'AI_RESPONSE', label: 'AI Antwoord', description: 'Genereer AI antwoord' },
      { type: 'AI_SEARCH_KB', label: 'Zoek Knowledge Base', description: 'Zoek in knowledge base' },
      { type: 'AI_EXTRACT_INFO', label: 'Extraheer Info', description: 'Extraheer specifieke informatie' },
    ],
  },
];

interface WorkflowEditorProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
  workflowId?: string;
  workspaceId?: string;
}

export function WorkflowEditor({ initialNodes = [], initialEdges = [], onSave, workflowId, workspaceId }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.length > 0 ? initialNodes : [
    {
      id: 'start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Start' },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('label');
      const nodeType = event.dataTransfer.getData('nodeType');
      const description = event.dataTransfer.getData('description');

      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: { 
          label,
          type: nodeType,
          description,
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleSave = () => {
    onSave(nodes, edges);
  };

  const handleExecute = async () => {
    if (!workflowId || !workspaceId) {
      alert('⚠️ Sla de workflow eerst op voordat je hem test!');
      return;
    }

    try {
      setIsExecuting(true);
      console.log('🚀 Starting workflow execution...');
      
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          initialData: { 
            message: { content: 'Test execution' },
            testMode: true 
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Execution failed');
      }

      const result = await response.json();
      console.log('✅ Workflow execution completed:', result);
      alert('✅ Workflow uitgevoerd! Check de console (F12) voor details.');
    } catch (error: any) {
      console.error('❌ Workflow execution failed:', error);
      alert(`❌ Fout: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleNodeConfigUpdate = (nodeId: string, config: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  };

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    // Remove edges connected to this node
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Node Palette Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-foreground mb-4">Nodes</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Sleep nodes naar het canvas
          </p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          
          {nodeCategories.map((category) => (
            <div key={category.category} className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/reactflow', 'custom');
                      event.dataTransfer.setData('label', node.label);
                      event.dataTransfer.setData('nodeType', node.type);
                      event.dataTransfer.setData('description', node.description);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    className="p-3 bg-muted hover:bg-muted/80 rounded-lg cursor-move transition-colors border border-border"
                  >
                    <div className="text-sm font-medium text-foreground">{node.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{node.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          
          <Panel position="top-right" className="flex gap-2">
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium shadow-lg"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uitvoeren...
                </>
              ) : (
                <>
                  <RiPlayLine size={18} />
                  Test Workflow
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg"
            >
              <RiSaveLine size={18} />
              Opslaan
            </button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node Configuration Panel */}
      {selectedNode && selectedNode.type !== 'start' && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={handleNodeConfigUpdate}
          onDelete={handleNodeDelete}
        />
      )}
    </div>
  );
}

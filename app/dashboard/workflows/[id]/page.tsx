'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WorkflowEditor } from '@/components/workflows/WorkflowEditor';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { workflowAPI } from '@/lib/api';
import { Node, Edge } from 'reactflow';
import { RiArrowLeftLine, RiFlowChart } from '@remixicon/react';

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const [workflow, setWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedWorkspace && params.id) {
      loadWorkflow();
    }
  }, [selectedWorkspace, params.id]);

  const loadWorkflow = async () => {
    if (!selectedWorkspace || !params.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await workflowAPI.getById(params.id as string, selectedWorkspace.id);
      setWorkflow(data);
    } catch (err: any) {
      console.error('Failed to load workflow:', err);
      setError(err.message || 'Failed to load workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    if (!selectedWorkspace || !params.id) return;

    try {
      setIsSaving(true);
      console.log('=== WORKFLOW BATCH SAVE STARTED ===');
      console.log('Nodes to save:', nodes.length, 'Edges to save:', edges.length);
      
      // Filter out 'start' node (frontend-only)
      console.log('\n--- Preparing Nodes ---');
      console.log('Total nodes in canvas:', nodes.length);
      
      const nodesToSave = nodes.filter(node => node.type !== 'start');
      console.log('Nodes to save (excluding START):', nodesToSave.length);
      
      if (nodesToSave.length === 0) {
        console.log('⚠️ No nodes to save - workflow is empty');
        await loadWorkflow();
        alert('✅ Workflow opgeslagen (geen nodes)');
        return;
      }
      
      // Create mapping: ReactFlow ID -> Sequential Node ID
      const reactFlowIdToNodeId = new Map<string, string>();
      nodesToSave.forEach((node, index) => {
        const sequentialId = `node_${index + 1}`;
        reactFlowIdToNodeId.set(node.id, sequentialId);
        console.log(`  Node ${index + 1}: "${node.data.label}" (${node.data.type})`);
        console.log(`    ReactFlow ID: ${node.id}`);
        console.log(`    Sequential ID: ${sequentialId}`);
      });
      
      // Prepare nodes for batch save
      const preparedNodes = nodesToSave.map(node => ({
        workflowId: params.id as string,
        nodeId: reactFlowIdToNodeId.get(node.id)!,
        type: node.data.type,
        label: node.data.label,
        config: node.data.config || {},
        positionX: Math.round(node.position.x),
        positionY: Math.round(node.position.y),
        // Store ReactFlow ID for edge mapping
        _reactFlowId: node.id,
      }));
      
      // Separate START edges from regular edges
      console.log('\n--- Filtering Edges ---');
      console.log('Total edges in canvas:', edges.length);
      edges.forEach(edge => {
        console.log(`  Edge: ${edge.source} → ${edge.target}`);
      });
      
      // Find START edges (we'll save these as workflow metadata)
      const startEdges = edges.filter(edge => edge.source === 'start');
      const startNodeIds = startEdges.map(edge => edge.target);
      console.log('\nSTART edges found:', startEdges.length);
      startEdges.forEach(edge => {
        console.log(`  START → ${edge.target}`);
      });
      
      // Filter regular edges (between actual nodes)
      const validEdges = edges.filter(edge => {
        const sourceIsNode = nodesToSave.find(n => n.id === edge.source);
        const targetIsNode = nodesToSave.find(n => n.id === edge.target);
        
        if (edge.source === 'start' || edge.target === 'start') {
          // START edges are handled separately
          return false;
        }
        
        if (!sourceIsNode || !targetIsNode) {
          console.warn(`  ❌ Skipped: ${edge.source} → ${edge.target} (node not found)`);
          return false;
        }
        
        console.log(`  ✅ Valid: ${edge.source} → ${edge.target}`);
        return true;
      });
      
      console.log('Regular edges (will be saved):', validEdges.length);
      
      // Prepare edges with ReactFlow IDs (backend will map to DB IDs)
      const preparedEdges = validEdges.map(edge => ({
        workflowId: params.id as string,
        // Use nodeId (sequential) as reference
        _sourceReactFlowId: edge.source,
        _targetReactFlowId: edge.target,
        condition: edge.data?.condition || null,
        label: typeof edge.label === 'string' ? edge.label : null,
      }));
      
      console.log('Prepared edges:', preparedEdges.length);
      
      // Save everything in ONE atomic operation
      const batchResult = await workflowAPI.batchSave(params.id as string, {
        workspaceId: selectedWorkspace.id,
        nodes: preparedNodes,
        edges: preparedEdges,
        startNodeIds: startNodeIds, // Save START edges as metadata
      });
      
      console.log('Batch save result:', {
        nodesCreated: batchResult.nodes.length,
        edgesCreated: batchResult.edges.length,
        startNodesConfigured: startNodeIds.length,
      });
      
      console.log('=== WORKFLOW BATCH SAVE COMPLETED ===');
      
      // Reload workflow to get updated data
      await loadWorkflow();
      
      alert('✅ Workflow succesvol opgeslagen!');
    } catch (err: any) {
      console.error('Failed to save workflow:', err);
      alert(`❌ Fout bij opslaan: ${err.message || 'Onbekende fout'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <RiFlowChart size={64} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Failed to load workflow</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/workflows')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  // Convert backend nodes/edges to React Flow format
  // IMPORTANT:
  // - React Flow node IDs must match the IDs used by edges (sourceNodeId/targetNodeId).
  // - In the database, WorkflowEdge.sourceNodeId/targetNodeId reference WorkflowNode.id
  //   (the primary key), not WorkflowNode.nodeId.
  //
  // Therefore we use `node.id` as the React Flow node ID so edges line up correctly.
  const initialNodes: Node[] = workflow.nodes?.map((node: any) => ({
    id: node.id,
    type: 'custom',
    position: { x: node.positionX || 0, y: node.positionY || 0 },
    data: {
      label: node.label,
      type: node.type,
      config: node.config || {},
      description: node.description || '',
      // Keep original nodeId available for debugging/inspection if needed
      originalNodeId: node.nodeId,
    },
  })) || [];

  // Add start node if not present
  if (!initialNodes.find(n => n.id === 'start')) {
    initialNodes.unshift({
      id: 'start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Start' },
    });
  }

  // Create a Set of valid node IDs for validation
  const validNodeIds = new Set(initialNodes.map(n => n.id));

  // Load regular edges (between nodes)
  const initialEdges: Edge[] = workflow.edges
    ?.filter((edge: any) => {
      // Only include edges where both source and target exist
      return validNodeIds.has(edge.sourceNodeId) && validNodeIds.has(edge.targetNodeId);
    })
    .map((edge: any, index: number) => ({
      id: `edge-${edge.sourceNodeId}-${edge.targetNodeId}-${index}`,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      label: edge.label || undefined,
      data: { condition: edge.condition },
      type: 'default',
    })) || [];

  // Recreate START edges from workflow metadata
  const startNodeIds = (workflow.startNodeIds || []) as string[];
  console.log('[LOAD WORKFLOW] START edges:', {
    startNodeIds,
    validNodeIds: Array.from(validNodeIds),
    willCreateEdges: startNodeIds.filter(id => validNodeIds.has(id)),
  });
  
  startNodeIds.forEach((nodeId: string) => {
    if (validNodeIds.has(nodeId)) {
      console.log('[LOAD WORKFLOW] Creating START edge to:', nodeId);
      initialEdges.push({
        id: `edge-start-${nodeId}`,
        source: 'start',
        target: nodeId,
        type: 'default',
      });
    } else {
      console.warn('[LOAD WORKFLOW] Skipping START edge - node not found:', nodeId);
    }
  });
  
  console.log('[LOAD WORKFLOW] Total edges loaded:', {
    regularEdges: workflow.edges?.length || 0,
    startEdges: startNodeIds.length,
    totalInitialEdges: initialEdges.length,
  });

  return (
    <div className="fixed inset-0 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 256px)', top: '4rem' }}>
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/workflows')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <RiArrowLeftLine size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground">
              {workflow.description || 'No description'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                await workflowAPI.toggle(params.id as string, selectedWorkspace!.id, !workflow.isActive);
                await loadWorkflow();
              } catch (err) {
                console.error('Failed to toggle workflow:', err);
              }
            }}
            className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-colors ${
              workflow.isActive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Click to toggle active/inactive"
          >
            {workflow.isActive ? '✓ Active' : '⚫ Inactive'}
          </button>
          <span className="text-sm text-muted-foreground">
            v{workflow.version}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <WorkflowEditor
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onSave={handleSave}
          workflowId={params.id as string}
          workspaceId={selectedWorkspace?.id}
        />
      </div>

      {isSaving && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground">Saving workflow...</p>
          </div>
        </div>
      )}
    </div>
  );
}

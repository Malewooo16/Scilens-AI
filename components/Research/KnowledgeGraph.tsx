'use client';
import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { generateAndStoreKnowledgeGraph } from '@/actions/knowledgeGraph';

interface KnowledgeGraphProps {
  researchQueryId: string;
  initialGraphData: any;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ researchQueryId, initialGraphData }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);

  const buildNodes = (rawNodes: any[]) =>
    rawNodes.map((node) => ({
      id: node.id,
      data: { label: node.label },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      draggable: true,
      style: {
        background: '#14b8a6', // teal-500
        color: 'white',
        border: '2px solid #0f766e', // teal-700
        borderRadius: 12,
        padding: 8,
        fontWeight: 500,
      },
    }));

  const buildEdges = (rawEdges: any[]) =>
    rawEdges.map((edge, index) => ({
      id: `e${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: '#059669', strokeWidth: 2 }, // emerald-600
      labelStyle: { fill: '#065f46', fontWeight: 600 },
    }));

  const handleGenerateGraph = useCallback(async () => {
    setLoading(true);
    try {
      const graphData = await generateAndStoreKnowledgeGraph(researchQueryId);
      if (graphData?.nodes && graphData?.edges) {
        setNodes(buildNodes(graphData.nodes));
        setEdges(buildEdges(graphData.edges));
      }
    } catch (error) {
      console.error('Failed to generate knowledge graph:', error);
    }
    setLoading(false);
  }, [researchQueryId]);

  useEffect(() => {
    if (initialGraphData) {
      setNodes(buildNodes(initialGraphData.nodes));
      setEdges(buildEdges(initialGraphData.edges));
    } else {
      handleGenerateGraph();
    }
  }, [initialGraphData, handleGenerateGraph]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((es) => addEdge(params, es)),
    []
  );

  return (
    <div>
      <button
        onClick={handleGenerateGraph}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md mb-4 transition"
      >
        {loading ? 'Generating...' : 'Regenerate Knowledge Graph'}
      </button>
      <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] border border-gray-300 rounded-xl shadow-sm">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap
            nodeColor={() => '#14b8a6'}
            maskColor="rgba(20, 184, 166, 0.1)" // teal transparent
          />
          <Controls className="bg-white rounded-lg shadow-md p-1" />
          <Background gap={16} color="#d1fae5" /> {/* emerald-100 grid */}
        </ReactFlow>
      </div>
    </div>
  );
};

export default KnowledgeGraph;

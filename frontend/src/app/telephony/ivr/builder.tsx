"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Save, Plus, Trash2, Settings2, PhoneCall, Users, Play, X } from 'lucide-react';
import api from '@/lib/api';

const initialNodes = [
  {
    id: 'start',
    type: 'input',
    data: { label: 'Inbound Call Start' },
    position: { x: 250, y: 0 },
    style: { background: '#6366f1', color: '#fff', fontWeight: 'bold', borderRadius: '12px', padding: '10px' },
  },
];

interface IvrBuilderProps {
  ivrId: string;
  onClose: () => void;
  onSave?: () => void;
}

export default function IvrBuilder({ ivrId, onClose, onSave }: IvrBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const fetchIvr = useCallback(async () => {
    try {
      const { data } = await api.get(`/telephony/ivr/${ivrId}`);
      if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) {
        setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
      }
    } catch (err) {
      console.error('Failed to fetch IVR layout', err);
    } finally {
      setLoading(false);
    }
  }, [ivrId, setNodes, setEdges]);

  useEffect(() => {
    fetchIvr();
  }, [fetchIvr]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    try {
      await api.patch(`/telephony/ivr/${ivrId}`, {
        nodes,
        edges,
      });
      alert('IVR configuration saved successfully!');
      onSave?.();
    } catch (err) {
      alert('Failed to save IVR');
    }
  };

  const addNode = (type: string) => {
    const id = `node_${Date.now()}`;
    const newNode = {
      id,
      type: 'default',
      data: { label: `${type.toUpperCase()} Node` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      style: { 
        background: 'var(--surface)', 
        color: 'var(--text)', 
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: '600'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  if (loading) return <div className="h-full flex items-center justify-center text-text-muted">Loading Engine...</div>;

  return (
    <div className="fixed inset-0 bg-background/95 z-[10000] flex flex-col font-sans animate-in fade-in duration-300">
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="bg-primary/20 p-2 rounded-xl">
              <Settings2 size={20} className="text-primary"/>
           </div>
           <div>
              <h2 className="text-lg font-black tracking-tight text-foreground uppercase">Visual IVR Designer</h2>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">ID: {ivrId} // FLOW-ENGINE ALPHA</p>
           </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" onClick={onClose} className="border-border text-[10px] font-black uppercase tracking-widest h-10 px-6">
              Discard
           </Button>
           <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 shadow-lg shadow-primary/20">
              <Save size={14} className="mr-2"/> Commit Changes
           </Button>
           <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 text-text-muted">
              <X size={18}/>
           </Button>
        </div>
      </header>

      <main className="flex-1 relative bg-surface-2">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="light"
        >
          <Background color="var(--border)" gap={20} />
          <Controls />
          <MiniMap 
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            nodeStrokeColor={(n) => (n.type === 'input' ? '#6366f1' : 'var(--border)')}
            nodeColor={(n) => (n.type === 'input' ? '#6366f1' : 'var(--surface)')}
          />
          
          <Panel position="top-right" className="bg-surface/80 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-2xl flex flex-col gap-3 mr-4">
             <h3 className="text-[9px] font-black uppercase tracking-widest text-text-muted border-b border-border pb-2 mb-1">Add Logic Nodes</h3>
             <Button onClick={() => addNode('Extension')} variant="outline" size="sm" className="justify-start border-border hover:border-primary text-[10px] font-bold">
                <Users size={12} className="mr-2 text-primary"/> Route to Extension
             </Button>
             <Button onClick={() => addNode('Queue')} variant="outline" size="sm" className="justify-start border-border hover:border-primary text-[10px] font-bold">
                <PhoneCall size={12} className="mr-2 text-success"/> Route to Queue
             </Button>
             <Button onClick={() => addNode('Announcement')} variant="outline" size="sm" className="justify-start border-border hover:border-primary text-[10px] font-bold">
                <Play size={12} className="mr-2 text-warning"/> Play Audio
             </Button>
             <div className="mt-2 text-[8px] font-bold text-text-muted uppercase text-center italic">
                Drag and Drop to Build Flow
             </div>
          </Panel>

          <Panel position="bottom-center" className="mb-6">
             <div className="bg-surface-2/50 backdrop-blur-md border border-border/50 px-6 py-2 rounded-full flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 bg-success rounded-full animate-pulse"/>
                   <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Compiler Status: Ready</span>
                </div>
                <div className="h-4 w-[1px] bg-border"/>
                <span className="text-[9px] font-mono text-text-muted">Nodes: {nodes.length} // Edges: {edges.length}</span>
             </div>
          </Panel>
        </ReactFlow>
      </main>
    </div>
  );
}

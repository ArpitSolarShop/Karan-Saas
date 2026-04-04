'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Zap, Plus, Save, Play, Webhook, MessageSquare, 
  Bell, FileText, UserPlus, ArrowRight, Trash2, TrendingUp, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

// --- Custom Node Components ---

const TriggerNode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-xl rounded-xl bg-zinc-900 border-2 border-blue-500 min-w-[180px]">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 bg-blue-500/20 rounded-lg">
        <Zap size={16} className="text-blue-500" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Trigger</span>
    </div>
    <div className="text-sm font-semibold text-white">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-zinc-900" />
  </div>
);

const ActionNode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-xl rounded-xl bg-zinc-900 border-2 border-emerald-500 min-w-[180px]">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-zinc-900" />
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 bg-emerald-500/20 rounded-lg">
        {data.type === 'WEBHOOK' ? <Webhook size={16} className="text-emerald-500" /> : <Play size={16} className="text-emerald-500" />}
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Action</span>
    </div>
    <div className="text-sm font-semibold text-white">{data.label}</div>
    {data.type === 'WEBHOOK' && (
      <div className="mt-2 text-[10px] text-zinc-500 truncate">{data.url || 'No URL set'}</div>
    )}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-zinc-900" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { label: 'When Lead is Created' },
  },
];

const initialEdges: Edge[] = [];

export default function VisualWorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('New Smart Workflow');

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#10b981' } }, eds)),
    [setEdges]
  );

  const addNode = (type: 'trigger' | 'action', label: string, extraData = {}) => {
    const id = Date.now().toString();
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label, ...extraData },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onSave = async () => {
    try {
      const payload = {
        name: workflowName,
        nodes,
        edges,
        // In a real app, we'd translate this graph to our internal TCA structure
        trigger: nodes.find(n => n.type === 'trigger')?.data.label,
        action: nodes.find(n => n.type === 'action')?.data.label,
      };
      await api.post('/workflows', payload);
      alert('Workflow saved successfully!');
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-950 flex flex-col overflow-hidden text-white font-sans">
      {/* Top Bar */}
      <div className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="text-primary h-6 w-6" />
          </div>
          <Input 
            value={workflowName} 
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent border-none text-xl font-bold focus-visible:ring-0 w-64 p-0 h-auto"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800">
            <Trash2 className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
            <Save className="mr-2 h-4 w-4" /> Save Workflow
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-zinc-800 bg-zinc-900/30 p-6 space-y-8 overflow-y-auto z-40">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Core Triggers</h3>
            <div className="grid gap-2">
              {[
                { label: 'Lead Created', icon: <UserPlus size={14} /> },
                { label: 'Deal Won', icon: <TrendingUp size={14} /> },
                { label: 'Incoming WhatsApp', icon: <MessageSquare size={14} /> },
              ].map((t, idx) => (
                <button 
                  key={idx}
                  onClick={() => addNode('trigger', t.label)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-sm group text-left"
                >
                  <div className="p-1.5 rounded bg-zinc-800 text-zinc-400 group-hover:text-blue-400">{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Super Actions</h3>
            <div className="grid gap-2">
              {[
                { label: 'Trigger n8n Webhook', icon: <Webhook size={14} />, type: 'WEBHOOK', url: 'https://n8n.your-crm.com/...' },
                { label: 'Send WhatsApp Notification', icon: <MessageSquare size={14} />, type: 'WHATSAPP' },
                { label: 'Create Dashboard Alert', icon: <Bell size={14} />, type: 'NOTIFICATION' },
                { label: 'Generate PDF Invoice', icon: <FileText size={14} />, type: 'INVOICE' },
              ].map((a, idx) => (
                <button 
                  key={idx}
                  onClick={() => addNode('action', a.label, { type: a.type, url: a.url })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-sm group text-left"
                >
                  <div className="p-1.5 rounded bg-zinc-800 text-zinc-400 group-hover:text-emerald-400">{a.icon}</div>
                  {a.label}
                </button>
              ))}
            </div>
          </section>

          <Card className="p-4 bg-zinc-800/30 border-blue-500/20 text-[11px] text-zinc-400 leading-relaxed shadow-none">
            <p className="flex items-start gap-2">
              <Plus className="text-blue-400 mt-0.5 flex-shrink-0" size={14} />
              Drag nodes to rearrange. Connect blue dots to green dots to establish a chain of command.
            </p>
          </Card>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:20px_20px] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="z-10"
          >
            <Background color="#27272a" />
            <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
            <MiniMap 
              nodeColor={(n) => n.type === 'trigger' ? '#3b82f6' : '#10b981'}
              maskColor="rgba(0, 0, 0, 0.5)"
              className="bg-zinc-900 border border-zinc-800"
            />
          </ReactFlow>

          <Panel position="top-right" className="mr-4 mt-4">
            <div className="flex gap-2 p-2 bg-zinc-900/80 backdrop-blur rounded-lg border border-zinc-800 shadow-xl">
              <Badge variant="outline" className="bg-zinc-950 text-[10px] text-zinc-400">
                <Brain className="mr-1 h-3 w-3 text-primary" /> AI Engine Ready
              </Badge>
              <Badge variant="outline" className="bg-zinc-950 text-[10px] text-zinc-400">
                <ArrowRight className="mr-1 h-3 w-3 text-emerald-400" /> Webhooks Enabled
              </Badge>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}


import { Bot, Zap, Eye, FileOutput, Workflow, Database, MessageSquare, BarChart3 } from 'lucide-react';
import { useState } from 'react';

const nodeTypes = [
  {
    type: 'trigger',
    icon: Zap,
    label: 'Input Trigger',
    description: 'Spouští celý workflow',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20'
  },
  {
    type: 'agent',
    icon: Bot,
    label: 'AI Agent',
    description: 'Základní výpočetní jednotka',
    color: 'text-ai-purple',
    bgColor: 'bg-ai-purple/20'
  },
  {
    type: 'debug',
    icon: Eye,
    label: 'Debug Probe',
    description: 'Sleduje mezivýstupy',
    color: 'text-ai-blue',
    bgColor: 'bg-ai-blue/20'
  },
  {
    type: 'output',
    icon: FileOutput,
    label: 'Output Gateway',
    description: 'Finalní výstupní formáty',
    color: 'text-ai-cyan',
    bgColor: 'bg-ai-cyan/20'
  },
  {
    type: 'workflow',
    icon: Workflow,
    label: 'Sub-Workflow',
    description: 'Vnořený agentní systém',
    color: 'text-green-400',
    bgColor: 'bg-green-400/20'
  },
  {
    type: 'database',
    icon: Database,
    label: 'Data Store',
    description: 'Ukládání mezivýsledků',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20'
  }
];

const Sidebar = () => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('nodeType', type);
    setDraggedItem(type);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="w-80 glass-card border-r border-white/10 p-6 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2 ai-gradient-text">Node Ecosystem</h2>
        <p className="text-sm text-muted-foreground">
          Přetáhněte komponenty na plátno pro vytvoření agentního systému
        </p>
      </div>

      <div className="space-y-3 flex-1">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              draggable
              onDragStart={(e) => handleDragStart(e, node.type)}
              onDragEnd={handleDragEnd}
              className={`p-4 rounded-lg border border-white/10 cursor-move transition-all duration-200 hover:scale-105 hover:border-white/20 ${
                node.bgColor
              } ${draggedItem === node.type ? 'opacity-50 scale-95' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${node.bgColor} border border-white/10`}>
                  <Icon className={`w-5 h-5 ${node.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-white">{node.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">
                    {node.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm">Real-time Metriky</h3>
          <BarChart3 className="w-4 h-4 text-ai-cyan" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Token Usage</span>
            <span className="text-ai-purple">1,247</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Avg. Latency</span>
            <span className="text-ai-blue">1.2s</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Success Rate</span>
            <span className="text-ai-cyan">98.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

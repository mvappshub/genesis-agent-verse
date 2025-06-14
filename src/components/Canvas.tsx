
import { useState, useRef, useCallback } from 'react';
import { Bot, Zap, Eye, FileOutput, Workflow, Database, Plus } from 'lucide-react';
import NodeConfigurationPanel from './NodeConfigurationPanel';

interface AIAgentData {
  label: string;
  description?: string;
  name: string;
  systemPrompt: string;
  model: 'GPT-4 Turbo' | 'Claude 3 Opus' | 'Gemini Pro' | string;
  temperature: number;
}

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Partial<AIAgentData> & { label: string; description?: string };
}

interface Connection {
  id: string;
  source: string;
  target: string;
}

interface ConnectionState {
  isActive: boolean;
  sourceNodeId: string | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
}

const getNodeIcon = (type: string) => {
  const icons = {
    trigger: Zap,
    agent: Bot,
    debug: Eye,
    output: FileOutput,
    workflow: Workflow,
    database: Database
  };
  return icons[type as keyof typeof icons] || Bot;
};

const getNodeColor = (type: string) => {
  const colors = {
    trigger: 'border-yellow-400 bg-yellow-400/10',
    agent: 'border-ai-purple bg-ai-purple/10',
    debug: 'border-ai-blue bg-ai-blue/10',
    output: 'border-ai-cyan bg-ai-cyan/10',
    workflow: 'border-green-400 bg-green-400/10',
    database: 'border-orange-400 bg-orange-400/10'
  };
  return colors[type as keyof typeof colors] || 'border-ai-purple bg-ai-purple/10';
};

const Canvas = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [configuringNodeId, setConfiguringNodeId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isActive: false,
    sourceNodeId: null,
    startPosition: null,
    currentPosition: null
  });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('nodeType');
    
    if (!nodeType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x, y },
      data: {
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        description: `Nový ${nodeType} uzel`,
        ...(nodeType === 'agent' && {
          name: `AI Agent ${Date.now()}`,
          systemPrompt: '',
          model: 'GPT-4 Turbo',
          temperature: 0.7
        })
      }
    };

    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleConnectorMouseDown = useCallback((e: React.MouseEvent, nodeId: string, connectorType: 'input' | 'output') => {
    e.stopPropagation();
    
    if (connectorType === 'output') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setConnectionState({
        isActive: true,
        sourceNodeId: nodeId,
        startPosition: { x, y },
        currentPosition: { x, y }
      });
    }
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectionState.isActive && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setConnectionState(prev => ({
        ...prev,
        currentPosition: { x, y }
      }));
    }
  }, [connectionState.isActive]);

  const handleConnectorMouseUp = useCallback((e: React.MouseEvent, nodeId: string, connectorType: 'input' | 'output') => {
    e.stopPropagation();
    
    if (connectionState.isActive && connectorType === 'input' && connectionState.sourceNodeId !== nodeId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        source: connectionState.sourceNodeId!,
        target: nodeId
      };

      setConnections(prev => [...prev, newConnection]);
    }

    setConnectionState({
      isActive: false,
      sourceNodeId: null,
      startPosition: null,
      currentPosition: null
    });
  }, [connectionState]);

  const handleCanvasMouseUp = useCallback(() => {
    setConnectionState({
      isActive: false,
      sourceNodeId: null,
      startPosition: null,
      currentPosition: null
    });
  }, []);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.type === 'agent') {
      setConfiguringNodeId(nodeId);
    }
  }, [nodes]);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<AIAgentData>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
  }, []);

  const getConnectorPosition = useCallback((nodeId: string, connectorType: 'input' | 'output') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const offsetX = connectorType === 'input' ? -8 : 200; // Aproximace šířky nodu
    return {
      x: node.position.x + offsetX,
      y: node.position.y
    };
  }, [nodes]);

  const renderNode = (node: Node) => {
    const Icon = getNodeIcon(node.type);
    const colorClass = getNodeColor(node.type);
    const isSelected = selectedNode === node.id;

    return (
      <div
        key={node.id}
        className={`absolute glass-card p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-w-48 ${colorClass} ${
          isSelected ? 'ring-2 ring-white/20 scale-105' : 'hover:scale-102'
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
        onDoubleClick={() => handleNodeDoubleClick(node.id)}
      >
        <div className="flex items-center space-x-3 mb-2">
          <Icon className="w-5 h-5 text-white" />
          <h3 className="font-medium text-white">{node.data.label}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{node.data.description}</p>
        
        {/* Connection points */}
        <div 
          className="absolute -left-2 top-1/2 transform -translate-y-1/2"
          data-node-id={node.id}
          data-connector-type="input"
          onMouseDown={(e) => handleConnectorMouseDown(e, node.id, 'input')}
          onMouseUp={(e) => handleConnectorMouseUp(e, node.id, 'input')}
        >
          <div className="node-connector" />
        </div>
        <div 
          className="absolute -right-2 top-1/2 transform -translate-y-1/2"
          data-node-id={node.id}
          data-connector-type="output"
          onMouseDown={(e) => handleConnectorMouseDown(e, node.id, 'output')}
          onMouseUp={(e) => handleConnectorMouseUp(e, node.id, 'output')}
        >
          <div className="node-connector" />
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    return connections.map(connection => {
      const sourcePos = getConnectorPosition(connection.source, 'output');
      const targetPos = getConnectorPosition(connection.target, 'input');

      return (
        <line
          key={connection.id}
          x1={sourcePos.x}
          y1={sourcePos.y}
          x2={targetPos.x}
          y2={targetPos.y}
          className="connection-line"
        />
      );
    });
  };

  const renderTemporaryConnection = () => {
    if (!connectionState.isActive || !connectionState.startPosition || !connectionState.currentPosition) {
      return null;
    }

    return (
      <line
        x1={connectionState.startPosition.x}
        y1={connectionState.startPosition.y}
        x2={connectionState.currentPosition.x}
        y2={connectionState.currentPosition.y}
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeDasharray="5,5"
        fill="none"
        opacity="0.7"
      />
    );
  };

  const configuringNode = configuringNodeId ? nodes.find(n => n.id === configuringNodeId) : null;

  return (
    <>
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative glass-card rounded-xl border border-white/10"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)
            `
          }}
        >
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}
            />
          </div>

          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            {renderConnections()}
            {renderTemporaryConnection()}
          </svg>

          {/* Render nodes */}
          {nodes.map(renderNode)}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="glass-card p-8 rounded-2xl border border-white/10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ai-purple/20 border border-ai-purple/30 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-ai-purple" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 ai-gradient-text">
                    Začněte vytvářet svůj agentní systém
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Přetáhněte komponenty z levého panelu na toto plátno pro vytvoření vašeho prvního multiagentního workflow
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Začněte s <span className="text-yellow-400">Input Trigger</span> uzlem
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <NodeConfigurationPanel
        isOpen={!!configuringNodeId}
        onClose={() => setConfiguringNodeId(null)}
        node={configuringNode}
        onUpdateNode={updateNodeData}
      />
    </>
  );
};

export default Canvas;

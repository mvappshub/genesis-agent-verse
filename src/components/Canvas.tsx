
import { useState, useRef, useCallback } from 'react';
import { Bot, Zap, Eye, FileOutput, Workflow, Database, Plus } from 'lucide-react';

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
  };
}

interface Connection {
  id: string;
  source: string;
  target: string;
}

interface ConnectionInProgress {
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
  const [connectionInProgress, setConnectionInProgress] = useState<ConnectionInProgress>({
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
        description: `Nový ${nodeType} uzel`
      }
    };

    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleConnectorMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const startPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setConnectionInProgress({
      isActive: true,
      sourceNodeId: nodeId,
      startPosition,
      currentPosition: startPosition
    });
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!connectionInProgress.isActive || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setConnectionInProgress(prev => ({
      ...prev,
      currentPosition
    }));
  }, [connectionInProgress.isActive]);

  const handleConnectorMouseUp = useCallback((e: React.MouseEvent, targetNodeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!connectionInProgress.isActive || !connectionInProgress.sourceNodeId) return;

    // Prevent connecting node to itself
    if (connectionInProgress.sourceNodeId === targetNodeId) {
      setConnectionInProgress({
        isActive: false,
        sourceNodeId: null,
        startPosition: null,
        currentPosition: null
      });
      return;
    }

    // Check if connection already exists
    const connectionExists = connections.some(conn => 
      (conn.source === connectionInProgress.sourceNodeId && conn.target === targetNodeId) ||
      (conn.source === targetNodeId && conn.target === connectionInProgress.sourceNodeId)
    );

    if (!connectionExists) {
      const newConnection: Connection = {
        id: `connection-${Date.now()}`,
        source: connectionInProgress.sourceNodeId,
        target: targetNodeId
      };

      setConnections(prev => [...prev, newConnection]);
    }

    setConnectionInProgress({
      isActive: false,
      sourceNodeId: null,
      startPosition: null,
      currentPosition: null
    });
  }, [connectionInProgress, connections]);

  const handleCanvasMouseUp = useCallback(() => {
    if (connectionInProgress.isActive) {
      setConnectionInProgress({
        isActive: false,
        sourceNodeId: null,
        startPosition: null,
        currentPosition: null
      });
    }
  }, [connectionInProgress.isActive]);

  const getNodeCenter = (node: Node) => {
    return {
      x: node.position.x,
      y: node.position.y
    };
  };

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
      >
        <div className="flex items-center space-x-3 mb-2">
          <Icon className="w-5 h-5 text-white" />
          <h3 className="font-medium text-white">{node.data.label}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{node.data.description}</p>
        
        {/* Connection points */}
        <div 
          className="absolute -left-2 top-1/2 transform -translate-y-1/2"
          onMouseDown={(e) => handleConnectorMouseDown(e, node.id)}
          onMouseUp={(e) => handleConnectorMouseUp(e, node.id)}
        >
          <div className="node-connector" />
        </div>
        <div 
          className="absolute -right-2 top-1/2 transform -translate-y-1/2"
          onMouseDown={(e) => handleConnectorMouseDown(e, node.id)}
          onMouseUp={(e) => handleConnectorMouseUp(e, node.id)}
        >
          <div className="node-connector" />
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    return connections.map(connection => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (!sourceNode || !targetNode) return null;

      const sourceCenter = getNodeCenter(sourceNode);
      const targetCenter = getNodeCenter(targetNode);

      return (
        <line
          key={connection.id}
          x1={sourceCenter.x}
          y1={sourceCenter.y}
          x2={targetCenter.x}
          y2={targetCenter.y}
          className="connection-line"
        />
      );
    });
  };

  const renderConnectionInProgress = () => {
    if (!connectionInProgress.isActive || !connectionInProgress.startPosition || !connectionInProgress.currentPosition) {
      return null;
    }

    return (
      <line
        x1={connectionInProgress.startPosition.x}
        y1={connectionInProgress.startPosition.y}
        x2={connectionInProgress.currentPosition.x}
        y2={connectionInProgress.currentPosition.y}
        stroke="url(#gradient)"
        strokeWidth={2}
        strokeDasharray="5,5"
        fill="none"
        opacity={0.7}
      />
    );
  };

  return (
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
          {renderConnectionInProgress()}
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
  );
};

export default Canvas;

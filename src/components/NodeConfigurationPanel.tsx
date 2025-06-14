
import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Bot } from 'lucide-react';

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

interface NodeConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  node: Node | null;
  onUpdateNode: (nodeId: string, newData: Partial<AIAgentData>) => void;
}

const NodeConfigurationPanel = ({ isOpen, onClose, node, onUpdateNode }: NodeConfigurationPanelProps) => {
  const [localData, setLocalData] = useState<Partial<AIAgentData>>({});

  useEffect(() => {
    if (node && node.type === 'agent') {
      setLocalData({
        name: node.data.name || `AI Agent ${Date.now()}`,
        systemPrompt: node.data.systemPrompt || '',
        model: node.data.model || 'GPT-4 Turbo',
        temperature: node.data.temperature || 0.7,
        label: node.data.label,
        description: node.data.description
      });
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onUpdateNode(node.id, localData);
      onClose();
    }
  };

  const handleFieldChange = (field: keyof AIAgentData, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!node || node.type !== 'agent') {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] glass-card border-l border-white/10">
        <SheetHeader className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-ai-purple/20 border border-ai-purple/30">
              <Bot className="w-5 h-5 text-ai-purple" />
            </div>
            <div>
              <SheetTitle className="ai-gradient-text">Konfigurace AI Agenta</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Nastavte parametry vašeho AI agenta
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Název Agenta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Název Agenta</label>
            <Input
              value={localData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Zadejte název agenta"
              className="bg-card/20 border-white/20 text-white placeholder:text-muted-foreground"
            />
          </div>

          {/* Systémový Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Systémový Prompt</label>
            <Textarea
              value={localData.systemPrompt || ''}
              onChange={(e) => handleFieldChange('systemPrompt', e.target.value)}
              placeholder="Zadejte systémový prompt pro agenta..."
              rows={6}
              className="bg-card/20 border-white/20 text-white placeholder:text-muted-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Definujte chování a kontext vašeho AI agenta
            </p>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">AI Model</label>
            <Select
              value={localData.model || 'GPT-4 Turbo'}
              onValueChange={(value) => handleFieldChange('model', value)}
            >
              <SelectTrigger className="bg-card/20 border-white/20 text-white">
                <SelectValue placeholder="Vyberte model" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/20">
                <SelectItem value="GPT-4 Turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="Claude 3 Opus">Claude 3 Opus</SelectItem>
                <SelectItem value="Gemini Pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Teplota */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Teplota</label>
              <span className="text-sm text-ai-cyan font-mono">
                {(localData.temperature || 0.7).toFixed(1)}
              </span>
            </div>
            <Slider
              value={[localData.temperature || 0.7]}
              onValueChange={(values) => handleFieldChange('temperature', values[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Konzervativní (0.0)</span>
              <span>Kreativní (1.0)</span>
            </div>
          </div>

          {/* Tlačítka */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-ai-purple hover:bg-ai-purple/80 text-white rounded-md transition-colors"
            >
              Uložit změny
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NodeConfigurationPanel;

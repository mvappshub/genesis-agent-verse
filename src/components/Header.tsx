
import { Brain, Settings, Play, Save, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="h-16 glass-card border-b border-white/10 flex items-center justify-between px-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-8 h-8 text-ai-purple animate-pulse-glow" />
          <h1 className="text-2xl font-bold ai-gradient-text">
            MultiAgent Studio
          </h1>
        </div>
        <div className="text-sm text-muted-foreground hidden md:block">
          Demokratizace tvorby multiagentních systémů
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" className="bg-transparent border-ai-purple text-ai-purple hover:bg-ai-purple hover:text-white">
          <Save className="w-4 h-4 mr-2" />
          Uložit
        </Button>
        <Button variant="outline" size="sm" className="bg-transparent border-ai-blue text-ai-blue hover:bg-ai-blue hover:text-white">
          <Play className="w-4 h-4 mr-2" />
          Spustit
        </Button>
        <Button variant="outline" size="sm" className="bg-transparent border-ai-cyan text-ai-cyan hover:bg-ai-cyan hover:text-white">
          <Share className="w-4 h-4 mr-2" />
          Sdílet
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;

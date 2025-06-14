
import { Activity, Zap, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatusBar = () => {
  return (
    <div className="h-12 glass-card border-t border-white/10 flex items-center justify-between px-6 text-sm">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-ai-purple" />
          <span className="text-muted-foreground">Status:</span>
          <span className="text-green-400 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Připraven
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-ai-blue" />
          <span className="text-muted-foreground">Uzly:</span>
          <span className="text-white">0/100</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-ai-cyan" />
          <span className="text-muted-foreground">Poslední spuštění:</span>
          <span className="text-white">Nikdy</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-xs text-muted-foreground">
          Runtime v2.1.0 | Memory: 4.2MB
        </div>
      </div>
    </div>
  );
};

export default StatusBar;

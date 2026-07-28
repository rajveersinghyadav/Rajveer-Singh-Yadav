import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { useAnalysis } from "../hooks/useAnalysis";
import { Settings2, ShieldAlert, Cpu, Bell, Database } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { isConnected } = useAnalysis();
  
  const [lotSize, setLotSize] = useState("0.01");
  const [sensitivity, setSensitivity] = useState(70);
  const [notifications, setNotifications] = useState(true);
  const [autoTrade, setAutoTrade] = useState(true);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pt-[65px] pb-[70px]">
      <TopBar isConnected={isConnected} />
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 text-primary">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono">Configuration</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">System Preferences</p>
          </div>
        </div>

        {/* Risk Management */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-warning">Risk Management</h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-mono text-muted-foreground">Default Lot Size</label>
              <input 
                type="number" 
                value={lotSize} 
                onChange={(e) => setLotSize(e.target.value)}
                step="0.01"
                min="0.01"
                className="bg-background border border-border rounded-md px-3 py-1 text-sm font-mono w-24 text-right outline-none focus:border-primary"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-sm font-mono text-muted-foreground">Auto-Trade Signals</label>
              <button 
                onClick={() => setAutoTrade(!autoTrade)}
                className={`w-12 h-6 rounded-full transition-colors relative ${autoTrade ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoTrade ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
          </div>
        </section>

        {/* AI Engine */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-primary">AI Engine Settings</h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-5">
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-mono text-muted-foreground">Signal Sensitivity</label>
                <span className="text-sm font-bold font-mono text-primary">{sensitivity}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={sensitivity}
                onChange={(e) => setSensitivity(parseInt(e.target.value))}
                className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-1">
                <span>More Signals</span>
                <span>Higher Accuracy</span>
              </div>
            </div>
            
          </div>
        </section>

        {/* System */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-widest">System Info</h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                <Bell className="w-4 h-4" /> Push Notifications
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-secondary'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-xs font-mono text-muted-foreground">Version</span>
              <span className="text-xs font-mono">v2.4.0-pro</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-muted-foreground">Data Source</span>
              <span className="text-xs font-mono">Binance WSS / OANDA (Sim)</span>
            </div>
            
          </div>
        </section>

      </div>

      <BottomNav />
    </div>
  );
}

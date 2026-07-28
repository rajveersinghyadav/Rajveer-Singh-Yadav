import { useAppStore } from "../lib/state";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { useAnalysis } from "../hooks/useAnalysis";
import { History as HistoryIcon, DollarSign } from "lucide-react";

export default function HistoryPage() {
  const { state } = useAppStore();
  const { isConnected } = useAnalysis();

  const INITIAL_DEPOSIT = 5000;
  const totalPnL = state.trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const balance = INITIAL_DEPOSIT + totalPnL;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pt-[65px] pb-[70px]">
      <TopBar isConnected={isConnected} />
      
      {/* Account Summary */}
      <div className="bg-card p-4 border-b border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Balance</div>
              <div className="text-xl font-bold font-mono">${balance.toFixed(2)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Total P&L</div>
            <div className={`text-lg font-bold font-mono ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalPnL > 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-background rounded-lg p-2 border border-border">
            <div className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Total Trades</div>
            <div className="font-mono font-bold text-sm">{state.trades.length}</div>
          </div>
          <div className="bg-background rounded-lg p-2 border border-border">
            <div className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest">Win Rate</div>
            <div className="font-mono font-bold text-sm">
              {state.trades.length > 0 
                ? `${Math.round((state.trades.filter(t => (t.pnl || 0) > 0).length / state.trades.filter(t => t.status === 'closed').length) * 100 || 0)}%`
                : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <HistoryIcon className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest">Trade History</h2>
        </div>

        {state.trades.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm font-mono py-10 border border-dashed border-border rounded-xl">
            No trades executed yet.<br/>
            <span className="text-[10px] opacity-70">Waiting for AI signals...</span>
          </div>
        ) : (
          state.trades.map(trade => (
            <div key={trade.id} className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
              {/* Left highlight strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${trade.type === 'BUY' ? 'bg-success' : 'bg-destructive'}`} />
              
              <div className="flex justify-between items-start pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-mono ${trade.type === 'BUY' ? 'text-success' : 'text-destructive'}`}>
                      {trade.type}
                    </span>
                    <span className="text-sm font-bold font-mono text-foreground">{trade.asset}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {new Date(trade.time).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-0.5">P&L</div>
                  {trade.status === 'open' ? (
                    <span className="text-xs font-mono text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20">OPEN</span>
                  ) : (
                    <span className={`text-sm font-bold font-mono ${trade.pnl && trade.pnl > 0 ? 'text-success' : 'text-destructive'}`}>
                      {trade.pnl! > 0 ? '+' : ''}${trade.pnl?.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/50 pl-2">
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase font-mono">Entry</div>
                  <div className="text-xs font-mono">{trade.entryPrice.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase font-mono">Close</div>
                  <div className="text-xs font-mono">{trade.closePrice ? trade.closePrice.toFixed(4) : '-'}</div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase font-mono">Lot Size</div>
                  <div className="text-xs font-mono">{trade.lotSize}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}

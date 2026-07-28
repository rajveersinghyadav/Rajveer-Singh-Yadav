import { useAppStore } from "../lib/state";
import { ASSETS } from "../lib/assets";
import { Link } from "wouter";

export function TopBar({ isConnected }: { isConnected: boolean }) {
  const { state, dispatch } = useAppStore();

  return (
    <div className="fixed top-0 left-0 right-0 h-[65px] bg-secondary/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-bold text-lg font-mono">
          RJ
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">RJAnalyser</span>
          <span className="text-[10px] text-primary leading-tight tracking-widest font-mono">AI ENGINE</span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <select 
          className="bg-card text-foreground border border-border rounded-md text-sm px-2 py-1 outline-none focus:ring-1 focus:ring-primary appearance-none font-mono"
          value={state.selectedAsset.symbol}
          onChange={(e) => dispatch({ type: 'SET_ASSET', payload: e.target.value })}
        >
          {ASSETS.map(a => (
            <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 bg-card/50 px-2 py-1 rounded-full border border-border">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success shadow-[0_0_8px_rgba(0,255,136,0.6)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
            {isConnected ? 'LIVE' : 'SIM'}
          </span>
        </div>
      </div>
    </div>
  );
}

import { useLocation } from "wouter";
import { useAppStore } from "../lib/state";
import { ASSETS } from "../lib/assets";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { useAnalysis } from "../hooks/useAnalysis";
import { Search } from "lucide-react";
import { useState } from "react";

export default function QuotesPage() {
  const { state, dispatch } = useAppStore();
  const [_, setLocation] = useLocation();
  const { isConnected } = useAnalysis(); // just for topbar status
  const [search, setSearch] = useState("");

  const categories = ['Crypto', 'Forex', 'Commodities', 'Indices'];

  const filteredAssets = ASSETS.filter(a => 
    a.symbol.toLowerCase().includes(search.toLowerCase()) || 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pt-[65px] pb-[70px]">
      <TopBar isConnected={isConnected} />
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm font-mono outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
        </div>

        {/* Categories */}
        {categories.map(cat => {
          const catAssets = filteredAssets.filter(a => a.category === cat);
          if (catAssets.length === 0) return null;
          
          return (
            <div key={cat} className="flex flex-col gap-2">
              <h2 className="text-[10px] text-primary uppercase font-mono tracking-widest px-1">{cat}</h2>
              <div className="flex flex-col gap-2">
                {catAssets.map(asset => {
                  const isSelected = state.selectedAsset.symbol === asset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        dispatch({ type: 'SET_ASSET', payload: asset.symbol });
                        setLocation("/");
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        isSelected ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold font-mono text-sm">{asset.symbol}</span>
                        <span className="text-xs text-muted-foreground">{asset.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {isSelected && (
                          <span className="text-[10px] text-primary font-mono bg-primary/20 px-2 py-0.5 rounded-sm">Selected</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}

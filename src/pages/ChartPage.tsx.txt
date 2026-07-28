import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "../lib/state";
import { useAnalysis } from "../hooks/useAnalysis";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { useTradingView } from "../lib/tradingview";
import { TIMEFRAMES } from "../lib/assets";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

export default function ChartPage() {
  const { state, dispatch } = useAppStore();
  const { analysis, candles, isConnected } = useAnalysis();
  const [_, setLocation] = useLocation();

  // Load TradingView
  useTradingView(state.selectedAsset.tvSymbol, state.timeframe, "tv_chart_container");

  const sparklineData = candles.slice(-20).map((c, i) => ({ index: i, close: c.close }));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col pt-[65px] pb-[70px] overflow-hidden">
      <TopBar isConnected={isConnected} />

      {/* Timeframes */}
      <div className="flex bg-card/80 border-b border-border py-1 px-2 gap-1 overflow-x-auto no-scrollbar">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => dispatch({ type: 'SET_TIMEFRAME', payload: tf })}
            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
              state.timeframe === tf 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Top 55% Chart */}
      <div className="h-[55vh] flex-shrink-0 relative bg-[#05070b] border-b border-border">
        <div id="tv_chart_container" className="absolute inset-0" />
      </div>

      {/* Bottom 45% AI Panel */}
      <div className="flex-1 overflow-y-auto bg-background p-3">
        {!analysis ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 animate-pulse">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest">Compiling Data...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Header / Signal */}
            <div className={`p-4 rounded-xl border flex items-center justify-between relative overflow-hidden ${
              analysis.signal === 'BUY' ? 'bg-success/10 border-success/30 pulse-green' : 
              analysis.signal === 'SELL' ? 'bg-destructive/10 border-destructive/30 pulse-red' : 
              'bg-secondary/50 border-border'
            }`}>
              {/* Sparkline Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke={analysis.signal === 'BUY' ? '#00ff88' : analysis.signal === 'SELL' ? '#ef4444' : '#8b949e'} 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col relative z-10">
                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-1">AI Signal</span>
                <span className={`text-3xl font-bold font-mono tracking-tighter ${
                  analysis.signal === 'BUY' ? 'text-success text-glow-green' : 
                  analysis.signal === 'SELL' ? 'text-destructive text-glow-red' : 
                  'text-muted-foreground'
                }`}>
                  {analysis.signal}
                </span>
              </div>
              
              <div className="flex flex-col items-end text-right relative z-10">
                <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-1">Confidence</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono">{analysis.confidence}%</span>
                </div>
                <div className="w-24 h-1.5 bg-background/50 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full ${analysis.signal === 'BUY' ? 'bg-success' : analysis.signal === 'SELL' ? 'bg-destructive' : 'bg-muted-foreground'}`}
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Trend" value={analysis.trend.state} sub={`${analysis.trend.strength}% Strength`} />
              <StatCard 
                label="Pressure" 
                value={`${analysis.buyers}% B`} 
                sub={`${analysis.sellers}% S`}
                color={analysis.buyers > analysis.sellers ? 'text-success' : analysis.sellers > analysis.buyers ? 'text-destructive' : ''}
              />
              <StatCard label="Target (TP1)" value={analysis.tp1.toFixed(5)} sub="Dynamic Target" />
              <StatCard label="Momentum" value={analysis.momentum.state.replace('Strong ', 'S. ').replace('Weak ', 'W. ')} sub={`${analysis.momentum.value > 0 ? '+' : ''}${analysis.momentum.value.toFixed(2)}%`} />
              <StatCard label="Volatility" value={analysis.volatility.state} sub={`Ratio: ${analysis.volatility.value.toFixed(3)}`} />
              <StatCard label="Stop Loss" value={analysis.stopLoss.toFixed(5)} sub={`Risk/Rwd: ${analysis.riskReward.toFixed(1)}`} />
            </div>

            {/* Reasoning */}
            <div className="mt-1 p-3 rounded-lg bg-card border border-border">
              <h3 className="text-[10px] text-primary uppercase font-mono tracking-widest mb-2">AI Engine Reasoning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {analysis.reason}
              </p>
              
              {(analysis.pattern !== 'No Pattern' || analysis.structure !== 'Neutral') && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {analysis.pattern !== 'No Pattern' && (
                    <span className="px-2 py-1 text-[9px] font-mono rounded bg-secondary text-secondary-foreground border border-border">
                      Pattern: {analysis.pattern}
                    </span>
                  )}
                  {analysis.structure !== 'Neutral' && (
                    <span className="px-2 py-1 text-[9px] font-mono rounded bg-secondary text-secondary-foreground border border-border">
                      Structure: {analysis.structure}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="flex flex-col bg-card p-2 rounded-lg border border-border">
      <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest mb-1 truncate">{label}</span>
      <span className={`text-sm font-bold font-mono truncate ${color || 'text-foreground'}`}>{value}</span>
      <span className="text-[9px] text-muted-foreground mt-0.5 truncate">{sub}</span>
    </div>
  );
}

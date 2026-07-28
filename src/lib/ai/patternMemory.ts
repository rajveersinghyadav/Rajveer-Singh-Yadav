/**
 * RJAnalyser AI — Self-Learning Pattern Memory Engine
 * Stores market patterns as the AI observes high-confidence signals.
 * Retrieves them with metadata for visual playback when the user asks.
 */

import type { Candle, AIAnalysis } from './engine';

export interface LearnedPattern {
  id: string;
  capturedAt: number;         // Unix ms timestamp
  asset: string;              // e.g. "BTCUSDT"
  timeframe: string;          // e.g. "15m"
  direction: 'UP' | 'DOWN';  // What the market did after this pattern
  signal: 'BUY' | 'SELL';
  patternName: string;        // Candlestick pattern name
  structure: string;          // BOS BULL, CHoCH, etc.
  confidence: number;         // 0-100
  trend: string;
  buyers: number;
  sellers: number;
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  candles: Candle[];          // Last 20 candles snapshot for visual rendering
  outcome?: 'WIN' | 'LOSS' | 'PENDING';
  pnlPercent?: number;
}

const STORAGE_KEY = 'rjanalyser_learned_patterns';
const MAX_PATTERNS = 100; // keep the last 100 unique patterns

function load(): LearnedPattern[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(patterns: LearnedPattern[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch {
    // storage full — prune oldest half
    const pruned = patterns.slice(-Math.floor(MAX_PATTERNS / 2));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  }
}

/** Snapshot a pattern when the AI fires a high-confidence signal */
export function learnPattern(
  asset: string,
  timeframe: string,
  candles: Candle[],
  analysis: AIAnalysis
): LearnedPattern | null {
  if (analysis.signal === 'WAIT' || analysis.confidence < 65) return null;

  const patterns = load();

  // Deduplicate: don't save the same signal for the same candle twice
  const lastCandle = candles[candles.length - 1];
  const duplicate = patterns.find(
    p => p.asset === asset && p.timeframe === timeframe && p.capturedAt === lastCandle.time * 1000
  );
  if (duplicate) return duplicate;

  const direction: 'UP' | 'DOWN' = analysis.signal === 'BUY' ? 'UP' : 'DOWN';

  const learned: LearnedPattern = {
    id: `${asset}-${timeframe}-${lastCandle.time}`,
    capturedAt: Date.now(),
    asset,
    timeframe,
    direction,
    signal: analysis.signal,
    patternName: analysis.pattern || 'No Pattern',
    structure: analysis.structure,
    confidence: analysis.confidence,
    trend: analysis.trend.state,
    buyers: analysis.buyers,
    sellers: analysis.sellers,
    entry: analysis.entry,
    stopLoss: analysis.stopLoss,
    tp1: analysis.tp1,
    tp2: analysis.tp2,
    candles: candles.slice(-20), // last 20 candles snapshot
    outcome: 'PENDING',
  };

  const next = [...patterns, learned].slice(-MAX_PATTERNS);
  save(next);
  return learned;
}

/** Update outcome once the trade resolves */
export function updatePatternOutcome(id: string, outcome: 'WIN' | 'LOSS', pnlPercent: number) {
  const patterns = load();
  const idx = patterns.findIndex(p => p.id === id);
  if (idx === -1) return;
  patterns[idx].outcome = outcome;
  patterns[idx].pnlPercent = pnlPercent;
  save(patterns);
}

/** Get all learned patterns, newest first */
export function getAllPatterns(): LearnedPattern[] {
  return load().reverse();
}

/** Get patterns filtered by direction */
export function getPatternsByDirection(direction: 'UP' | 'DOWN'): LearnedPattern[] {
  return load().filter(p => p.direction === direction).reverse();
}

/** Get a summary string for AI chat */
export function getLearningReport(): string {
  const all = load();
  if (all.length === 0) return 'I have not observed any confirmed patterns yet. Keep the app running and I will start learning from live market signals.';

  const bullish = all.filter(p => p.direction === 'UP');
  const bearish = all.filter(p => p.direction === 'DOWN');
  const wins = all.filter(p => p.outcome === 'WIN').length;
  const losses = all.filter(p => p.outcome === 'LOSS').length;
  const pending = all.filter(p => p.outcome === 'PENDING').length;

  const topPatterns = [...all]
    .reduce((acc: Record<string, number>, p) => {
      acc[p.patternName] = (acc[p.patternName] || 0) + 1;
      return acc;
    }, {});
  const top = Object.entries(topPatterns).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    `I have learned from **${all.length} market patterns** so far.\n\n` +
    `📈 Bullish setups observed: **${bullish.length}**\n` +
    `📉 Bearish setups observed: **${bearish.length}**\n` +
    `✅ Confirmed wins: **${wins}** | ❌ Losses: **${losses}** | ⏳ Pending: **${pending}**\n\n` +
    `Most common patterns I recognize:\n${top.map(([name, count]) => `• ${name} (${count}x)`).join('\n')}\n\n` +
    `Ask me **"show bullish patterns"** or **"show bearish patterns"** to see the charts.`
  );
}

/** Clear all learned data */
export function clearMemory() {
  localStorage.removeItem(STORAGE_KEY);
}

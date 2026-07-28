export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

export interface AIAnalysis {
  signal: 'BUY' | 'SELL' | 'WAIT';
  confidence: number;
  trend: { state: 'Bullish' | 'Bearish' | 'Sideways'; strength: number };
  buyers: number;
  sellers: number;
  momentum: { state: string; value: number };
  volatility: { state: string; value: number };
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  riskReward: number;
  reason: string;
  pattern: string;
  structure: string;
  timestamp: number;
}

export function getTrend(candles: Candle[]): { state: 'Bullish' | 'Bearish' | 'Sideways'; strength: number } {
  const recent = candles.slice(-20);
  if (recent.length === 0) return { state: 'Sideways', strength: 50 };
  
  let up = 0;
  let down = 0;
  recent.forEach(c => {
    if (c.close > c.open) up++;
    else if (c.close < c.open) down++;
  });
  
  if (up >= 14) return { state: 'Bullish', strength: Math.round((up / recent.length) * 100) };
  if (down >= 14) return { state: 'Bearish', strength: Math.round((down / recent.length) * 100) };
  return { state: 'Sideways', strength: 50 };
}

export function getBuyerSeller(candles: Candle[]) {
  const recent = candles.slice(-20);
  let buyerPower = 0;
  let sellerPower = 0;
  
  recent.forEach(c => {
    const range = c.high - c.low;
    if (range === 0) return;
    
    if (c.close > c.open) {
      buyerPower += (c.close - c.open) / range;
      buyerPower += (c.low === c.open ? 0 : (c.open - c.low) / range);
    } else {
      sellerPower += (c.open - c.close) / range;
      sellerPower += (c.high === c.open ? 0 : (c.high - c.open) / range);
    }
  });
  
  const total = buyerPower + sellerPower;
  if (total === 0) return { buyers: 50, sellers: 50, control: 'Balanced' };
  
  const buyers = Math.round((buyerPower / total) * 100);
  const sellers = Math.round((sellerPower / total) * 100);
  const control = buyers > 60 ? 'Buyers' : sellers > 60 ? 'Sellers' : 'Balanced';
  
  return { buyers, sellers, control };
}

export function getMomentum(candles: Candle[]) {
  if (candles.length < 10) return { state: 'Neutral', value: 0 };
  
  const last5 = candles.slice(-5);
  const prev5 = candles.slice(-10, -5);
  
  const last5Avg = last5.reduce((sum, c) => sum + c.close, 0) / 5;
  const prev5Avg = prev5.reduce((sum, c) => sum + c.close, 0) / 5;
  
  const diffPercent = ((last5Avg - prev5Avg) / prev5Avg) * 100;
  
  let state = 'Neutral';
  if (diffPercent > 0.3) state = 'Strong Bullish';
  else if (diffPercent > 0) state = 'Weak Bullish';
  else if (diffPercent < -0.3) state = 'Strong Bearish';
  else if (diffPercent < 0) state = 'Weak Bearish';
  
  return { state, value: diffPercent };
}

export function getVolatility(candles: Candle[]) {
  if (candles.length < 14) return { state: 'Low', value: 0 };
  const recent = candles.slice(-14);
  
  const atr = recent.reduce((sum, c) => sum + (c.high - c.low), 0) / 14;
  const avgClose = recent.reduce((sum, c) => sum + c.close, 0) / 14;
  const ratio = atr / avgClose;
  
  let state = 'Low';
  if (ratio > 0.02) state = 'High';
  else if (ratio > 0.01) state = 'Medium';
  
  return { state, value: ratio };
}

export function getConfidence(trend: any, pressure: any, momentum: any, volatility: any): number {
  let score = 0;
  
  // Trend (30%)
  if (trend.state === 'Bullish' || trend.state === 'Bearish') {
    score += 15 + (trend.strength / 100) * 15;
  } else {
    score += 15; // Sideways
  }
  
  // Pressure (30%)
  const dominant = Math.max(pressure.buyers, pressure.sellers);
  score += (dominant / 100) * 30;
  
  // Momentum (20%)
  if (momentum.state.includes('Strong')) score += 20;
  else if (momentum.state.includes('Weak')) score += 10;
  else score += 5;
  
  // Volatility (20%)
  if (volatility.state === 'High') score += 20;
  else if (volatility.state === 'Medium') score += 15;
  else score += 10;
  
  return Math.min(100, Math.round(score));
}

export function getPattern(candles: Candle[]): string {
  if (candles.length < 3) return "No Pattern";
  
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  const body = Math.abs(current.close - current.open);
  const range = current.high - current.low;
  
  if (range === 0) return "No Pattern";
  
  if (body < range * 0.1) return "Doji";
  
  const lowerWick = Math.min(current.open, current.close) - current.low;
  const upperWick = current.high - Math.max(current.open, current.close);
  
  if (lowerWick > body * 2 && upperWick < body * 0.5) return "Hammer";
  if (upperWick > body * 2 && lowerWick < body * 0.5) return "Shooting Star";
  
  const prevBody = Math.abs(prev.close - prev.open);
  if (body > prevBody * 1.5) {
    if (current.close > current.open && prev.close < prev.open) return "Bullish Engulfing";
    if (current.close < current.open && prev.close > prev.open) return "Bearish Engulfing";
  }
  
  return "No Pattern";
}

export function getMarketStructure(candles: Candle[], trend: any) {
  if (candles.length < 5) return { structure: 'Neutral', bos: 'None', choch: 'None' };
  
  const current = candles[candles.length - 1];
  const recentHigh = Math.max(...candles.slice(-5, -1).map(c => c.high));
  const recentLow = Math.min(...candles.slice(-5, -1).map(c => c.low));
  
  let bos = 'None';
  let choch = 'None';
  
  if (current.close > recentHigh) {
    bos = 'BOS BULL';
    if (trend.state === 'Bearish') choch = 'Bullish CHoCH';
  } else if (current.close < recentLow) {
    bos = 'BOS BEAR';
    if (trend.state === 'Bullish') choch = 'Bearish CHoCH';
  }
  
  return { structure: bos !== 'None' ? bos : 'Neutral', bos, choch };
}

export function getStopLoss(signal: 'BUY' | 'SELL' | 'WAIT', candles: Candle[], entry: number): number {
  if (signal === 'WAIT' || candles.length < 5) return entry;
  
  if (signal === 'BUY') {
    const lowest = Math.min(...candles.slice(-5).map(c => c.low));
    return lowest - (entry * 0.001);
  } else {
    const highest = Math.max(...candles.slice(-5).map(c => c.high));
    return highest + (entry * 0.001);
  }
}

export function getTargets(signal: 'BUY' | 'SELL' | 'WAIT', entry: number, stopLoss: number) {
  if (signal === 'WAIT' || entry === stopLoss) return { tp1: entry, tp2: entry, tp3: entry };
  
  const risk = Math.abs(entry - stopLoss);
  const dir = signal === 'BUY' ? 1 : -1;
  
  return {
    tp1: entry + (risk * 1.5 * dir),
    tp2: entry + (risk * 2.5 * dir),
    tp3: entry + (risk * 4.0 * dir)
  };
}

export function getRiskReward(entry: number, stopLoss: number, tp1: number, signal: string): number {
  if (signal === 'WAIT' || entry === stopLoss) return 0;
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(tp1 - entry);
  return risk === 0 ? 0 : reward / risk;
}

export function getReason(analysis: Partial<AIAnalysis>): string {
  const parts = [];
  
  if (analysis.trend?.state !== 'Sideways') {
    parts.push(`${analysis.trend?.state} trend detected with ${Math.max(analysis.buyers || 0, analysis.sellers || 0)}% ${analysis.buyers! > analysis.sellers! ? 'buyer' : 'seller'} dominance.`);
  } else {
    parts.push(`Market is consolidating with balanced forces.`);
  }
  
  if (analysis.momentum?.state.includes('Strong')) {
    parts.push(`Strong momentum confirms ${analysis.momentum.state.includes('Bullish') ? 'upward' : 'downward'} pressure.`);
  }
  
  if (analysis.structure !== 'Neutral') {
    parts.push(`${analysis.structure} detected indicating potential continuation.`);
  }
  
  if (analysis.pattern && analysis.pattern !== 'No Pattern') {
    parts.push(`${analysis.pattern} candlestick pattern formed.`);
  }
  
  if (analysis.signal !== 'WAIT' && analysis.tp1) {
    parts.push(`Primary target identified at ${analysis.tp1.toFixed(4)}.`);
  }
  
  return parts.join(' ');
}

export function runAnalysis(candles: Candle[]): AIAnalysis | null {
  if (!candles || candles.length < 20) return null;
  
  const current = candles[candles.length - 1];
  const entry = current.close;
  
  const trend = getTrend(candles);
  const pressure = getBuyerSeller(candles);
  const momentum = getMomentum(candles);
  const volatility = getVolatility(candles);
  
  const confidence = getConfidence(trend, pressure, momentum, volatility);
  const pattern = getPattern(candles);
  const structureData = getMarketStructure(candles, trend);
  
  // Determine Signal
  let signal: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  
  const isBullish = trend.state === 'Bullish' && pressure.buyers > 55;
  const isBearish = trend.state === 'Bearish' && pressure.sellers > 55;
  
  if (isBullish && momentum.state.includes('Bullish')) {
    signal = 'BUY';
  } else if (isBearish && momentum.state.includes('Bearish')) {
    signal = 'SELL';
  }
  
  // For simulated fast changing signals, we can slightly tweak it based on small confidence
  if (signal === 'WAIT' && confidence > 60) {
     if (pressure.buyers > pressure.sellers) signal = 'BUY';
     else if (pressure.sellers > pressure.buyers) signal = 'SELL';
  }
  
  if (confidence < 45) {
    signal = 'WAIT';
  }
  
  const stopLoss = getStopLoss(signal, candles, entry);
  const targets = getTargets(signal, entry, stopLoss);
  const riskReward = getRiskReward(entry, stopLoss, targets.tp1, signal);
  
  const analysis: Partial<AIAnalysis> = {
    signal, confidence, trend, 
    buyers: pressure.buyers, sellers: pressure.sellers,
    momentum, volatility, entry, stopLoss,
    tp1: targets.tp1, tp2: targets.tp2, tp3: targets.tp3,
    riskReward, pattern, structure: structureData.structure,
    timestamp: Date.now()
  };
  
  analysis.reason = getReason(analysis);
  
  return analysis as AIAnalysis;
}

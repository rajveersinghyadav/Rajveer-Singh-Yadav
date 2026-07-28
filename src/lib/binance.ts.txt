import { useState, useEffect, useRef, useCallback } from 'react';
import { Asset } from './assets';
import { Candle } from './ai/engine';

export async function fetchCandles(symbol: string, interval: string, limit: number = 100): Promise<Candle[]> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    
    return data.map((kline: any) => ({
      time: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5])
    }));
  } catch (err) {
    console.error("Failed to fetch Binance candles:", err);
    return [];
  }
}

// Generate deterministic random walk for simulated assets
function generateSimulatedCandles(seedStr: string, limit: number): Candle[] {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  let currentPrice = 100 + (random() * 1000);
  if (seedStr.includes('USDJPY')) currentPrice = 150;
  if (seedStr.includes('EURUSD')) currentPrice = 1.08;
  if (seedStr.includes('XAUUSD')) currentPrice = 2300;
  if (seedStr.includes('BTC')) currentPrice = 65000;
  
  const volatility = currentPrice * 0.002;
  const candles: Candle[] = [];
  
  const now = Date.now();
  let time = now - (limit * 15 * 60 * 1000);
  
  for (let i = 0; i < limit; i++) {
    const open = currentPrice;
    const move = (random() - 0.5) * volatility;
    const close = open + move;
    const high = Math.max(open, close) + (random() * volatility * 0.5);
    const low = Math.min(open, close) - (random() * volatility * 0.5);
    const volume = random() * 1000;
    
    candles.push({ time, open, high, low, close, volume });
    currentPrice = close;
    time += 15 * 60 * 1000;
  }
  
  return candles;
}

export function useLiveCandles(asset: Asset, interval: string) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  
  const isCrypto = asset.category === 'Crypto';
  
  useEffect(() => {
    let mounted = true;
    
    // Clear old candles
    setCandles([]);
    setIsConnected(false);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (isCrypto) {
      // 1. Fetch initial via REST
      fetchCandles(asset.symbol, interval).then(data => {
        if (mounted && data.length > 0) {
          setCandles(data);
          
          // 2. Open WebSocket
          const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${asset.symbol.toLowerCase()}@kline_${interval}`);
          wsRef.current = ws;
          
          ws.onopen = () => {
            if (mounted) setIsConnected(true);
          };
          
          ws.onmessage = (event) => {
            if (!mounted) return;
            const msg = JSON.parse(event.data);
            if (msg.e !== 'kline') return;
            
            const k = msg.k;
            const newCandle: Candle = {
              time: k.t,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v)
            };
            
            setCandles(prev => {
              if (prev.length === 0) return [newCandle];
              const copy = [...prev];
              const last = copy[copy.length - 1];
              
              if (last.time === newCandle.time) {
                // Update live candle
                copy[copy.length - 1] = newCandle;
              } else if (newCandle.time > last.time) {
                // New candle
                copy.push(newCandle);
                if (copy.length > 200) copy.shift();
              }
              return copy;
            });
            setLastUpdate(Date.now());
          };
          
          ws.onerror = () => setIsConnected(false);
          ws.onclose = () => setIsConnected(false);
        }
      });
    } else {
      // Simulated data
      const data = generateSimulatedCandles(asset.symbol, 100);
      setCandles(data);
      setIsConnected(false); // Render red dot for simulated
      setLastUpdate(Date.now());
      
      const timer = setInterval(() => {
        setCandles(prev => {
          const copy = [...prev];
          const last = { ...copy[copy.length - 1] };
          const volatility = last.close * 0.0005;
          const move = (Math.random() - 0.5) * volatility;
          last.close += move;
          last.high = Math.max(last.high, last.close);
          last.low = Math.min(last.low, last.close);
          copy[copy.length - 1] = last;
          return copy;
        });
        setLastUpdate(Date.now());
      }, 3000);
      
      return () => clearInterval(timer);
    }
    
    return () => {
      mounted = false;
      if (wsRef.current) wsRef.current.close();
    };
  }, [asset.symbol, interval, isCrypto]);

  return { candles, isConnected, lastUpdate };
}

import { useEffect, useMemo, useRef } from 'react';
import { useLiveCandles } from '../lib/binance';
import { runAnalysis } from '../lib/ai/engine';
import { useAppStore } from '../lib/state';

export function useAnalysis() {
  const { state, dispatch } = useAppStore();
  const { selectedAsset, timeframe } = state;
  
  const { candles, isConnected, lastUpdate } = useLiveCandles(selectedAsset, timeframe);
  
  const lastSignalRef = useRef<{ signal: string, time: number } | null>(null);
  const tradesSimulatedRef = useRef<Record<string, boolean>>({}); // Prevent multiple trades per signal timeframe

  const analysis = useMemo(() => {
    if (candles.length < 20) return null;
    return runAnalysis(candles);
  }, [candles, lastUpdate]);

  useEffect(() => {
    if (candles.length > 0) {
      dispatch({ type: 'SET_CANDLES', payload: candles });
    }
  }, [candles, dispatch]);

  useEffect(() => {
    dispatch({ type: 'SET_ANALYSIS', payload: analysis });
    
    // Trade execution logic
    if (analysis && analysis.signal !== 'WAIT' && analysis.confidence >= 70) {
      const currentCandle = candles[candles.length - 1];
      if (!currentCandle) return;
      
      const signalKey = `${selectedAsset.symbol}-${timeframe}-${currentCandle.time}-${analysis.signal}`;
      
      if (!tradesSimulatedRef.current[signalKey]) {
        tradesSimulatedRef.current[signalKey] = true;
        
        // Open Trade
        const tradeId = Math.random().toString(36).substring(7);
        const newTrade = {
          id: tradeId,
          time: Date.now(),
          asset: selectedAsset.symbol,
          type: analysis.signal as 'BUY' | 'SELL',
          lotSize: 0.01,
          entryPrice: analysis.entry,
          status: 'open' as const,
        };
        
        dispatch({ type: 'ADD_TRADE', payload: newTrade });
        
        // Simulate close after 5 minutes for UI demonstration
        setTimeout(() => {
          // Generate a fake PnL between -50 and +150
          const pnl = (Math.random() * 200) - 50;
          const closePrice = newTrade.entryPrice + (newTrade.type === 'BUY' ? pnl : -pnl) * 0.001; // Fake calc
          
          dispatch({ 
            type: 'UPDATE_TRADE', 
            payload: { 
              id: tradeId, 
              updates: { status: 'closed', pnl, closePrice } 
            } 
          });
        }, 5 * 60 * 1000); // 5 mins
      }
    }
  }, [analysis, dispatch, selectedAsset.symbol, timeframe, candles]);

  return { analysis, candles, isConnected, lastUpdate };
}

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Asset, getAssetBySymbol, Timeframe } from './assets';
import { AIAnalysis, Candle } from './ai/engine';

export interface Trade {
  id: string;
  time: number;
  asset: string;
  type: 'BUY' | 'SELL';
  lotSize: number;
  entryPrice: number;
  closePrice?: number;
  pnl?: number;
  status: 'open' | 'closed';
}

interface AppState {
  selectedAsset: Asset;
  timeframe: Timeframe;
  analysis: AIAnalysis | null;
  candles: Candle[];
  trades: Trade[];
}

type Action =
  | { type: 'SET_ASSET'; payload: string }
  | { type: 'SET_TIMEFRAME'; payload: Timeframe }
  | { type: 'SET_ANALYSIS'; payload: AIAnalysis | null }
  | { type: 'SET_CANDLES'; payload: Candle[] }
  | { type: 'ADD_TRADE'; payload: Trade }
  | { type: 'UPDATE_TRADE'; payload: { id: string; updates: Partial<Trade> } }
  | { type: 'LOAD_TRADES'; payload: Trade[] };

const initialState: AppState = {
  selectedAsset: getAssetBySymbol('BTCUSDT')!,
  timeframe: '15m',
  analysis: null,
  candles: [],
  trades: [],
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ASSET': {
      const asset = getAssetBySymbol(action.payload);
      return asset ? { ...state, selectedAsset: asset } : state;
    }
    case 'SET_TIMEFRAME':
      return { ...state, timeframe: action.payload };
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload };
    case 'SET_CANDLES':
      return { ...state, candles: action.payload };
    case 'ADD_TRADE': {
      const newTrades = [action.payload, ...state.trades];
      localStorage.setItem('rj_trades', JSON.stringify(newTrades));
      return { ...state, trades: newTrades };
    }
    case 'UPDATE_TRADE': {
      const newTrades = state.trades.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
      );
      localStorage.setItem('rj_trades', JSON.stringify(newTrades));
      return { ...state, trades: newTrades };
    }
    case 'LOAD_TRADES':
      return { ...state, trades: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const stored = localStorage.getItem('rj_trades');
    if (stored) {
      try {
        dispatch({ type: 'LOAD_TRADES', payload: JSON.parse(stored) });
      } catch (e) {
        console.error("Failed to parse trades", e);
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
}

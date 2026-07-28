export type AssetCategory = 'Crypto' | 'Forex' | 'Commodities' | 'Indices';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  tvSymbol: string;
}

export const ASSETS: Asset[] = [
  // Crypto
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', tvSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', tvSymbol: 'BINANCE:ETHUSDT' },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', tvSymbol: 'BINANCE:SOLUSDT' },
  { symbol: 'BNBUSDT', name: 'Binance Coin', category: 'Crypto', tvSymbol: 'BINANCE:BNBUSDT' },
  { symbol: 'XRPUSDT', name: 'XRP', category: 'Crypto', tvSymbol: 'BINANCE:XRPUSDT' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'Crypto', tvSymbol: 'BINANCE:DOGEUSDT' },
  
  // Forex
  { symbol: 'EURUSD', name: 'EUR/USD', category: 'Forex', tvSymbol: 'FX:EURUSD' },
  { symbol: 'GBPUSD', name: 'GBP/USD', category: 'Forex', tvSymbol: 'FX:GBPUSD' },
  { symbol: 'USDJPY', name: 'USD/JPY', category: 'Forex', tvSymbol: 'FX:USDJPY' },
  { symbol: 'AUDUSD', name: 'AUD/USD', category: 'Forex', tvSymbol: 'FX:AUDUSD' },
  
  // Commodities
  { symbol: 'XAUUSD', name: 'Gold', category: 'Commodities', tvSymbol: 'OANDA:XAUUSD' },
  { symbol: 'XAGUSD', name: 'Silver', category: 'Commodities', tvSymbol: 'OANDA:XAGUSD' },
  { symbol: 'USOIL', name: 'Crude Oil', category: 'Commodities', tvSymbol: 'TVC:USOIL' },
  
  // Indices
  { symbol: 'SPX500', name: 'S&P 500', category: 'Indices', tvSymbol: 'OANDA:SPX500USD' },
  { symbol: 'NAS100', name: 'Nasdaq 100', category: 'Indices', tvSymbol: 'OANDA:NAS100USD' },
  { symbol: 'UK100', name: 'FTSE 100', category: 'Indices', tvSymbol: 'OANDA:UK100GBP' },
];

export const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D'] as const;
export type Timeframe = typeof TIMEFRAMES[number];

export function getAssetBySymbol(symbol: string): Asset | undefined {
  return ASSETS.find(a => a.symbol === symbol);
}

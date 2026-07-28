import { useEffect, useRef, useState } from 'react';
import { AssetCategory } from './assets';

let tvScriptLoadingPromise: Promise<void> | null = null;

export function tvInterval(timeframe: string): string {
  const map: Record<string, string> = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1H': '60',
    '4H': '240',
    '1D': 'D'
  };
  return map[timeframe] || '15';
}

export function useTradingView(tvSymbol: string, interval: string, containerId: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    let isMounted = true;

    tvScriptLoadingPromise.then(() => {
      if (!isMounted) return;
      setIsLoaded(true);
      
      // Clean up previous widget
      if (widgetRef.current) {
        // TradingView doesn't provide a clean destroy method, so we clear the container
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = '';
      }
      
      if (typeof window !== 'undefined' && (window as any).TradingView) {
        widgetRef.current = new (window as any).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: tvInterval(interval),
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "#05070b", // Match app dark theme
          gridColor: "#11151c",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerId,
          hide_volume: true,
          disabled_features: [
            "header_symbol_search",
            "header_compare",
            "left_toolbar",
            "timeframes_toolbar" // We provide our own
          ]
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [tvSymbol, interval, containerId]);

  return { isLoaded };
}

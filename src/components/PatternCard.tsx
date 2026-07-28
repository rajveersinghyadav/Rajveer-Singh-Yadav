/**
 * PatternCard — renders a mini SVG candlestick chart for a learned pattern.
 * Used in AiChatPage when the user asks "what did you learn".
 */

import type { LearnedPattern } from '../lib/ai/patternMemory';

interface Props {
  pattern: LearnedPattern;
}

function MiniChart({ candles }: { candles: LearnedPattern['candles'] }) {
  const W = 160;
  const H = 80;
  const pad = 4;
  const cw = Math.floor((W - pad * 2) / candles.length);

  const highs = candles.map(c => c.high);
  const lows  = candles.map(c => c.low);
  const maxH  = Math.max(...highs);
  const minL  = Math.min(...lows);
  const range = maxH - minL || 1;

  const toY = (v: number) => pad + ((maxH - v) / range) * (H - pad * 2);

  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      {candles.map((c, i) => {
        const x    = pad + i * cw + cw / 2;
        const bull = c.close >= c.open;
        const openY  = toY(c.open);
        const closeY = toY(c.close);
        const highY  = toY(c.high);
        const lowY   = toY(c.low);
        const color  = bull ? '#22c55e' : '#ef4444';
        const bodyTop    = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 1);

        return (
          <g key={i}>
            {/* Wick */}
            <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth={0.8} opacity={0.6} />
            {/* Body */}
            <rect
              x={x - cw * 0.35}
              y={bodyTop}
              width={cw * 0.7}
              height={bodyHeight}
              fill={color}
              opacity={0.9}
              rx={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function PatternCard({ pattern }: Props) {
  const dirColor   = pattern.direction === 'UP' ? '#22c55e' : '#ef4444';
  const dirLabel   = pattern.direction === 'UP' ? '▲ BULLISH' : '▼ BEARISH';
  const outcomeColor =
    pattern.outcome === 'WIN'     ? '#22c55e'
    : pattern.outcome === 'LOSS'  ? '#ef4444'
    : '#888';
  const outcomeLabel =
    pattern.outcome === 'WIN'    ? '✅ WIN'
    : pattern.outcome === 'LOSS' ? '❌ LOSS'
    : '⏳ PENDING';

  const date = new Date(pattern.capturedAt).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{
      background: 'var(--card)',
      border: `1px solid ${dirColor}33`,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 8,
      minWidth: 200,
      maxWidth: 220,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        background: `${dirColor}15`,
        borderBottom: `1px solid ${dirColor}33`,
        padding: '6px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: dirColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}>
          {dirLabel}
        </span>
        <span style={{ color: '#888', fontSize: 9, fontFamily: 'monospace' }}>{pattern.asset}</span>
      </div>

      {/* Mini chart */}
      <div style={{ background: '#0a0e1a', padding: '4px 6px' }}>
        <MiniChart candles={pattern.candles} />
      </div>

      {/* Meta */}
      <div style={{ padding: '6px 10px', fontSize: 9, fontFamily: 'monospace', color: '#aaa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{pattern.patternName}</span>
          <span style={{ color: outcomeColor, fontWeight: 700 }}>{outcomeLabel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Conf: <span style={{ color: '#fff' }}>{pattern.confidence}%</span></span>
          <span>{pattern.timeframe}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ color: '#555' }}>{date}</span>
          <span style={{
            color: pattern.buyers > pattern.sellers ? '#22c55e' : '#ef4444',
            fontSize: 9
          }}>
            {pattern.buyers}%B / {pattern.sellers}%S
          </span>
        </div>
      </div>
    </div>
  );
}

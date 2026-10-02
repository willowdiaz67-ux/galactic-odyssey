import React, { useState } from 'react';
import { calculateTrend, generateSparklineCoordinates } from '../utils/colonySparklines';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ColonyResourceSparklineProps {
  label: string;
  icon?: React.ReactNode;
  data: number[];
  unit: string;
  color: string;
  width?: number;
  height?: number;
  compact?: boolean;
  subLabel?: string;
}

export const ColonyResourceSparkline: React.FC<ColonyResourceSparklineProps> = ({
  label,
  icon,
  data,
  unit,
  color,
  width = 180,
  height = 48,
  compact = false,
  subLabel
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Guarantee 5 data points
  const pointsData = data.length === 5 ? data : data.length > 5 ? data.slice(-5) : [...Array(5 - data.length).fill(data[0] || 0), ...data];

  const trend = calculateTrend(pointsData);
  const currentVal = pointsData[pointsData.length - 1] ?? 0;
  const initialVal = pointsData[0] ?? 0;

  const { points, pathD, areaD, minVal, maxVal } = generateSparklineCoordinates(
    pointsData,
    width,
    height,
    compact ? 4 : 8,
    compact ? 3 : 6
  );

  const gradientId = `sparkline-grad-${label.replace(/[^a-zA-Z0-9]/g, '')}-${color.replace('#', '')}`;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* End point pulse */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="2.5"
              fill={color}
              stroke="#04060C"
              strokeWidth="1"
            />
          )}
        </svg>

        <span
          className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
            trend.direction === 'up'
              ? 'text-emerald-400'
              : trend.direction === 'down'
              ? 'text-rose-400'
              : 'text-slate-400'
          }`}
        >
          {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
          {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
          {trend.direction === 'flat' && <Minus className="w-3 h-3" />}
          <span>{trend.formatted}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-md relative overflow-hidden group">
      {/* Background glow matching theme */}
      <div 
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full pointer-events-none opacity-10 blur-xl"
        style={{ backgroundColor: color }}
      />

      {/* Top Header: Label, Icon, and Current Value */}
      <div className="flex items-start justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          {icon && (
            <div 
              className="p-1.5 rounded-lg border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}40`,
                color: color
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-xs text-slate-200">
                {label}
              </span>
              {subLabel && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {subLabel}
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono font-bold mt-0.5" style={{ color: color }}>
              +{currentVal} <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
            </div>
          </div>
        </div>

        {/* 5-Cycle Trend Pill */}
        <div
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border shrink-0 ${
            trend.direction === 'up'
              ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
              : trend.direction === 'down'
              ? 'bg-rose-950/70 border-rose-700/60 text-rose-300'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
          title={`Динамика за 5 циклов: с ${initialVal} до ${currentVal} ${unit}`}
        >
          {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
          {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-rose-400" />}
          {trend.direction === 'flat' && <Minus className="w-3 h-3 text-slate-400" />}
          <span>{trend.formatted}</span>
        </div>
      </div>

      {/* Interactive SVG Sparkline */}
      <div className="relative mt-3 z-10 w-full flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-11 overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>

            {/* Subtle horizontal reference grid line */}
            <pattern id="sparkline-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <line x1="0" y1="5" x2="10" y2="5" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Baseline Reference Guide */}
          <line
            x1="8"
            y1={height - 6}
            x2={width - 8}
            y2={height - 6}
            stroke="rgba(148, 163, 184, 0.12)"
            strokeDasharray="2 2"
          />

          {/* Area Gradient Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Foreground Sparkline Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="filter drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]"
          />

          {/* Cycle Data Nodes */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            const isLatest = idx === points.length - 1;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Hit area for thumb / mouse */}
                <circle cx={p.x} cy={p.y} r="10" fill="transparent" />

                {/* Outer halo on latest or hovered */}
                {(isHovered || isLatest) && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? '6' : '4.5'}
                    fill={color}
                    opacity={isHovered ? 0.45 : 0.25}
                    className="transition-all"
                  />
                )}

                {/* Core Point */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? '3.5' : isLatest ? '3' : '2'}
                  fill={isHovered ? '#FFFFFF' : color}
                  stroke="#080C16"
                  strokeWidth="1.5"
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Value Indicator Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute -top-7 px-2 py-0.5 rounded bg-slate-900 border text-[10px] font-mono pointer-events-none shadow-lg z-30 transition-transform -translate-x-1/2 whitespace-nowrap animate-fade-in"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              borderColor: `${color}80`,
              color: '#FFFFFF'
            }}
          >
            <span className="text-slate-400 mr-1">{points[hoveredIndex].cycleLabel}:</span>
            <span className="font-bold" style={{ color }}>+{points[hoveredIndex].val} {unit}</span>
          </div>
        )}
      </div>

      {/* Cycle Labels along the bottom axis */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1 pt-1.5 border-t border-slate-900 z-10">
        <span>Цикл T-4</span>
        <span>T-3</span>
        <span>T-2</span>
        <span>T-1</span>
        <span className="font-bold text-slate-400">Тек. (T-0)</span>
      </div>
    </div>
  );
};

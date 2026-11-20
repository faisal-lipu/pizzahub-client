"use client";

import React, { useState } from "react";

export interface TrendDataPoint {
  label: string;
  value: number;
  formattedValue?: string;
}

interface TrendChartProps {
  title?: string;
  subtitle?: string;
  data: TrendDataPoint[];
  height?: number;
  lineColor?: string;
  fillColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export default function TrendChart({
  title,
  subtitle,
  data,
  height = 160,
  lineColor = "#D91E18",
  fillColor = "rgba(217, 30, 24, 0.12)",
  valuePrefix = "",
  valueSuffix = "",
}: TrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex items-center justify-center text-xs text-stone-400">
        No trend data available
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, 1);
  const range = maxVal - minVal || 1;

  const width = 500;
  const paddingX = 24;
  const paddingY = 24;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Calculate points
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * plotWidth;
    const normalizedY = (d.value - minVal) / range;
    const y = height - paddingY - normalizedY * plotHeight;
    return { x, y, ...d, index };
  });

  // Create SVG path string
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Bezier control points for smooth line
    const prev = points[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  // Area closed path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${
    points[0].x
  } ${height - paddingY} Z`;

  const totalValue = values.reduce((sum, v) => sum + v, 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between">
      {(title || subtitle) && (
        <div className="mb-2 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-black text-stone-900">{title}</h3>}
            {subtitle && (
              <p className="text-xs text-stone-500 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              {hoveredIdx !== null ? data[hoveredIdx].label : "Total Volume"}
            </span>
            <span className="text-sm font-black text-stone-900">
              {hoveredIdx !== null
                ? data[hoveredIdx].formattedValue ||
                  `${valuePrefix}${data[hoveredIdx].value}${valueSuffix}`
                : `${valuePrefix}${totalValue}${valueSuffix}`}
            </span>
          </div>
        </div>
      )}

      {/* SVG Container */}
      <div className="w-full relative py-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full overflow-visible"
          preserveAspectRatio="none"
          style={{ height }}
        >
          <defs>
            <linearGradient id={`trendGrad-${lineColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#F5F5F4"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#E7E5E4"
            strokeWidth="1"
          />

          {/* Gradient Area */}
          <path d={areaD} fill={`url(#trendGrad-${lineColor})`} />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Dots */}
          {points.map((p) => {
            const isHovered = hoveredIdx === p.index;
            return (
              <g
                key={p.label}
                onMouseEnter={() => setHoveredIdx(p.index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Hit area */}
                <circle cx={p.x} cy={p.y} r="12" fill="transparent" />

                {/* Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? "#fff" : lineColor}
                  stroke={lineColor}
                  strokeWidth={isHovered ? 3 : 1.5}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 pt-1 border-t border-stone-100">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <span
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`cursor-pointer transition-colors ${
                isHovered ? "text-stone-900 font-extrabold" : ""
              }`}
            >
              {item.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

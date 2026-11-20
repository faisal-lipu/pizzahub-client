"use client";

import React, { useState } from "react";

export interface BarData {
  label: string;
  value: number;
  color?: string;
  formattedValue?: string;
}

interface BarChartProps {
  title?: string;
  subtitle?: string;
  data: BarData[];
  height?: number;
  horizontal?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export default function BarChart({
  title,
  subtitle,
  data,
  height = 200,
  horizontal = false,
  valuePrefix = "",
  valueSuffix = "",
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (horizontal) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-base font-black text-stone-900">{title}</h3>}
            {subtitle && (
              <p className="text-xs text-stone-500 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
        )}

        <div className="space-y-3.5 py-1">
          {data.map((item, idx) => {
            const percent = Math.round((item.value / maxValue) * 100);
            const isHovered = hoveredIdx === idx;
            const barColor = item.color || "#D91E18";

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="space-y-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-bold truncate max-w-[200px] ${
                      isHovered ? "text-stone-900 font-extrabold" : "text-stone-700"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="font-black text-stone-900 shrink-0">
                    {item.formattedValue || `${valuePrefix}${item.value}${valueSuffix}`}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: barColor,
                      opacity: isHovered ? 1 : 0.85,
                      filter: isHovered ? "brightness(1.08)" : "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Bar Chart
  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between">
      {(title || subtitle) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-black text-stone-900">{title}</h3>}
            {subtitle && (
              <p className="text-xs text-stone-500 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          {hoveredIdx !== null && (
            <div className="text-right animate-in fade-in">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                {data[hoveredIdx]?.label}
              </span>
              <span className="text-sm font-black text-stone-900">
                {data[hoveredIdx]?.formattedValue ||
                  `${valuePrefix}${data[hoveredIdx]?.value}${valueSuffix}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Vertical Bars Container */}
      <div
        className="w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-stone-100"
        style={{ height }}
      >
        {data.map((item, idx) => {
          const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const isHovered = hoveredIdx === idx;
          const barColor = item.color || "#D91E18";

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative"
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-7 px-2 py-0.5 rounded-lg bg-stone-900 text-white text-[10px] font-bold whitespace-nowrap z-10 shadow-sm pointer-events-none">
                  {item.formattedValue || `${valuePrefix}${item.value}${valueSuffix}`}
                </div>
              )}

              {/* Bar */}
              <div className="w-full max-w-[40px] h-full flex items-end">
                <div
                  className="w-full rounded-t-xl transition-all duration-300 ease-out"
                  style={{
                    height: `${Math.max(heightPercent, 6)}%`,
                    backgroundColor: barColor,
                    opacity: isHovered ? 1 : 0.82,
                    transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center justify-between gap-2 pt-2 text-[11px] font-bold text-stone-400">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={item.label}
              className={`flex-1 text-center truncate px-0.5 transition-colors ${
                isHovered ? "text-stone-900 font-extrabold" : ""
              }`}
              title={item.label}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

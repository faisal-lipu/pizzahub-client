"use client";

import React, { useState } from "react";

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title?: string;
  subtitle?: string;
  data: DonutSlice[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({
  title,
  subtitle,
  data,
  centerLabel = "Total",
  centerValue,
  size = 180,
  strokeWidth = 24,
}: DonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute start/end offset for each slice
  let accumulatedPercent = 0;
  const slices = data.map((item, index) => {
    const percent = total > 0 ? item.value / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...item,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
      index,
    };
  });

  const displayCenterValue =
    centerValue !== undefined
      ? centerValue
      : hoveredIndex !== null
      ? data[hoveredIndex]?.value
      : total;

  const displayCenterLabel =
    hoveredIndex !== null ? data[hoveredIndex]?.label : centerLabel;

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between">
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-base font-black text-stone-900">{title}</h3>}
          {subtitle && (
            <p className="text-xs text-stone-500 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* Main Chart and Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto py-2">
        {/* SVG Donut */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F5F5F4"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Slices */}
            {total > 0 ? (
              slices.map((slice) => {
                const isHovered = hoveredIndex === slice.index;
                return (
                  <circle
                    key={slice.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })
            ) : (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#E7E5E4"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
            )}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-2xl font-black text-stone-900 tracking-tight">
              {displayCenterValue}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 truncate max-w-[100px]">
              {displayCenterLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full sm:w-auto flex-1 max-w-xs space-y-2.5">
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between text-xs py-1 px-2.5 rounded-xl cursor-pointer transition-all ${
                  isHovered ? "bg-stone-50 font-bold" : "text-stone-600"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate text-stone-700">{slice.label}</span>
                </div>
                <div className="flex items-center gap-2 pl-2 shrink-0">
                  <span className="font-bold text-stone-900">{slice.value}</span>
                  <span className="text-[10px] text-stone-400 font-semibold w-7 text-right">
                    {slice.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

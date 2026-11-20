import React from "react";
import { Loader2, Pizza } from "lucide-react";

/**
 * Global Next.js App Router Loading State
 * Requirement: Show a meaningful loader when fetching menu items, loading dashboard data, etc.
 */
export default function Loading() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#FAF8F5] px-4">
      <div className="text-center space-y-4">
        {/* Animated Pizza / Oven icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200/80 shadow-md flex items-center justify-center text-[#D91E18]">
            <Pizza className="w-8 h-8 animate-pulse stroke-[1.75]" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D91E18] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D91E18]"></span>
          </span>
        </div>

        <div>
          <h2 className="text-base font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#D91E18]" />
            <span>Loading PizzaHub...</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Baking fresh content from the woodfire oven...
          </p>
        </div>
      </div>
    </div>
  );
}

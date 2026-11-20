import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Pizza, Search } from "lucide-react";

/**
 * Custom 404 Not Found Page
 * Requirement: Handle invalid routes (custom 404 page)
 */
export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FAF8F5] px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6 bg-white p-8 sm:p-12 rounded-3xl border border-stone-200/90 shadow-sm">
        {/* Animated Pizza / 404 Graphic */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center text-[#D91E18] shadow-inner">
            <Pizza className="w-12 h-12 stroke-[1.75]" />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#D91E18] to-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
            404 Error
          </span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Slice Not Found!
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-2 leading-relaxed">
            Oops! The page or route you are looking for doesn&apos;t exist, was eaten, or has moved to another address.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Homepage</span>
          </Link>

          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Browse Pizza Menu</span>
          </Link>
        </div>

        <p className="text-[11px] text-stone-400 pt-2 border-t border-stone-100">
          Need help? Navigate through the top bar to visit your dashboard or view your active orders.
        </p>
      </div>
    </div>
  );
}

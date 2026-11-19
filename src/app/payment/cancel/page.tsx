"use client";

import React from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AlertCircle, ArrowLeft, ShoppingBag } from "lucide-react";

/**
 * Payment Cancel Page Component
 * Renders cancellation notification and recovery buttons
 */
function PaymentCancelContent() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-8 sm:p-10 text-center space-y-5">
        <div className="w-18 h-18 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Payment Cancelled
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-stone-900">
            Checkout Incomplete
          </h1>
          <p className="mt-2 text-sm text-stone-500 font-medium leading-relaxed">
            Your transaction was not completed and no payment was deducted from your card. You can review your basket and try again whenever you are ready.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/menu"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Return to Menu
          </Link>
          <Link
            href="/dashboard/customer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go to My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <ProtectedRoute>
      <PaymentCancelContent />
    </ProtectedRoute>
  );
}

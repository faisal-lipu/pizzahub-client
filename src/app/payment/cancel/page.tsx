"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AlertCircle, ArrowLeft, RefreshCw, Store, Crown } from "lucide-react";

function PaymentCancelContent() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-8 sm:p-10 text-center space-y-6">
        <div className="w-18 h-18 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
            Payment Cancelled
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Subscription Upgrade Incomplete
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
            Your Stripe checkout session was cancelled. No money was deducted from your account. Your vendor account remains on the Free Tier (maximum 3 active menu items).
          </p>
        </div>

        {/* Free Plan Status Reminder Box */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="font-bold text-stone-700">Current Plan:</span>
            <span className="font-extrabold text-stone-800 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
              Free Tier ($0/mo)
            </span>
          </div>
          <p className="text-stone-400 text-[11px]">
            You can publish up to 3 active menu items. Whenever you need unlimited publishing, you can upgrade anytime.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/dashboard/vendor?tab=subscription"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            <Crown className="w-4 h-4" />
            <span>Retry Upgrade to Premium ($19.99/mo)</span>
          </Link>
          <Link
            href="/dashboard/vendor"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Return to Vendor Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <ProtectedRoute allowedRoles={["vendor", "admin"]}>
      <PaymentCancelContent />
    </ProtectedRoute>
  );
}

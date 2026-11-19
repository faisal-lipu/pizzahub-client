"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CheckCircle2, ArrowRight, ShoppingBag, Receipt, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "tx_verified";

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-8 sm:p-10 text-center space-y-5">
        <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Payment Completed
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black text-stone-900">
            Thank You for Your Order!
          </h1>
          <p className="mt-2 text-sm text-stone-500 font-medium leading-relaxed">
            Your transaction has been securely processed by Stripe. The pizzeria kitchen has begun preparing your food.
          </p>
        </div>

        {/* Transaction Reference Box */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-left text-xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-400">
            <span>Reference ID</span>
            <Receipt className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <p className="font-mono font-bold text-stone-700 truncate">{sessionId}</p>
        </div>

        {/* Navigation Actions */}
        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/dashboard/customer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Track in My Orders
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/menu"
            className="w-full py-2.5 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
          >
            Browse More Pizzas
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D91E18]" />
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </ProtectedRoute>
  );
}

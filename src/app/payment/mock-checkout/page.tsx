"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowRight,
  Crown,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";

function MockCheckoutContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || `cs_test_mock_${Date.now()}`;
  const router = useRouter();
  const { user } = useAuth();

  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    try {
      setProcessing(true);
      await apiRequest("/api/payment/mock-confirm-payment", {
        method: "POST",
        data: { sessionId },
      });
      router.push(`/payment/success?session_id=${encodeURIComponent(sessionId)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to confirm payment.";
      toast.error(msg);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-stone-800 flex flex-col justify-between font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-white">
            <Image
              src="/pizzahub-logo.webp"
              alt="PizzaHub Logo"
              fill
              sizes="32px"
              className="object-contain"
            />
          </div>
          <span className="font-extrabold text-stone-900 tracking-tight text-base">
            Pizza<span className="text-[#D91E18]">Hub</span>
          </span>
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Stripe Checkout
          </span>
        </div>

        <Link
          href="/payment/cancel"
          className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
        >
          Cancel and return &times;
        </Link>
      </div>

      {/* Main Checkout Container */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1 flex items-center">
        <div className="w-full bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product & Price Breakdown */}
          <div className="bg-[#FAF8F5] p-6 sm:p-10 border-b md:border-b-0 md:border-r border-stone-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Vendor Subscription</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                  PizzaHub Premium Vendor Plan
                </h1>
                <p className="text-xs text-stone-500 mt-1">
                  Billed monthly. Cancel anytime from vendor dashboard.
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-stone-900">$19.99</span>
                  <span className="text-xs font-bold text-stone-500">/ month</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2.5 pt-3 border-t border-stone-200/70 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Unlimited active menu items</strong> (removes 3-item limit)</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Premium Chef Badge</strong> displayed on all pizzas</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Featured Homepage Showcase</strong> priority</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Audited Ledger Receipts</strong> in Admin Transactions</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Guaranteed 256-bit encrypted checkout via Stripe</span>
            </div>
          </div>

          {/* Right Column: Payment Details & Card Form */}
          <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-black text-stone-900">Payment Information</h2>
                <p className="text-xs text-stone-500 mt-0.5">Test mode card enabled for immediate evaluation</p>
              </div>

              {/* Card Inputs Simulation */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                    Card Number
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-sm">
                    <CreditCard className="w-4 h-4 text-blue-600 mr-2.5 shrink-0" />
                    <span className="font-bold text-stone-800">4242 •••• •••• 4242</span>
                    <span className="ml-auto text-[10px] font-bold uppercase text-stone-400 bg-white px-2 py-0.5 rounded border border-stone-200">
                      Visa Test
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      disabled
                      value="12 / 28"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-stone-800 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      disabled
                      value="•••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-stone-800 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || "Artisan Pizza Vendor"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-stone-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                    Billing Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="United States (US)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-medium text-stone-700 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={processing}
                onClick={handlePay}
                className="w-full py-3.5 px-6 rounded-full bg-[#635BFF] hover:bg-[#5851EA] text-white font-extrabold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay $19.99 & Upgrade to Premium</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/payment/cancel"
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  Cancel and return to PizzaHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-stone-400">
        Powered by <strong className="text-stone-600 font-bold">Stripe</strong> • Terms • Privacy
      </div>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={["vendor", "admin"]}>
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#635BFF]" />
          </div>
        }
      >
        <MockCheckoutContent />
      </Suspense>
    </ProtectedRoute>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import {
  CheckCircle2,
  Crown,
  ArrowRight,
  Store,
  PlusCircle,
  Receipt,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface VerificationResponse {
  success: boolean;
  message: string;
  transaction?: {
    _id?: string;
    amount?: number;
    currency?: string;
    stripeSessionId?: string;
    createdAt?: string;
  };
  user?: {
    subscriptionPlan?: "free" | "premium";
  };
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const { user, updateUser } = useAuth();

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<VerificationResponse["transaction"] | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifyPayment = async () => {
      if (!sessionId) {
        if (isMounted) {
          setError("No Stripe session ID detected in the verification URL.");
          setVerifying(false);
        }
        return;
      }

      try {
        setVerifying(true);
        const res = await apiRequest<VerificationResponse>("/api/payment/verify-session", {
          method: "POST",
          data: { sessionId },
        });

        if (!isMounted) return;

        if (res.success) {
          setVerified(true);
          setTransactionData(res.transaction || null);

          // Update AuthContext state and localStorage so the app immediately treats vendor as Premium
          updateUser({ subscriptionPlan: "premium" });
        } else {
          setError(res.message || "Payment verification was unsuccessful.");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to verify payment with Stripe.";
        setError(msg);
      } finally {
        if (isMounted) setVerifying(false);
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-8 sm:p-10 text-center space-y-6">
        {/* State 1: Verifying */}
        {verifying && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto text-[#D91E18]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">Verifying Payment Confirmation...</h2>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                Validating your Stripe transaction and activating Premium vendor privileges.
              </p>
            </div>
          </div>
        )}

        {/* State 2: Verification Error */}
        {!verifying && error && (
          <div className="py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Verification Issue
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-2">Could Not Verify Payment</h2>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
                {error}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/dashboard/vendor?tab=subscription"
                className="px-5 py-2.5 rounded-full bg-stone-900 text-white font-bold text-xs"
              >
                Back to Subscription
              </Link>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
              >
                Retry Verification
              </button>
            </div>
          </div>
        )}

        {/* State 3: Verified Success */}
        {!verifying && verified && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
              <Crown className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Payment Confirmation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Welcome to Premium, {user?.name || "Chef"}!
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1 leading-relaxed">
                Your Stripe payment was confirmed and your vendor account has been upgraded. You can now publish unlimited menu items!
              </p>
            </div>

            {/* Transaction Receipt Box */}
            <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/80 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <span className="font-extrabold uppercase tracking-wider text-stone-400 text-[10px]">
                  Subscription Plan
                </span>
                <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Vendor Premium ($19.99/mo)</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Publishing Limit:</span>
                <span className="font-bold text-emerald-700">Unlimited Active Items (Was 3)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Amount Charged:</span>
                <span className="font-black text-stone-900">$19.99 USD</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Payment Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed & Logged in Ledger</span>
                </span>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-stone-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-stone-400" />
                  <span>Stripe Reference:</span>
                </span>
                <span className="font-mono font-bold text-stone-600 truncate max-w-[200px]">
                  {sessionId}
                </span>
              </div>
            </div>

            {/* Perks Highlight Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border border-red-100 text-left text-xs flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white text-[#D91E18] shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-stone-800">Premium Perks Activated</p>
                <p className="text-[11px] text-stone-500">
                  Featured placement on homepage, verified chef badge, and zero item limits.
                </p>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/vendor?tab=add"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add 4th+ Menu Item</span>
              </Link>
              <Link
                href="/dashboard/vendor?tab=menu"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
              >
                <Store className="w-4 h-4" />
                <span>Vendor Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <ProtectedRoute allowedRoles={["vendor", "admin"]}>
      <Suspense
        fallback={
          <div className="min-h-[70vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#D91E18]" />
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </ProtectedRoute>
  );
}

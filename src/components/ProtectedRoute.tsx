"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"customer" | "vendor" | "admin">;
}

/**
 * ProtectedRoute Component
 * Prevents unauthorized access, enforces role security, and renders centered
 * beautiful warning modals when URL tampering or unauthorized access occurs.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);

  const isRoleUnauthorized = Boolean(
    !loading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)
  );

  // Auto redirect countdown if unauthorized role attempts manual URL manipulation
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    if (isRoleUnauthorized) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (user?.role === "admin") router.push("/dashboard/admin");
            else if (user?.role === "vendor") router.push("/dashboard/vendor");
            else router.push("/dashboard/customer");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, isAuthenticated, isRoleUnauthorized, user, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-[#D91E18] border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-600 font-bold text-sm">Verifying authorization...</p>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Blocked account warning modal
  if (user?.isBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/90 text-center transform transition-all scale-100 animate-in zoom-in-95 duration-150">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#D91E18] mb-4 shadow-xs">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-stone-900 tracking-tight">
            Account Restricted
          </h3>
          <p className="text-sm text-stone-500 font-medium mt-2 leading-relaxed">
            Your account has been suspended by an administrator. Please contact PizzaHub support for assistance.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full py-3.5 px-6 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role Access Violation Modal (Centered on screen with beautiful frosted styling)
  if (isRoleUnauthorized && user) {
    const targetDashboard =
      user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "vendor"
        ? "/dashboard/vendor"
        : "/dashboard/customer";

    const dashboardName =
      user.role === "admin"
        ? "Admin Dashboard"
        : user.role === "vendor"
        ? "Vendor Dashboard"
        : "Customer Dashboard";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/90 text-center transform transition-all scale-100 animate-in zoom-in-95 duration-150">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-black text-stone-900 tracking-tight">
            Access Restricted (Role Policy)
          </h3>

          <p className="text-sm text-stone-500 font-medium mt-2 leading-relaxed">
            You are signed in as a <span className="font-bold text-stone-900 capitalize px-1.5 py-0.5 rounded-md bg-stone-100">{user.role}</span>.
            Users cannot access other role dashboards by changing the URL manually.
          </p>

          <p className="text-xs text-stone-400 font-semibold mt-3">
            Redirecting to your authorized dashboard in {countdown}s...
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push(targetDashboard)}
              className="w-full py-3.5 px-6 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to My {dashboardName}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

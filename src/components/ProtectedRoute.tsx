"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"customer" | "vendor" | "admin">;
}

/**
 * ProtectedRoute Component
 * Prevents unauthorized access, avoids redirect-on-reload bugs, and enforces role security
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until session is retrieved from localStorage

    // Redirect unauthenticated visitors to sign-in
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    // Role verification: Prevent accessing dashboards of other roles
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else if (user.role === "vendor") {
        router.push("/dashboard/vendor");
      } else {
        router.push("/dashboard/customer");
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  // Meaningful pizza-themed loading state while session loads
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-600 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  // Account blocked alert
  if (user?.isBlocked) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Account Restricted</h2>
        <p className="text-stone-600 text-sm">
          Your account has been suspended by an administrator. Please contact support.
        </p>
      </div>
    );
  }

  // Render protected children if authenticated and permitted
  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}

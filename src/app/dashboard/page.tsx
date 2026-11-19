"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";

/**
 * Root Dashboard Dispatcher
 * Intelligently redirects user to their specific role dashboard
 */
function DashboardDispatcher() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user?.role === "admin") {
      router.replace("/dashboard/admin");
    } else if (user?.role === "vendor") {
      router.replace("/dashboard/vendor");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF8F5]">
      <Loader2 className="w-10 h-10 animate-spin text-[#D91E18]" />
      <p className="mt-3 text-sm font-bold text-stone-600">Loading your dashboard...</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardDispatcher />
    </ProtectedRoute>
  );
}

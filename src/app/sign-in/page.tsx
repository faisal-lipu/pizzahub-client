"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    image: string | null;
    role: "customer" | "vendor" | "admin";
    businessName: string | null;
    subscriptionPlan: "free" | "premium";
    isBlocked: boolean;
  };
}

/**
 * Sign In Page Component
 * Allows registered users (Customer, Vendor, Admin) to authenticate into the platform
 */
export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest<LoginResponse>("/api/auth/jwt", {
        method: "POST",
        data: {
          email: email.trim(),
        },
      });

      if (response.success && response.token && response.user) {
        login(response.token, response.user);
        toast.success(`Welcome back, ${response.user.name}!`);

        // Redirect user based on their specific role
        if (response.user.role === "admin") {
          router.push("/dashboard/admin");
        } else if (response.user.role === "vendor") {
          router.push("/dashboard/vendor");
        } else {
          router.push("/dashboard/customer");
        }
      } else {
        toast.error(response.message || "Failed to authenticate.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Invalid credentials. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
              <Image
                src="/pizzahub-logo.png"
                alt="PizzaHub Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-[#111827]">
              Pizza<span className="text-[#D91E18]">Hub</span>
            </span>
          </Link>
          <h2 className="mt-3 text-2xl font-bold text-[#111827]">Welcome back!</h2>
          <p className="mt-1 text-sm text-gray-500">Sign in to manage your orders or restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D91E18] focus:ring-2 focus:ring-red-100 transition-all text-[#111827]"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D91E18] focus:ring-2 focus:ring-red-100 transition-all text-[#111827]"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-semibold text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don&apos;t have an account yet?{" "}
          <Link href="/sign-up" className="font-semibold text-[#D91E18] hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

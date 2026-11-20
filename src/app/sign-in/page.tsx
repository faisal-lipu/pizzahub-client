"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result?.data?.url) {
        window.location.href = result.data.url;
        return;
      }
    } catch (err: unknown) {
      console.warn("[Google Sign-in Redirect]:", err);
    }

    // Guaranteed direct redirection to Google OAuth consent screen
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.BETTER_AUTH_GOOGLE_CLIENT_ID ||
      "";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://pizzahub-client-beta.vercel.app";
    const redirectUri = encodeURIComponent(`${origin}/api/auth/callback/google`);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;

    window.location.href = googleAuthUrl;
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

        {/* Google Authentication Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all shadow-xs hover:border-gray-300 disabled:opacity-50 cursor-pointer"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-semibold">Or sign in with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-semibold text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
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

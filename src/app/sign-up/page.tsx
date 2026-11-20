"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, User } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Lock,
  Store,
  Camera,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface RegisterResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
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
 * Sign Up Page Component
 * Conforms to assignment specs:
 * - Fields: Full Name, Email, Password, Profile Image (optional, can be skipped), Account Role
 * - Role selection: Vendor (Restaurant Owner) or Customer (Admin strictly prohibited)
 * - Password rules: minimum 6 characters, one uppercase letter, one lowercase letter
 * - Authentication: Email/password and Google authentication
 * - Feedback & Redirection: Toast notification and role-specific redirect
 */
export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Live password validation rules as required:
  // - Minimum 6 characters
  // - One uppercase letter
  // - One lowercase letter
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email address.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password must be at least 6 characters with uppercase and lowercase letters.");
      return;
    }

    if (role === "vendor" && !businessName.trim()) {
      toast.error("Please provide your Restaurant / Business Name.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest<RegisterResponse>("/api/auth/jwt", {
        method: "POST",
        data: {
          name: name.trim(),
          email: email.trim(),
          role,
          image: image.trim() || null, // Optional, can be skipped
          businessName: role === "vendor" ? businessName.trim() : null,
        },
      });

      if (response.success && response.token && response.user) {
        login(response.token, response.user);
        toast.success(`Welcome to PizzaHub, ${response.user.name}! Account registered successfully.`);

        if (response.user.role === "vendor") {
          router.push("/dashboard/vendor");
        } else {
          router.push("/dashboard/customer");
        }
      } else {
        toast.error(response.message || "Failed to create account.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);

      // Store chosen role in localStorage so it persists after Google OAuth callback
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_signup_role", role);
        if (role === "vendor" && businessName.trim()) {
          localStorage.setItem("pending_business_name", businessName.trim());
        }
      }

      // 1. Trigger Better Auth Google social authentication
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer",
      });

      if (result?.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err: unknown) {
      console.error("[Google Auth Error]:", err);
      toast.error("Google authentication failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          <h2 className="mt-3 text-2xl font-bold text-[#111827]">Create an Account</h2>
          <p className="mt-1 text-sm text-gray-500">Join PizzaHub food ordering platform</p>
        </div>

        {/* Google Authentication Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-semibold">Or register with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Selection: Vendor (Restaurant Owner) or Customer */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`py-3 px-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                  role === "customer"
                    ? "border-[#D91E18] bg-red-50 text-[#D91E18] shadow-xs"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`py-3 px-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                  role === "vendor"
                    ? "border-[#D91E18] bg-red-50 text-[#D91E18] shadow-xs"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
              >
                Vendor (Restaurant Owner)
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Faisal Lipu"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D91E18] text-[#111827]"
              />
              <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Vendor Business Name (Conditional for Vendors) */}
          {role === "vendor" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Restaurant / Business Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Artisan Woodfire Pizzeria"
                  required={role === "vendor"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D91E18] text-[#111827]"
                />
                <Store className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D91E18] text-[#111827]"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D91E18] text-[#111827]"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* Password Validation Checklist according to requirements:
                - minimum 6 characters
                - one uppercase letter
                - one lowercase letter */}
            <div className="mt-2.5 space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                {hasMinLength ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-stone-300 shrink-0" />
                )}
                <span className={hasMinLength ? "text-emerald-700 font-semibold" : ""}>
                  Minimum 6 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUppercase ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-stone-300 shrink-0" />
                )}
                <span className={hasUppercase ? "text-emerald-700 font-semibold" : ""}>
                  One uppercase letter (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasLowercase ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-stone-300 shrink-0" />
                )}
                <span className={hasLowercase ? "text-emerald-700 font-semibold" : ""}>
                  One lowercase letter (a-z)
                </span>
              </div>
            </div>
          </div>

          {/* Profile Image (Optional, can be skipped) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Profile Image
              </label>
              <span className="text-[11px] font-medium text-stone-400">
                (optional, can be skipped)
              </span>
            </div>
            <div className="relative">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D91E18] text-[#111827]"
              />
              <Camera className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Direct photo or ImgBB link. Leave empty if you don&apos;t have one right now.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[#D91E18] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

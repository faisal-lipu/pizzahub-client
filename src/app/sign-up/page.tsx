"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, User } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Lock,
  Store,
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

/**
 * Sign Up Page Component
 * Allows new users to create Customer or Vendor accounts with live password complexity validation
 */
export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);

  // Live password validation rules
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password must satisfy all security rules.");
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
          businessName: role === "vendor" ? businessName.trim() : null,
        },
      });

      if (response.success && response.token && response.user) {
        login(response.token, response.user);
        toast.success(`Welcome to PizzaHub, ${response.user.name}!`);

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
          <p className="mt-1 text-sm text-gray-500">Join the PizzaHub food ordering platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  role === "customer"
                    ? "border-[#D91E18] bg-red-50 text-[#D91E18]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  role === "vendor"
                    ? "border-[#D91E18] bg-red-50 text-[#D91E18]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Pizza Vendor
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

          {/* Vendor Business Name (Conditional) */}
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
                  required
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

            {/* Password Validation Checklist */}
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs text-gray-500">
              <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 font-medium" : ""}`}>
                {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                At least 6 characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-600 font-medium" : ""}`}>
                {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Uppercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-600 font-medium" : ""}`}>
                {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Lowercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-600 font-medium" : ""}`}>
                {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                At least 1 number
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-semibold text-sm transition-all shadow-md shadow-red-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Register Account
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

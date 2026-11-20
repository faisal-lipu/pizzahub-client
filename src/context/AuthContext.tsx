"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  image?: string | null;
  businessName?: string | null;
  phone?: string | null;
  address?: string | null;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpiresAt?: string | null;
  subscriptionStatus?: string;
  isBlocked?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isAuthenticated: boolean;
  authClient: typeof authClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load auth credentials from localStorage or Better Auth session on initial page load
  useEffect(() => {
    const syncAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setLoading(false);
          return;
        }

        // Check for active Better Auth session (e.g. following Google OAuth redirect)
        const sessionRes = await authClient.getSession().catch(() => null);
        if (sessionRes?.data?.user?.email) {
          const googleUser = sessionRes.data.user;
          const pendingRole = localStorage.getItem("pending_signup_role") || "customer";
          const pendingBiz = localStorage.getItem("pending_business_name") || "";

          // Import apiRequest dynamically or use fetch
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://pizzahub-server-seven.vercel.app";
          const res = await fetch(`${apiBase}/api/auth/jwt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: googleUser.email,
              name: googleUser.name,
              image: googleUser.image || null,
              role: pendingRole,
              businessName: pendingBiz,
            }),
          }).then((r) => r.json()).catch(() => null);

          if (res?.success && res.token && res.user) {
            setToken(res.token);
            setUser(res.user);
            localStorage.setItem("token", res.token);
            localStorage.setItem("user", JSON.stringify(res.user));
            localStorage.removeItem("pending_signup_role");
            localStorage.removeItem("pending_business_name");
          }
        }
      } catch (error) {
        console.error("[Auth Context] Failed to parse saved session:", error);
      } finally {
        setLoading(false);
      }
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("authStateChange", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authStateChange", syncAuth);
    };
  }, []);

  // Store credentials and update state on login
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    // Dispatch event to notify components like Navbar immediately
    window.dispatchEvent(new Event("authStateChange"));
  };

  // Remove credentials and redirect to sign-in on logout
  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear Better Auth session if present
    authClient.signOut().catch(() => {});

    window.dispatchEvent(new Event("authStateChange"));
    router.push("/sign-in");
  };

  // Update specific fields of current user (e.g. name, image, businessName)
  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    window.dispatchEvent(new Event("authStateChange"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: Boolean(token && user),
        authClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume authentication context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

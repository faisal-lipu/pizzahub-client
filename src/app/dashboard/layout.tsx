"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  Pizza,
  Store,
  PlusCircle,
  ShoppingBag,
  CreditCard,
  User,
  ShieldAlert,
  LogOut,
  Home,
  Menu as MenuIcon,
  X,
  Crown,
  ChevronRight,
  Settings,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Role-based navigation items
  const getNavLinks = () => {
    const role = user?.role || "customer";

    if (role === "vendor") {
      return [
        {
          label: "Overview",
          href: "/dashboard/vendor?tab=overview",
          icon: Store,
          active: pathname === "/dashboard/vendor",
        },
        {
          label: "My Menu Items",
          href: "/dashboard/vendor?tab=menu",
          icon: Pizza,
          active: pathname === "/dashboard/vendor" && false,
        },
        {
          label: "Add Menu Item",
          href: "/dashboard/vendor?tab=add",
          icon: PlusCircle,
          active: false,
        },
        {
          label: "Customer Orders",
          href: "/dashboard/vendor?tab=orders",
          icon: ShoppingBag,
          active: false,
        },
        {
          label: "Subscription",
          href: "/dashboard/vendor?tab=subscription",
          icon: CreditCard,
          active: false,
        },
      ];
    }

    if (role === "admin") {
      return [
        {
          label: "Admin Overview",
          href: "/dashboard/admin",
          icon: ShieldAlert,
          active: pathname === "/dashboard/admin",
        },
        {
          label: "Browse Menu",
          href: "/menu",
          icon: Pizza,
          active: pathname === "/menu",
        },
        {
          label: "Profile Settings",
          href: "/profile/settings",
          icon: Settings,
          active: pathname === "/profile/settings",
        },
      ];
    }

    // Default: Customer
    return [
      {
        label: "My Orders",
        href: "/dashboard/customer",
        icon: ShoppingBag,
        active: pathname === "/dashboard/customer",
      },
      {
        label: "Browse Menu",
        href: "/menu",
        icon: Pizza,
        active: pathname === "/menu",
      },
      {
        label: "Profile Settings",
        href: "/profile/settings",
        icon: User,
        active: pathname === "/profile/settings",
      },
    ];
  };

  const navLinks = getNavLinks();

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row">
        {/* Mobile Header with Hamburger Toggle */}
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D91E18] flex items-center justify-center text-white font-black text-sm shadow-sm">
              🍕
            </div>
            <span className="font-extrabold text-stone-900 tracking-tight text-base">PizzaHub</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar (Desktop Fixed & Mobile Drawer) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200/90 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static md:z-auto ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Top Brand & Profile */}
          <div className="p-6">
            {/* Logo */}
            <div className="flex items-center justify-between pb-6 border-b border-stone-100">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#D91E18] flex items-center justify-center text-white shadow-md shadow-red-500/20">
                  <Pizza className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-stone-900 text-lg tracking-tight block leading-tight">
                    PizzaHub
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Control Panel
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Logged-in User Profile Card */}
            <div className="mt-5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D91E18] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {user?.name || "Kitchen User"}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Role & Subscription Badge */}
              <div className="mt-2.5 pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#D91E18] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                  {user?.role || "Customer"}
                </span>

                {user?.role === "vendor" && (
                  user?.subscriptionPlan === "premium" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300">
                      <Crown className="w-3 h-3 text-amber-500" />
                      Premium
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      Free Plan
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 space-y-1.5">
              <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest px-3 mb-2">
                {user?.role?.toUpperCase()} MENU
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-100/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-stone-500 group-hover:text-[#D91E18] transition-colors" />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-600 transition-colors" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-stone-100 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              <Home className="w-4 h-4 text-stone-400" />
              <span>Back to Home</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

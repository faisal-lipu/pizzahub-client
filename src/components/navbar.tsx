"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  User as UserIcon,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import UserAvatar from "./UserAvatar";


/**
 * Modern floating split-pill Navbar component
 * Structure:
 * - Full-width outer wrapper with transparent gap between two pills
 * - Left Pill: Main Navigation with Logo & dynamic active-route links
 * - Right Pill: Action Bar with Search, Divider, Profile, and CTA button
 */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Autofocus input when search modal opens
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchModalOpen]);

  // Determine dashboard route based on user's assigned role
  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  // Handle pizza search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchModalOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Menu", href: "/menu" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const userName = user?.name || "Account";

  return (
    <>
      <header className="sticky top-0 z-50 w-full py-4 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* ========================================================
              LEFT PILL: Main Navigation
              Wide white pill container with Logo & Links
             ======================================================== */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 sm:px-8 py-2 flex items-center justify-between flex-1 max-w-4xl transition-all">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
              aria-label="PizzaHub Home"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/pizzahub-logo.png"
                  alt="PizzaHub Logo"
                  fill
                  sizes="(max-width: 640px) 40px, 44px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#111827]">
                Pizza<span className="text-[#D91E18]">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[15px] font-bold transition-colors ${
                      isActive
                        ? "text-[#D91E18] border-b-2 border-[#D91E18] pb-1"
                        : "text-[#1F2937] hover:text-[#D91E18]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Conditional Role Dashboard Link when Authenticated */}
              {isAuthenticated && (
                <Link
                  href={getDashboardHref()}
                  className={`text-[15px] font-bold transition-colors ${
                    pathname?.startsWith("/dashboard")
                      ? "text-[#D91E18] border-b-2 border-[#D91E18] pb-1"
                      : "text-[#1F2937] hover:text-[#D91E18]"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle Button (Inside Left Pill on Mobile) */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="p-1.5 rounded-full text-[#1F2937] hover:text-[#D91E18] hover:bg-gray-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* ========================================================
              RIGHT PILL: Action Bar
              Compact white pill container with Search, Divider, Profile, CTA
             ======================================================== */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-4 py-2 flex items-center gap-4 transition-all flex-shrink-0">
            {/* 1. Search Icon */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="text-[#4A1515] hover:scale-110 transition-transform p-1 cursor-pointer focus:outline-none"
              aria-label="Search pizza menu"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* 2. Divider */}
            <div className="h-5 w-[1px] bg-gray-200" aria-hidden="true" />

            {/* 3. Profile Icon / Reactive Dropdown */}
            <div className="relative flex items-center" ref={profileRef}>
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 text-[#D91E18] hover:scale-105 transition-transform p-0.5 cursor-pointer focus:outline-none"
                  aria-label="Open user profile menu"
                >
                  <UserAvatar
                    src={user.image}
                    name={userName}
                    size="xs"
                    className="border-red-200"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/sign-in")}
                  className="text-[#D91E18] hover:scale-110 transition-transform p-1 cursor-pointer focus:outline-none"
                  aria-label="User profile"
                >
                  <UserIcon className="w-5 h-5 stroke-[2.2]" />
                </button>
              )}

              {/* Profile Dropdown Menu (when authenticated) */}
              {profileDropdownOpen && isAuthenticated && user && (
                <div className="absolute right-0 top-full mt-3 w-60 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-[#111827] truncate">
                      {user.name || user.email}
                    </p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-50 text-[#D91E18] rounded-md border border-red-100">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href={getDashboardHref()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1F2937] hover:bg-gray-50 hover:text-[#D91E18] transition-colors font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1F2937] hover:bg-gray-50 hover:text-[#D91E18] transition-colors font-medium"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Profile Settings
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#D91E18] hover:bg-red-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-[#D91E18]" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. CTA Button: "Sign In" or "Dashboard" */}
            {isAuthenticated && user ? (
              <Link
                href={getDashboardHref()}
                className="hidden sm:inline-block bg-[#D91E18] hover:bg-[#B91C1C] text-white font-semibold px-6 py-2.5 rounded-l-2xl transition-colors text-sm shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="bg-[#D91E18] hover:bg-[#B91C1C] text-white font-semibold px-6 py-2.5 rounded-l-2xl transition-colors text-sm shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>

        {/* ========================================================
            Mobile Slide-down Navigation Menu
            Preserves floating pill aesthetic on mobile
           ======================================================== */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="space-y-1">
                {navLinks.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 rounded-xl text-base font-bold transition-colors ${
                        isActive
                          ? "text-[#D91E18] bg-red-50"
                          : "text-[#1F2937] hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {isAuthenticated && user ? (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="px-4 py-1">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-bold text-[#111827]">{userName}</p>
                    <span className="text-[10px] uppercase font-bold text-[#D91E18]">
                      Role: {user.role}
                    </span>
                  </div>
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-xl text-sm font-medium text-[#1F2937] hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-xl text-sm font-medium text-[#1F2937] hover:bg-gray-50"
                  >
                    Profile Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-[#D91E18] hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2 grid grid-cols-2 gap-3 border-t border-gray-100">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-full border border-gray-200 font-semibold text-[#1F2937] text-sm hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-full bg-[#D91E18] text-white font-semibold text-sm shadow-sm hover:bg-[#B91C1C]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          Search Modal Dialog
          Triggered by Search Icon in the Right Pill
         ======================================================== */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 w-full max-w-lg animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm font-bold text-[#111827]">Search PizzaHub</span>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close search modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pizzas by name, topping, or category..."
                  className="w-full pl-11 pr-24 py-3 rounded-full bg-gray-50 border border-gray-200 text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:border-[#D91E18] focus:bg-white transition-all"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#D91E18] hover:bg-[#B91C1C] text-white px-4 rounded-full text-xs font-semibold transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

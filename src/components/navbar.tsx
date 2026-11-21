"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Crown,
  Heart,
  ChevronDown,
  ShoppingBag,
  PlusCircle,
  Pizza,
  Users as UsersIcon,
  CreditCard,
  LogIn,
  UserPlus,
} from "lucide-react";
import UserAvatar from "./UserAvatar";
import ThemeToggle from "./ThemeToggle";
import { getFavoriteItems } from "@/lib/favorites";
import { toast } from "sonner";

/**
 * PizzaHub Navigation Bar Component
 * Implements:
 * 1. Brand Logo linking to homepage (/)
 * 2. Public Navigation (Logged Out State): Home, Browse Menu, Sign In, Sign Up
 * 3. Authenticated Navigation: Role-based dynamic navigation (Customer, Vendor, Admin)
 * 4. Profile Dropdown with Avatar + Name trigger, full details, Dashboard, Settings, Logout
 * 5. Immediate Auth State Synchronization without full-page reloads
 */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, loading } = useAuth();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync scroll position for sticky glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync favorites badge count
  useEffect(() => {
    setFavCount(getFavoriteItems().length);
    const onSync = () => setFavCount(getFavoriteItems().length);
    window.addEventListener("pizzahub_favorites_updated", onSync);
    return () => window.removeEventListener("pizzahub_favorites_updated", onSync);
  }, []);

  // Immediate Auth state change listener
  useEffect(() => {
    const handleAuthChange = () => {
      // Closes dropdown immediately upon auth state changes
      setProfileDropdownOpen(false);
      setMobileMenuOpen(false);
    };
    window.addEventListener("authStateChange", handleAuthChange);
    return () => window.removeEventListener("authStateChange", handleAuthChange);
  }, []);

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

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    toast.success("Signed out successfully. Come back soon!");
  };

  // Generate dynamic navigation links based on user authentication state and role
  const getNavLinks = () => {
    // Base links always present
    const links = [
      { label: "Home", href: "/" },
      { label: "Browse Menu", href: "/menu" },
    ];

    if (!isAuthenticated || !user) {
      // Public / Logged Out navigation
      links.push(
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" }
      );
      return links;
    }

    // Role-specific dynamic navigation links when Logged In
    const role = user.role;

    if (role === "customer") {
      links.push(
        { label: "My Orders", href: "/dashboard/customer?tab=orders" },
        { label: "Wishlist", href: "/wishlist" }
      );
    } else if (role === "vendor") {
      links.push(
        { label: "Orders", href: "/dashboard/vendor?tab=orders" }
      );
    } else if (role === "admin") {
      links.push(
        { label: "Manage Users", href: "/dashboard/admin?tab=users" },
        { label: "All Pizzas", href: "/dashboard/admin?tab=pizzas" },
        { label: "Transactions", href: "/dashboard/admin?tab=transactions" }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();
  const userName = user?.name || "Account";

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 px-4 sm:px-6 lg:px-8 max-w-full ${
          isScrolled
            ? "py-2 sm:py-2.5 backdrop-blur-md bg-[#FAF8F5]/85 dark:bg-[#0c0a09]/85 shadow-xs border-b border-stone-200/50 dark:border-stone-800/50"
            : "py-3 sm:py-4 bg-transparent"
        }`}
      >
        {/* ========================================================
            DESKTOP NAVBAR (md and above): Floating Split-Pill Design
           ======================================================== */}
        <nav className="hidden md:flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          {/* LEFT PILL: Main Navigation */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 px-6 sm:px-8 py-2 flex items-center justify-between flex-1 transition-all">
            {/* 1. Brand Logo / Name linking to / */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              aria-label="PizzaHub Home"
            >
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 transition-transform group-hover:scale-105 bg-stone-100 dark:bg-stone-800">
                <Image
                  src="/pizzahub-logo.webp"
                  alt="PizzaHub Logo"
                  fill
                  sizes="(max-width: 640px) 40px, 44px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#111827] dark:text-stone-100">
                Pizza<span className="text-[#D91E18]">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-6 lg:gap-7 pr-20 lg:pr-28">
              {navLinks.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      (item.href !== "/" && pathname?.startsWith(item.href) && !item.href.includes("?"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[14px] lg:text-[15px] font-bold transition-colors whitespace-nowrap ${
                      isActive
                        ? "text-[#D91E18] border-b-2 border-[#D91E18] pb-0.5"
                        : "text-[#1F2937] dark:text-stone-300 hover:text-[#D91E18] dark:hover:text-[#D91E18]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT PILL: Action Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200/80 dark:border-stone-800 px-4 py-2 flex items-center gap-3 transition-all shrink-0">
            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="text-stone-700 dark:text-stone-300 hover:text-[#D91E18] hover:scale-110 transition-transform p-1 cursor-pointer focus:outline-hidden"
              aria-label="Search pizza menu"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Wishlist Icon with Live Badge */}
            <Link
              href="/wishlist"
              className="relative text-stone-700 dark:text-stone-300 hover:text-[#D91E18] hover:scale-110 transition-transform p-1 cursor-pointer focus:outline-hidden"
              title="My Wishlist"
              aria-label="View Wishlist"
            >
              <Heart className={`w-5 h-5 stroke-[2.2] ${favCount > 0 ? "fill-[#D91E18] text-[#D91E18]" : ""}`} />
              {favCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D91E18] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Dark / Light Mode Toggle */}
            <ThemeToggle />

            {/* Vertical Divider */}
            <div className="h-5 w-[1px] bg-stone-200 dark:bg-stone-800" aria-hidden="true" />

            {/* AUTH STATE SECTION: Public vs Authenticated Profile Dropdown */}
            {isAuthenticated && user ? (
              /* Authenticated State: Profile Dropdown (Avatar + Name Trigger) */
              <div className="relative flex items-center" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-all cursor-pointer focus:outline-hidden group"
                  aria-label="Open user profile menu"
                >
                  <UserAvatar
                    src={user.image}
                    name={userName}
                    size="sm"
                    isPremium={user.subscriptionPlan === "premium"}
                    className="border-red-200"
                  />
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate max-w-[120px]">
                    {userName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 py-2 divide-y divide-stone-100 dark:divide-stone-800 animate-in fade-in zoom-in-95 duration-100 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                            {user.name || "PizzaHub User"}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                            {user.email}
                          </p>
                          <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-50 dark:bg-red-950/60 text-[#D91E18] rounded-md border border-red-100 dark:border-red-900/60">
                            {user.role} Account
                          </span>
                        </div>

                        {user.subscriptionPlan === "premium" && (
                          <div className="shrink-0 mt-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black shadow-xs">
                              <Crown className="w-3 h-3 fill-amber-200 text-amber-200" />
                              <span>Premium</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nav Links */}
                    <div className="py-1">
                      <Link
                        href={getDashboardHref()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-[#D91E18] dark:hover:text-[#D91E18] transition-colors font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-stone-400" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        href="/profile/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-[#D91E18] dark:hover:text-[#D91E18] transition-colors font-semibold"
                      >
                        <Settings className="w-4 h-4 text-stone-400" />
                        <span>Profile Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#D91E18] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left font-bold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#D91E18]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public / Logged Out State: "Sign In" and "Sign Up" Links */
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="text-stone-700 dark:text-stone-200 hover:text-[#D91E18] dark:hover:text-[#D91E18] font-bold text-sm px-3 py-1.5 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-md shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* ========================================================
            MOBILE NAVBAR (< md): Unified Single Floating Pill
            100% width, zero horizontal overflow, centered on screen
           ======================================================== */}
        <div className="md:hidden bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200/90 dark:border-stone-800 px-3.5 py-2 flex items-center justify-between w-full max-w-full">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0"
            aria-label="PizzaHub Home"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-800">
              <Image
                src="/pizzahub-logo.webp"
                alt="PizzaHub Logo"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">
              Pizza<span className="text-[#D91E18]">Hub</span>
            </span>
          </Link>

          {/* Action Icons Cluster: Search, Wishlist, Theme, Profile/Sign In, Drawer Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="p-1.5 rounded-full text-stone-600 dark:text-stone-300 hover:text-[#D91E18] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Search pizza menu"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Mobile Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative p-1.5 rounded-full text-stone-600 dark:text-stone-300 hover:text-[#D91E18] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="My Wishlist"
              aria-label="View Wishlist"
            >
              <Heart className={`w-5 h-5 stroke-[2.2] ${favCount > 0 ? "fill-[#D91E18] text-[#D91E18]" : ""}`} />
              {favCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#D91E18] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Mobile Theme Toggle */}
            <ThemeToggle className="w-8 h-8" />

            {/* User Profile Avatar or Sign In button */}
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-0.5 rounded-full hover:scale-105 transition-transform"
                title="User Menu"
              >
                <UserAvatar
                  src={user.image}
                  name={userName}
                  size="sm"
                  isPremium={user.subscriptionPlan === "premium"}
                />
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="text-xs font-bold text-[#D91E18] bg-red-50 dark:bg-red-950/60 hover:bg-red-100 px-2.5 py-1.5 rounded-full border border-red-100 dark:border-red-900/60 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Hamburger / Close Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ========================================================
            MOBILE MENU DRAWER OVERLAY
           ======================================================== */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 max-w-full">
            <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200/90 dark:border-stone-800 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Authenticated User Header Card */}
              {isAuthenticated && user && (
                <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 flex items-center justify-between border border-stone-200/60 dark:border-stone-700/60">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={user.image}
                      name={userName}
                      size="md"
                      isPremium={user.subscriptionPlan === "premium"}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                        {userName}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {user.email}
                      </p>
                      <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-50 dark:bg-red-950/60 text-[#D91E18] rounded-md border border-red-100 dark:border-red-900/60">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {user.subscriptionPlan === "premium" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black shadow-xs shrink-0">
                      <Crown className="w-3 h-3 fill-amber-200 text-amber-200" />
                      <span>Premium</span>
                    </span>
                  )}
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-1">
                {navLinks.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href ||
                        (item.href !== "/" && pathname?.startsWith(item.href) && !item.href.includes("?"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2.5 rounded-xl text-base font-bold transition-colors ${
                        isActive
                          ? "text-[#D91E18] bg-red-50 dark:bg-red-950/40"
                          : "text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Theme Mode Toggle Row */}
              <div className="border-t border-stone-100 dark:border-stone-800 pt-3 flex items-center justify-between px-4 py-1">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Appearance Mode</span>
                <ThemeToggle />
              </div>

              {/* Auth Status Actions */}
              {isAuthenticated && user ? (
                <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2">
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <LayoutDashboard className="w-4 h-4 text-stone-400" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/profile/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <Settings className="w-4 h-4 text-stone-400" />
                    <span>Profile Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold text-[#D91E18] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-[#D91E18]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                /* Logged Out Buttons: Sign In and Sign Up */
                <div className="pt-2 grid grid-cols-2 gap-3 border-t border-stone-100 dark:border-stone-800">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-full border border-stone-200 dark:border-stone-700 font-bold text-stone-700 dark:text-stone-200 text-sm hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-full bg-[#D91E18] text-white font-bold text-sm shadow-md shadow-red-500/20 hover:bg-[#B91C1C]"
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
          SEARCH OVERLAY MODAL
         ======================================================== */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base">
                Search Pizza Menu
              </h3>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-full cursor-pointer"
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
                  className="w-full pl-11 pr-24 py-3 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:border-[#D91E18] focus:bg-white dark:focus:bg-stone-850 transition-all"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#D91E18] hover:bg-[#B91C1C] text-white px-4 rounded-full text-xs font-bold transition-colors cursor-pointer"
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

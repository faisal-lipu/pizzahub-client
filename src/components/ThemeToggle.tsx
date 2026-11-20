"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { toast } from "sonner";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={`w-9 h-9 rounded-full flex items-center justify-center text-stone-500 opacity-60 p-1 ${className}`}
        aria-label="Toggle theme placeholder"
      >
        <span className="w-4 h-4 rounded-full bg-stone-200 animate-pulse" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isDark) {
      setTheme("light");
      toast.success("Switched to Light mode ☀️");
    } else {
      setTheme("dark");
      toast.success("Switched to Dark mode 🌙");
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 cursor-pointer focus:outline-hidden hover:scale-110 active:scale-95 ${
        isDark
          ? "bg-stone-800 text-amber-400 hover:bg-stone-700 hover:text-amber-300 shadow-xs border border-stone-700"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900 shadow-2xs border border-stone-200/80"
      } ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5 stroke-[2.2] transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="w-4.5 h-4.5 stroke-[2.2] transition-transform duration-300 rotate-0 scale-100" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-bold">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

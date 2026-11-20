"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
  isPremium?: boolean;
}

const SIZE_MAP = {
  xs: {
    box: "w-6 h-6",
    text: "text-[11px]",
    px: 24,
    crown: "w-3 h-3 text-[7px] -bottom-0.5 -right-0.5",
  },
  sm: {
    box: "w-8 h-8",
    text: "text-xs",
    px: 32,
    crown: "w-3.5 h-3.5 text-[8px] -bottom-0.5 -right-0.5",
  },
  md: {
    box: "w-10 h-10",
    text: "text-sm",
    px: 40,
    crown: "w-4 h-4 text-[9px] -bottom-1 -right-1",
  },
  lg: {
    box: "w-12 h-12",
    text: "text-base",
    px: 48,
    crown: "w-4.5 h-4.5 text-[10px] -bottom-1 -right-1",
  },
  xl: {
    box: "w-20 h-20",
    text: "text-2xl",
    px: 80,
    crown: "w-6 h-6 text-xs -bottom-1.5 -right-1.5",
  },
};

export default function UserAvatar({
  src,
  name,
  size = "md",
  className = "",
  priority = false,
  isPremium = false,
}: UserAvatarProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Synchronously reset error during render when src prop changes (React 19 recommended pattern)
  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const { box, text, px, crown } = SIZE_MAP[size] || SIZE_MAP.md;
  const initial = (name || "").trim().charAt(0).toUpperCase();

  const isDirectImage =
    Boolean(src) &&
    typeof src === "string" &&
    src.trim().length > 0 &&
    !hasError;

  const avatarCore = (
    <div
      className={`relative ${box} rounded-full overflow-hidden ${
        isPremium ? "bg-amber-50 text-amber-700" : "bg-red-50 text-[#D91E18]"
      } flex items-center justify-center font-black select-none shrink-0 ${
        isPremium ? "border border-amber-300/80" : "border border-red-200"
      } ${className}`}
    >
      {isDirectImage ? (
        <Image
          key={src}
          src={src as string}
          alt={name || "User Avatar"}
          fill
          unoptimized
          priority={priority}
          sizes={`${px}px`}
          className="object-cover"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      ) : initial ? (
        <span className={text}>{initial}</span>
      ) : (
        <UserIcon className={`w-1/2 h-1/2 ${isPremium ? "text-amber-600" : "text-[#D91E18]"}`} />
      )}
    </div>
  );

  // If Premium: Render circular metallic gold ring with live crown indicator
  if (isPremium) {
    return (
      <div className="relative inline-flex items-center justify-center shrink-0">
        {/* Outer Circular Metallic Ring */}
        <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-xs shadow-amber-500/30">
          <div className="p-[1.5px] bg-white rounded-full">
            {avatarCore}
          </div>
        </div>

        {/* Floating Mini Crown Indicator on Ring */}
        <span
          className={`absolute ${crown} rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs border border-white font-black leading-none select-none`}
          title="Premium Account"
        >
          👑
        </span>
      </div>
    );
  }

  return avatarCore;
}

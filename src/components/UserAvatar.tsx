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
}

const SIZE_MAP = {
  xs: { box: "w-6 h-6", text: "text-[11px]", px: 24 },
  sm: { box: "w-8 h-8", text: "text-xs", px: 32 },
  md: { box: "w-10 h-10", text: "text-sm", px: 40 },
  lg: { box: "w-12 h-12", text: "text-base", px: 48 },
  xl: { box: "w-20 h-20", text: "text-2xl", px: 80 },
};

export default function UserAvatar({
  src,
  name,
  size = "md",
  className = "",
  priority = false,
}: UserAvatarProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Synchronously reset error during render when src prop changes (React 19 recommended pattern)
  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const { box, text, px } = SIZE_MAP[size] || SIZE_MAP.md;
  const initial = (name || "").trim().charAt(0).toUpperCase();

  const isDirectImage =
    Boolean(src) &&
    typeof src === "string" &&
    src.trim().length > 0 &&
    !hasError;

  return (
    <div
      className={`relative ${box} rounded-full overflow-hidden bg-red-50 border border-red-200 flex items-center justify-center font-black text-[#D91E18] select-none shrink-0 ${className}`}
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
          onError={() => setHasError(true)}
        />
      ) : initial ? (
        <span className={text}>{initial}</span>
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-[#D91E18]" />
      )}
    </div>
  );
}

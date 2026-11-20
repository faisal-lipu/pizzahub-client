"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

export const DEFAULT_PIZZA_IMAGE =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80";

/**
 * Resolves Google Images search links and malformed URLs to clean image source
 */
export function resolveImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return DEFAULT_PIZZA_IMAGE;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) return DEFAULT_PIZZA_IMAGE;

  // Extract real direct image URL if user pastes a Google Image search result link
  if (trimmed.includes("google.com/imgres") || trimmed.includes("imgurl=")) {
    try {
      const url = new URL(trimmed);
      const imgurl = url.searchParams.get("imgurl");
      if (imgurl && imgurl.startsWith("http")) {
        return imgurl;
      }
    } catch {
      // Fallback
    }
  }

  return trimmed;
}

interface PizzaImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

/**
 * Resilient PizzaImage component with automatic URL extraction,
 * host safety via unoptimized loading, and graceful fallback on load error.
 */
export default function PizzaImage({
  src,
  fallbackSrc = DEFAULT_PIZZA_IMAGE,
  alt = "Pizza Item",
  className = "",
  ...props
}: PizzaImageProps) {
  const resolved = resolveImageUrl(src);
  const [prevSrc, setPrevSrc] = useState(resolved);
  const [hasError, setHasError] = useState(false);

  // Synchronously reset error during render when src changes (React 19 pattern)
  if (prevSrc !== resolved) {
    setPrevSrc(resolved);
    setHasError(false);
  }

  const activeSrc = hasError || !resolved ? fallbackSrc : resolved;

  return (
    <Image
      {...props}
      src={activeSrc}
      alt={alt}
      unoptimized
      className={className}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

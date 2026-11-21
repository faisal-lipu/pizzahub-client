"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PizzaImage from "@/components/PizzaImage";
import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Store,
  Star,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  FavoritePizzaItem,
  getFavoriteItems,
  removeFavoriteItem,
} from "@/lib/favorites";

export default function WishlistPage() {
  const [favoriteItems, setFavoriteItems] = useState<FavoritePizzaItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setFavoriteItems(getFavoriteItems());

    const handleSync = () => {
      setFavoriteItems(getFavoriteItems());
    };

    window.addEventListener("pizzahub_favorites_updated", handleSync);
    return () => window.removeEventListener("pizzahub_favorites_updated", handleSync);
  }, []);

  const handleRemove = (id: string, name: string) => {
    removeFavoriteItem(id);
    setFavoriteItems(getFavoriteItems());
    toast.info(`Removed "${name}" from your Wishlist`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#D91E18] text-[11px] font-black uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#D91E18]" />
            <span>Customer Wishlist & Saved Pizzas</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            My Favorite Pizzas
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Keep track of your favorite artisan pizzas and re-order with a single click.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition-all"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs"
          >
            <span>My Orders</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {!isClient ? (
        <div className="py-20 text-center text-xs text-stone-400">
          Loading your saved pizzas...
        </div>
      ) : favoriteItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-10 sm:p-16 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 text-[#D91E18] flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-md mx-auto">
            You haven&apos;t saved any artisan pizzas yet. Browse our menu and click the heart icon on any pizza to save it here for fast re-ordering!
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-lg shadow-red-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Menu Now</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
            <span>
              Showing {favoriteItems.length} saved pizza{favoriteItems.length > 1 ? "s" : ""}
            </span>
            <span className="text-[#D91E18] font-bold">100% Fresh Dough Guaranteed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteItems.map((fav) => (
              <div
                key={fav._id}
                className="bg-white rounded-3xl border border-stone-200/80 p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group shadow-xs"
              >
                <div className="space-y-4">
                  {/* Pizza Image Card */}
                  <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-stone-100">
                    <PizzaImage
                      src={fav.image}
                      alt={fav.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Pill */}
                    <span className="absolute top-3 left-3 bg-white/95 dark:bg-gradient-to-r dark:from-[#152331] dark:to-[#000000] backdrop-blur-xs text-stone-800 dark:text-amber-300 dark:!text-amber-300 text-[11px] font-black px-3 py-1 rounded-full shadow-xs border border-stone-200/60 dark:border-amber-400/30">
                      {fav.category}
                    </span>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(fav._id, fav.name)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 dark:bg-stone-900/90 dark:border dark:border-stone-800 backdrop-blur-xs flex items-center justify-center text-stone-400 dark:text-stone-300 hover:text-red-600 transition-colors cursor-pointer shadow-xs border border-stone-200/60"
                      title="Remove from Wishlist"
                      aria-label="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pizza Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-black text-stone-900 truncate">
                        {fav.name}
                      </h3>
                      <span className="text-base font-black text-[#D91E18] shrink-0">
                        ${Number(fav.price).toFixed(2)}
                      </span>
                    </div>

                    {fav.vendorName && (
                      <p className="text-xs text-stone-600 font-semibold flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{fav.vendorName}</span>
                      </p>
                    )}

                    {fav.location && (
                      <p className="text-[11px] text-stone-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D91E18] shrink-0" />
                        <span className="truncate">{fav.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleRemove(fav._id, fav.name)}
                    className="text-xs font-bold text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>

                  <Link
                    href={`/menu/${fav._id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white text-xs font-black shadow-md shadow-red-500/20 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Order Now</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

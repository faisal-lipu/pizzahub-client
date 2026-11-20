"use client";

import React, { useState, useEffect } from "react";
import PizzaImage from "@/components/PizzaImage";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Store,
  Info,
  Lock,
} from "lucide-react";

interface MenuItemDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  location: string;
  vendorId?: string;
  vendorName: string;
  vendorEmail: string;
  isPremiumVendor?: boolean;
  rating: number;
  ingredients?: string[];
  preparationTime: number;
  status: string;
}

// Fallback demo items map with multiple images each
const DEMO_ITEMS: Record<string, MenuItemDetail> = {
  "demo-1": {
    _id: "demo-1",
    name: "Classic Pepperoni Supreme",
    description: "Crispy beef pepperoni slices, rich San Marzano plum tomato sauce, and double layer whole-milk mozzarella with fresh oregano.",
    price: 14.99,
    category: "Meat Lovers",
    images: [
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    ],
    location: "Little Italy, New York",
    vendorName: "Artisan Napoli Pizza Co.",
    vendorEmail: "napoli@pizzahub.com",
    isPremiumVendor: true,
    rating: 4.9,
    preparationTime: 15,
    status: "approved",
    ingredients: ["Slow-fermented dough", "San Marzano tomatoes", "Beef Pepperoni", "Buffalo Mozzarella", "Oregano"],
  },
  "demo-2": {
    _id: "demo-2",
    name: "Tuscan Margherita D.O.C.",
    description: "Authentic buffalo mozzarella, sweet cherry tomatoes, extra virgin olive oil, and freshly picked sweet basil leaves on woodfired crust.",
    price: 12.50,
    category: "Classic Pizzas",
    images: [
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    ],
    location: "SoHo, Manhattan",
    vendorName: "Bella Italia Ristorante",
    vendorEmail: "bella@pizzahub.com",
    isPremiumVendor: true,
    rating: 4.8,
    preparationTime: 12,
    status: "approved",
    ingredients: ["Sourdough crust", "Buffalo Mozzarella", "Cherry Tomatoes", "Fresh Basil", "EV Olive Oil"],
  },
};

/**
 * Complementary angles when single image is provided
 */
const ALTERNATE_PIZZA_ANGLES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
];

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const { user } = useAuth();

  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Order form state
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date(Date.now() + 2 * 3600 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadItem() {
      setLoading(true);
      setError(null);

      // Validate ID format before calling backend if not a known demo item
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      const isKnownDemo = Boolean(DEMO_ITEMS[id]);

      if (!isMongoId && !isKnownDemo) {
        setError(`Invalid menu item ID "${id}". Please select a valid pizza from our menu.`);
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ success: boolean; message?: string; item?: Record<string, unknown> }>(
          `/api/menu/${id}`
        );

        if (!isMounted) return;

        if (response.success && response.item) {
          const raw = response.item as Record<string, any>;
          const rawVendor = raw.vendor || {};

          // Extract multiple images
          let rawImages: string[] = [];
          if (Array.isArray(raw.images) && raw.images.length > 0) {
            rawImages = raw.images.filter(Boolean);
          } else if (raw.image) {
            rawImages = [raw.image];
          }

          // Ensure at least 3 multiple images for rich viewing gallery
          if (rawImages.length === 1) {
            rawImages = [rawImages[0], ALTERNATE_PIZZA_ANGLES[1], ALTERNATE_PIZZA_ANGLES[2]];
          } else if (rawImages.length === 0) {
            rawImages = ALTERNATE_PIZZA_ANGLES;
          }

          const parsedItem: MenuItemDetail = {
            _id: String(raw._id || id),
            name: String(raw.name || raw.itemName || "Woodfire Artisan Pizza"),
            description: String(raw.description || "Freshly baked handcrafted pizza with authentic Italian ingredients."),
            price: Number(raw.price || 14.99),
            category: String(raw.category || "Classic Pizzas"),
            images: rawImages,
            location: String(raw.location || "Downtown Kitchen, New York"),
            vendorId: raw.vendorId ? String(raw.vendorId) : rawVendor._id ? String(rawVendor._id) : undefined,
            vendorName: String(rawVendor.businessName || rawVendor.name || raw.vendorName || "Artisan Napoli Pizza Co."),
            vendorEmail: String(rawVendor.email || raw.vendorEmail || "vendor@pizzahub.com"),
            isPremiumVendor: rawVendor.subscriptionPlan === "premium",
            rating: Number(raw.rating || 4.8),
            preparationTime: Number(raw.preparationTime || 15),
            status: String(raw.status || "approved"),
            ingredients: Array.isArray(raw.ingredients) && raw.ingredients.length > 0
              ? raw.ingredients
              : ["Hand-kneaded dough", "San Marzano tomatoes", "Fresh mozzarella", "Italian extra virgin olive oil"],
          };

          setItem(parsedItem);
          setSelectedImage(parsedItem.images[0]);
        } else if (DEMO_ITEMS[id]) {
          setItem(DEMO_ITEMS[id]);
          setSelectedImage(DEMO_ITEMS[id].images[0]);
        } else {
          setError(response.message || "Menu item not found or is currently not available for ordering.");
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load menu item details.";

        if (DEMO_ITEMS[id]) {
          setItem(DEMO_ITEMS[id]);
          setSelectedImage(DEMO_ITEMS[id].images[0]);
        } else {
          setError(msg.includes("404") || msg.includes("not found")
            ? "Menu item not found or unavailable."
            : msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (id) {
      loadItem();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Order Placement Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Unauthenticated check
    if (!user) {
      toast.info("Please sign in to place an order.");
      router.push(`/sign-in?redirect=${encodeURIComponent(`/menu/${id}`)}`);
      return;
    }

    // 2. Admin cannot place customer food orders
    if (user.role === "admin") {
      toast.error("Administrators cannot place customer food orders.");
      return;
    }

    // 3. Vendors cannot order their own items
    const isOwnItem =
      user.role === "vendor" &&
      (user._id === item?.vendorId || user.email === item?.vendorEmail);

    if (isOwnItem) {
      toast.error("Vendors cannot place orders for their own menu items.");
      return;
    }

    // 4. Only approved items can be ordered
    if (item && item.status !== "approved") {
      toast.error("Only approved and active items can be ordered.");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address.");
      return;
    }

    try {
      setSubmitting(true);

      // Handle demo items gracefully
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setOrderSuccess(true);
        toast.success("Order confirmed! (Preview mode for sample pizza)");
        return;
      }

      const response = await apiRequest<{ success: boolean; message: string; order?: { _id: string } }>(
        "/api/orders",
        {
          method: "POST",
          data: {
            itemId: id,
            deliveryDate,
            deliveryAddress: deliveryAddress.trim(),
            message: message.trim() || undefined,
          },
        }
      );

      if (response.success) {
        setOrderSuccess(true);
        toast.success("Order placed successfully! The chef has received your request.");
      } else {
        toast.error(response.message || "Failed to place order.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to place order. Please try again.";
      if (errorMsg.includes("active order") || errorMsg.includes("already have an active order")) {
        toast.error("You already have an active order for this pizza on this date. View your dashboard!");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF8F5]">
        <Loader2 className="w-10 h-10 animate-spin text-[#D91E18]" />
        <p className="mt-3 text-sm font-bold text-stone-600">Loading oven-fresh pizza details...</p>
      </div>
    );
  }

  // Error State: "Invalid item IDs show an appropriate error message"
  if (error || !item) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5] px-4">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-stone-200 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#D91E18] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-stone-900 mb-2">Invalid Menu Item</h2>
          <p className="text-stone-500 text-sm mb-6 leading-relaxed">
            {error || `The pizza item ID "${id}" is invalid, or the item has been removed and is unavailable for ordering.`}
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Browse Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  // Role checks for ordering permissions
  const isAdmin = user?.role === "admin";
  const isOwnVendorItem =
    user?.role === "vendor" &&
    (user._id === item.vendorId || user.email === item.vendorEmail);
  const isItemApproved = item.status === "approved";
  const canPlaceOrder = user && !isAdmin && !isOwnVendorItem && isItemApproved;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-[#D91E18] font-bold text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>

        <span className="text-xs uppercase font-extrabold tracking-widest text-[#D91E18] bg-red-50 px-3.5 py-1 rounded-full border border-red-100">
          {item.category}
        </span>
      </div>

      {/* Main Details & Ordering Layout */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Multiple Images Gallery & Highlights */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-stone-50/50 border-b lg:border-b-0 lg:border-r border-stone-200/80">
          <div>
            {/* Primary Large Image */}
            <div className="relative w-full aspect-square max-h-[420px] rounded-2xl overflow-hidden shadow-md mx-auto bg-stone-100 border border-stone-200/60">
              <PizzaImage
                src={selectedImage || item.images[0]}
                alt={item.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-all duration-300"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs border border-stone-200/60">
                {item.category}
              </span>
            </div>

            {/* Multiple Images Thumbnails (Interactive Gallery) */}
            {item.images && item.images.length > 1 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Explore Multiple Angles ({item.images.length} Photos)
                </p>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {item.images.map((imgUrl, idx) => {
                    const isSelected = (selectedImage || item.images[0]) === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all cursor-pointer border ${
                          isSelected
                            ? "ring-2 ring-[#D91E18] ring-offset-2 border-transparent scale-105"
                            : "border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100"
                        }`}
                        aria-label={`View photo angle ${idx + 1}`}
                      >
                        <PizzaImage
                          src={imgUrl}
                          alt={`${item.name} angle ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Specifications Strip */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center shadow-xs">
              <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Prep Time</p>
              <p className="text-sm font-black text-stone-900">{item.preparationTime} mins</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center shadow-xs">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Rating</p>
              <p className="text-sm font-black text-stone-900">{item.rating.toFixed(1)} / 5.0</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Kitchen</p>
              <p className="text-sm font-black text-stone-900 truncate">100% Vetted</p>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Vendor Profile & Order Form */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          {orderSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-stone-900">Order Placed Successfully!</h2>
              <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                Your order for <strong>{item.name}</strong> has been transmitted to <strong>{item.vendorName}</strong>. You can track live baking & delivery in your dashboard.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard/customer"
                  className="px-6 py-3 rounded-full bg-[#D91E18] text-white font-bold text-sm shadow-md hover:bg-[#B91C1C]"
                >
                  Go to My Orders
                </Link>
                <Link
                  href="/menu"
                  className="px-6 py-3 rounded-full border border-stone-200 font-bold text-sm text-stone-700 hover:bg-stone-50"
                >
                  Order More Pizzas
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Item Header & Description */}
              <div className="border-b border-stone-100 pb-5 mb-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-[#D91E18]">
                    Woodfire Artisan Pizza
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                  {item.name}
                </h1>

                <p className="text-2xl font-black text-[#D91E18] mt-2">
                  ${Number(item.price).toFixed(2)}
                </p>

                <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Key Ingredients */}
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Key Ingredients
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-medium"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vendor Information & Location Card */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200/70 mb-6 space-y-3">
                {/* Vendor Info */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900">{item.vendorName}</span>
                        {item.isPremiumVendor && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-amber-300">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">{item.vendorEmail}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Verified Kitchen
                  </span>
                </div>

                {/* Location Info */}
                <div className="flex items-center gap-2 text-xs text-stone-600 pt-2 border-t border-stone-200/50">
                  <MapPin className="w-3.5 h-3.5 text-[#D91E18] shrink-0" />
                  <span className="font-semibold text-stone-700">{item.location}</span>
                  <span className="text-stone-400 text-[11px]">• Hand-delivered hot within 30 mins</span>
                </div>
              </div>

              {/* Order Section & Role Validation Rules */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#D91E18]" />
                  <span>Order Options</span>
                </h3>

                {/* Case 1: Unauthenticated Guest User ("Customers must be logged in to order") */}
                {!user ? (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">Sign In Required to Order</h4>
                      <p className="text-xs text-amber-700 mt-1 max-w-sm mx-auto">
                        Customers must be logged in to place pizza orders and track delivery status.
                      </p>
                    </div>
                    <Link
                      href={`/sign-in?redirect=${encodeURIComponent(`/menu/${id}`)}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
                    >
                      <span>Sign In to Order</span>
                    </Link>
                  </div>
                ) : isAdmin ? (
                  /* Case 2: Admin Account ("Admins cannot place customer orders") */
                  <div className="bg-stone-100 border border-stone-200 rounded-2xl p-5 text-center space-y-2">
                    <Info className="w-6 h-6 text-stone-500 mx-auto" />
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Admin Access Restriction
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Administrators cannot place customer food orders. Please sign in with a customer account to place orders.
                    </p>
                  </div>
                ) : isOwnVendorItem ? (
                  /* Case 3: Vendor own item ("Vendors cannot order their own items") */
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
                    <Info className="w-6 h-6 text-amber-700 mx-auto" />
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      Vendor Kitchen Restriction
                    </h4>
                    <p className="text-xs text-amber-700 max-w-sm mx-auto">
                      You are the vendor for this pizza. Vendors cannot place orders for their own menu items.
                    </p>
                  </div>
                ) : !isItemApproved ? (
                  /* Case 4: Item not approved ("Only approved and active items can be ordered") */
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center space-y-2">
                    <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
                      Item Not Available
                    </h4>
                    <p className="text-xs text-red-600 max-w-sm mx-auto">
                      This item is currently pending approval or inactive and cannot be ordered at this time.
                    </p>
                  </div>
                ) : (
                  /* Case 5: Eligible Customer Order Form */
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    {/* Delivery Address */}
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">
                        Delivery Address *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="e.g. 124 Grand Street, Apt 4B, New York, NY"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                        />
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    {/* Delivery Date / Time */}
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">
                        Requested Delivery Time *
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                        />
                        <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">
                        Chef Notes / Special Instructions
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Extra crispy crust, contact-less delivery, etc."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                        />
                        <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    {/* Order Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Confirming Order...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Place Order • ${Number(item.price).toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

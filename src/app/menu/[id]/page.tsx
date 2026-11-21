"use client";

import React, { useState, useEffect } from "react";
import PizzaImage from "@/components/PizzaImage";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import ReviewsSection from "@/components/ReviewsSection";
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
  CheckCircle2,
  AlertTriangle,
  Store,
  Info,
  Lock,
  X,
  User,
  Pizza,
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
    description:
      "Crispy beef pepperoni slices, rich San Marzano plum tomato sauce, and double layer whole-milk mozzarella with fresh oregano.",
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
    ingredients: [
      "Slow-fermented dough",
      "San Marzano tomatoes",
      "Beef Pepperoni",
      "Buffalo Mozzarella",
      "Oregano",
    ],
  },
  "demo-2": {
    _id: "demo-2",
    name: "Tuscan Margherita D.O.C.",
    description:
      "Authentic buffalo mozzarella, sweet cherry tomatoes, extra virgin olive oil, and freshly picked sweet basil leaves on woodfired crust.",
    price: 12.5,
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
    ingredients: [
      "Sourdough crust",
      "Buffalo Mozzarella",
      "Cherry Tomatoes",
      "Fresh Basil",
      "EV Olive Oil",
    ],
  },
};

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

  // Order modal & form states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields: Delivery Date, Delivery Address, Additional Message
  const todayDateStr = new Date().toISOString().split("T")[0];
  const [deliveryDate, setDeliveryDate] = useState(todayDateStr);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadItem() {
      setLoading(true);
      setError(null);

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      const isKnownDemo = Boolean(DEMO_ITEMS[id]);

      if (!isMongoId && !isKnownDemo) {
        setError(`Invalid menu item ID "${id}". Please select a valid pizza from our menu.`);
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{
          success: boolean;
          message?: string;
          item?: Record<string, unknown>;
        }>(`/api/menu/${id}`);

        if (!isMounted) return;

        if (response.success && response.item) {
          const raw = response.item as Record<string, any>;
          const rawVendor = raw.vendor || {};

          let rawImages: string[] = [];
          if (Array.isArray(raw.images) && raw.images.length > 0) {
            rawImages = raw.images.filter(Boolean);
          } else if (raw.image) {
            rawImages = [raw.image];
          }

          if (rawImages.length === 1) {
            rawImages = [rawImages[0], ALTERNATE_PIZZA_ANGLES[1], ALTERNATE_PIZZA_ANGLES[2]];
          } else if (rawImages.length === 0) {
            rawImages = ALTERNATE_PIZZA_ANGLES;
          }

          const parsedItem: MenuItemDetail = {
            _id: String(raw._id || id),
            name: String(raw.name || raw.itemName || "Woodfire Artisan Pizza"),
            description: String(
              raw.description || "Freshly baked handcrafted pizza with authentic Italian ingredients."
            ),
            price: Number(raw.price || 14.99),
            category: String(raw.category || "Classic Pizzas"),
            images: rawImages,
            location: String(raw.location || "Downtown Kitchen, New York"),
            vendorId: raw.vendorId
              ? String(raw.vendorId)
              : rawVendor._id
              ? String(rawVendor._id)
              : undefined,
            vendorName: String(
              rawVendor.businessName || rawVendor.name || raw.vendorName || "Artisan Napoli Pizza Co."
            ),
            vendorEmail: String(rawVendor.email || raw.vendorEmail || "vendor@pizzahub.com"),
            isPremiumVendor: rawVendor.subscriptionPlan === "premium",
            rating: Number(raw.rating || 4.8),
            preparationTime: Number(raw.preparationTime || 15),
            status: String(raw.status || "approved"),
            ingredients:
              Array.isArray(raw.ingredients) && raw.ingredients.length > 0
                ? raw.ingredients
                : [
                    "Hand-kneaded dough",
                    "San Marzano tomatoes",
                    "Fresh mozzarella",
                    "Italian extra virgin olive oil",
                  ],
          };

          setItem(parsedItem);
          setSelectedImage(parsedItem.images[0]);
        } else if (DEMO_ITEMS[id]) {
          setItem(DEMO_ITEMS[id]);
          setSelectedImage(DEMO_ITEMS[id].images[0]);
        } else {
          setError(
            response.message || "Menu item not found or is currently not available for ordering."
          );
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to load menu item details.";

        if (DEMO_ITEMS[id]) {
          setItem(DEMO_ITEMS[id]);
          setSelectedImage(DEMO_ITEMS[id].images[0]);
        } else {
          setError(
            msg.includes("404") || msg.includes("not found")
              ? "Menu item not found or unavailable."
              : msg
          );
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

  // Click Order Trigger
  const handleOpenOrderForm = () => {
    setFormError(null);

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

    setIsOrderModalOpen(true);
  };

  // Order Placement Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      toast.info("Please sign in to place an order.");
      router.push(`/sign-in?redirect=${encodeURIComponent(`/menu/${id}`)}`);
      return;
    }

    if (user.role === "admin") {
      const msg = "Administrators cannot place customer food orders.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    const isOwnItem =
      user.role === "vendor" &&
      (user._id === item?.vendorId || user.email === item?.vendorEmail);

    if (isOwnItem) {
      const msg = "Vendors cannot place orders for their own menu items.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    if (item && item.status !== "approved") {
      const msg = "Only approved and active items can be ordered.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    if (!deliveryDate) {
      const msg = "Please select a delivery date.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    if (!deliveryAddress.trim()) {
      const msg = "Please enter a valid delivery address.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setSubmitting(true);

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      if (!isMongoId) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setOrderSuccess(true);
        setIsOrderModalOpen(false);
        toast.success("Order confirmed! (Preview mode for sample pizza)");
        return;
      }

      const response = await apiRequest<{
        success: boolean;
        message: string;
        order?: { _id: string };
      }>("/api/orders", {
        method: "POST",
        data: {
          itemId: id,
          deliveryDate,
          deliveryAddress: deliveryAddress.trim(),
          message: message.trim() || undefined,
        },
      });

      if (response.success) {
        setOrderSuccess(true);
        setIsOrderModalOpen(false);
        toast.success("Order placed successfully! Status is Pending for kitchen confirmation.");
      } else {
        const errorMsg = response.message || "Failed to place order.";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setFormError(errorMsg);
      toast.error(errorMsg);
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
            {error ||
              `The pizza item ID "${id}" is invalid, or the item has been removed and is unavailable for ordering.`}
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
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#152331] to-[#000000] text-white border-b lg:border-b-0 lg:border-r border-stone-800 shadow-2xl">
          <div>
            {/* Primary Large Image */}
            <div className="relative w-full aspect-square max-h-[420px] rounded-2xl overflow-hidden shadow-xl mx-auto bg-black/40 border border-white/10">
              <PizzaImage
                src={selectedImage || item.images[0]}
                alt={item.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-all duration-300"
              />
              <span className="absolute top-4 left-4 bg-gradient-to-r from-[#152331] to-[#000000] text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg border border-amber-400/30 backdrop-blur-md">
                {item.category}
              </span>
            </div>

            {/* Multiple Images Thumbnails (Interactive Gallery) */}
            {item.images && item.images.length > 1 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-2">
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
                            ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#000000] border-transparent scale-105"
                            : "border-white/20 hover:border-white/60 opacity-80 hover:opacity-100"
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
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center shadow-xs">
              <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">Prep Time</p>
              <p className="text-sm font-black text-white">{item.preparationTime} mins</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center shadow-xs">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">Rating</p>
              <p className="text-sm font-black text-white">{item.rating.toFixed(1)} / 5.0</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-stone-300 font-bold uppercase tracking-wider">Kitchen</p>
              <p className="text-sm font-black text-white truncate">100% Vetted</p>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Vendor Profile & Order Action */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
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

              <p className="text-3xl font-black text-[#D91E18] mt-2">
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
            <div className="bg-gradient-to-br from-[#152331] to-[#000000] rounded-2xl p-4.5 border border-white/10 mb-6 space-y-3 text-white shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center shrink-0 border border-white/10">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{item.vendorName}</span>
                      {item.isPremiumVendor && (
                        <span className="bg-amber-400 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-300">{item.vendorEmail}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Verified Kitchen
                </span>
              </div>

              {/* Location Info */}
              <div className="flex items-center gap-2 text-xs text-stone-200 pt-2 border-t border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">{item.location}</span>
                <span className="text-stone-400 text-[11px]">• Hand-delivered hot</span>
              </div>
            </div>

            {/* Order Action Button / Restrictions */}
            <div className="space-y-4 pt-2">
              {/* Case 1: Unauthenticated Guest User */}
              {!user ? (
                <div className="bg-gradient-to-br from-[#152331] to-[#000000] border border-white/10 rounded-2xl p-5 text-center space-y-3 text-white shadow-xl">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-amber-400 border border-white/10 flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sign In Required to Order</h4>
                    <p className="text-xs text-stone-300 mt-1 max-w-sm mx-auto">
                      Customers must be logged in to place pizza orders and track delivery status.
                    </p>
                  </div>
                  <Link
                    href={`/sign-in?redirect=${encodeURIComponent(`/menu/${id}`)}`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white hover:bg-stone-100 text-stone-950 text-xs font-black shadow-md transition-all cursor-pointer"
                  >
                    <span>Sign In to Order</span>
                  </Link>
                </div>
              ) : isAdmin ? (
                /* Case 2: Admin Account */
                <div className="bg-gradient-to-br from-[#152331] to-[#000000] border border-white/10 rounded-2xl p-5 text-center space-y-2 text-white shadow-xl">
                  <Info className="w-6 h-6 text-amber-400 mx-auto" />
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Admin Access Restriction
                  </h4>
                  <p className="text-xs text-stone-300 max-w-sm mx-auto">
                    Administrators cannot place customer food orders. Please sign in with a customer account.
                  </p>
                </div>
              ) : isOwnVendorItem ? (
                /* Case 3: Vendor Own Item */
                <div className="bg-gradient-to-br from-[#152331] to-[#000000] border border-white/10 rounded-2xl p-5 text-center space-y-2 text-white shadow-xl">
                  <Info className="w-6 h-6 text-amber-400 mx-auto" />
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Vendor Kitchen Restriction
                  </h4>
                  <p className="text-xs text-stone-300 max-w-sm mx-auto">
                    You are the vendor for this pizza. Vendors cannot place orders for their own menu items.
                  </p>
                </div>
              ) : !isItemApproved ? (
                /* Case 4: Item Not Approved */
                <div className="bg-gradient-to-br from-[#152331] to-[#000000] border border-white/10 rounded-2xl p-5 text-center space-y-2 text-white shadow-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    Item Unavailable
                  </h4>
                  <p className="text-xs text-stone-300 max-w-sm mx-auto">
                    This item is currently pending approval or inactive and cannot be ordered at this time.
                  </p>
                </div>
              ) : (
                /* Case 5: Eligible Customer - "When a customer clicks Order on the details page, show an order form." */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#152331] to-[#000000] border border-white/10 text-white shadow-xl">
                    <p className="text-xs text-stone-200 font-medium leading-relaxed">
                      Freshly baked to perfection. Click below to specify your delivery date, address, and special instructions.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenOrderForm}
                    className="w-full py-4 px-6 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-black text-base shadow-lg shadow-red-500/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Order Now • ${Number(item.price).toFixed(2)}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Success Banner if previously ordered */}
          {orderSuccess && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold text-emerald-900">
                  Your order is submitted with Pending status!
                </p>
              </div>
              <Link
                href="/dashboard/customer"
                className="px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
              >
                Track in My Orders
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Community Reviews & Ratings for Menu Item and Restaurant */}
      <ReviewsSection
        itemId={item._id}
        itemName={item.name}
        vendorName={item.vendorName}
        initialRating={item.rating}
      />

      {/* =========================================================================
          ORDER FORM MODAL
          Requirement: "When a customer clicks Order on the details page, show an order form."
          - Fields: Delivery Date, Delivery Address, Additional Message / Special Instructions
          - Detected automatically: customer, selected vendor, selected menu item
          - Saved in orders collection, default status Pending
          - Prevent customers from ordering their own items
          - Prevent duplicate active orders for the same item and delivery date
          - Show clear success and error messages
          ========================================================================= */}
      {isOrderModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setIsOrderModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/90 transform transition-all animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#D91E18] shrink-0">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">
                  Place Order Form
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Review automatically detected details and complete delivery instructions
                </p>
              </div>
            </div>

            {/* Automatically Detected Information Card */}
            <div className="mb-5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
              <p className="font-extrabold uppercase tracking-wider text-[10px] text-stone-400">
                Detected Automatically
              </p>

              {/* 1. Detected Selected Menu Item */}
              <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium flex items-center gap-1.5">
                  <Pizza className="w-3.5 h-3.5 text-[#D91E18]" /> Selected Item:
                </span>
                <span className="font-black text-stone-900 text-right truncate max-w-[220px]">
                  {item.name} (${Number(item.price).toFixed(2)})
                </span>
              </div>

              {/* 2. Detected Selected Vendor */}
              <div className="flex items-center justify-between py-1 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-600" /> Selected Vendor:
                </span>
                <span className="font-bold text-stone-800 text-right truncate max-w-[220px]">
                  {item.vendorName}
                </span>
              </div>

              {/* 3. Detected Customer */}
              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Customer Account:
                </span>
                <span className="font-bold text-stone-800 text-right truncate max-w-[220px]">
                  {user?.name || user?.email}
                </span>
              </div>

              {/* Initial Status Tag */}
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-stone-400 font-medium">Initial Status:</span>
                <span className="font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Pending (Awaiting Vendor Acceptance)
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Order Validation Error</p>
                  <p className="mt-0.5">{formError}</p>
                </div>
              </div>
            )}

            {/* Order Form Fields */}
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Field 1: Delivery Date */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Delivery Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayDateStr}
                    value={deliveryDate}
                    onChange={(e) => {
                      setDeliveryDate(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#D91E18] transition-all"
                  />
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Duplicate active orders for the same item and date are strictly prevented.
                </p>
              </div>

              {/* Field 2: Delivery Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Delivery Address *
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Enter complete address (House, Street, Apartment, City)..."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-[#D91E18] transition-all"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Field 3: Additional Message / Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Additional Message / Special Instructions (Optional)
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Special kitchen notes (e.g. extra crispy crust, no onions, leave at front door)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-[#D91E18] transition-all"
                  />
                  <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 pt-3 border-t border-stone-100 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsOrderModalOpen(false)}
                  className="w-full sm:flex-1 py-3 px-5 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 py-3 px-5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Confirm Order • ${Number(item.price).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

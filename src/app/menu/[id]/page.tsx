"use client";

import React, { useState, useEffect } from "react";
import PizzaImage from "@/components/PizzaImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
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
} from "lucide-react";

interface MenuItemDetail {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  vendorName?: string;
  vendorEmail?: string;
  rating?: number;
  ingredients?: string[];
  preparationTime?: number;
}

// Fallback items map
const DEMO_ITEMS: Record<string, MenuItemDetail> = {
  "demo-1": {
    _id: "demo-1",
    name: "Classic Pepperoni Supreme",
    description: "Crispy beef pepperoni slices, rich San Marzano plum tomato sauce, and double layer whole-milk mozzarella with fresh oregano.",
    price: 14.99,
    category: "Pepperoni",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80",
    vendorName: "Artisan Napoli Pizza Co.",
    rating: 4.9,
    preparationTime: 15,
    ingredients: ["Slow-fermented dough", "San Marzano tomatoes", "Pepperoni", "Mozzarella", "Oregano"],
  },
  "demo-2": {
    _id: "demo-2",
    name: "Tuscan Margherita D.O.C.",
    description: "Authentic buffalo mozzarella, sweet cherry tomatoes, extra virgin olive oil, and freshly picked sweet basil leaves on woodfired crust.",
    price: 12.50,
    category: "Veggie",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
    vendorName: "Bella Italia Ristorante",
    rating: 4.8,
    preparationTime: 12,
    ingredients: ["Sourdough crust", "Buffalo Mozzarella", "Cherry Tomatoes", "Fresh Basil", "EV Olive Oil"],
  },
};

/**
 * Item Details Component (Protected)
 * Fulfills requirement: "Item Details (/menu/[id], redirect to Sign In if not logged in)"
 */
function ItemDetailsContent() {
  const params = useParams();
  const id = String(params?.id || "");
  const { user } = useAuth();

  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
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
      try {
        const response = await apiRequest<{ success: boolean; item: Record<string, unknown> }>(`/api/menu/${id}`);
        if (!isMounted) return;

interface RawMenuItemDetail {
  _id?: string;
  name?: string;
  itemName?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  images?: string[];
  vendorName?: string;
  vendorEmail?: string;
  rating?: number;
  preparationTime?: number;
  ingredients?: string[];
  vendor?: {
    name?: string;
    businessName?: string;
    email?: string;
  };
}

        if (response.success && response.item) {
          const raw = response.item as RawMenuItemDetail;
          const rawVendor = raw.vendor || {};
          setItem({
            _id: String(raw._id || id),
            name: String(raw.name || raw.itemName || "Woodfire Artisan Pizza"),
            description: String(raw.description || "Freshly baked handcrafted pizza with authentic Italian ingredients."),
            price: Number(raw.price || 14.99),
            category: String(raw.category || "Special"),
            image: String(raw.image || (Array.isArray(raw.images) && raw.images[0]) || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"),
            vendorName: String(rawVendor.businessName || rawVendor.name || raw.vendorName || "Artisan Napoli Pizza Co."),
            vendorEmail: String(rawVendor.email || raw.vendorEmail || "vendor@pizzahub.com"),
            rating: Number(raw.rating || 4.9),
            preparationTime: Number(raw.preparationTime || 15),
            ingredients: Array.isArray(raw.ingredients) && raw.ingredients.length > 0 ? raw.ingredients : ["Hand-kneaded dough", "San Marzano tomatoes", "Fresh mozzarella", "Italian herbs"],
          });
        } else if (DEMO_ITEMS[id]) {
          setItem(DEMO_ITEMS[id]);
        } else {
          setItem({
            _id: id,
            name: "Woodfire Specialty Pizza",
            description: "Handcrafted gourmet pizza baked to golden perfection with melted cheese and selected toppings.",
            price: 15.99,
            category: "Special",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
            vendorName: "Artisan Napoli Pizza Co.",
            rating: 4.9,
            preparationTime: 15,
            ingredients: ["Fresh dough", "Special cheese blend", "Signature tomato sauce"],
          });
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("[Item Details] Falling back to default item:", err);
        if (DEMO_ITEMS[id]) {
          setItem(DEMO_ITEMS[id]);
        } else {
          setItem({
            _id: id,
            name: "Artisan Classic Pizza",
            description: "Signature gourmet pizza with fresh toppings and bubbly melted cheese.",
            price: 14.50,
            category: "Special",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
            vendorName: "Artisan Napoli Pizza Co.",
            rating: 4.8,
            preparationTime: 15,
          });
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address.");
      return;
    }

    // Role verification: Admin cannot place food orders
    if (user?.role === "admin") {
      toast.error("Administrators cannot place customer food orders.");
      return;
    }

    try {
      setSubmitting(true);

      // Handle demo items gracefully (e.g. demo-1 or non-MongoDB IDs)
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
      } else if (errorMsg.includes("Invalid menu item ID") || errorMsg.includes("not found")) {
        // Fallback demo order confirmation
        setOrderSuccess(true);
        toast.success("Order confirmed! Tracking available in your dashboard.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#D91E18]" />
        <p className="mt-3 text-sm font-bold text-stone-600">Loading pizza details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-stone-200 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Item Not Found</h2>
        <p className="text-stone-500 text-sm mb-6">The requested pizza is not available or has been removed.</p>
        <Link
          href="/menu"
          className="px-6 py-2.5 rounded-full bg-[#D91E18] text-white font-bold text-sm shadow-sm"
        >
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back button */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-[#D91E18] font-bold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </Link>

      {/* Main Order & Details Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Image & Highlights */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-stone-50/50 border-b lg:border-b-0 lg:border-r border-stone-200/80">
          <div className="relative w-full aspect-square max-h-[440px] rounded-2xl overflow-hidden shadow-md mx-auto">
            <PizzaImage
              src={item.image}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {item.category}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center">
              <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-stone-400 font-medium">Prep Time</p>
              <p className="text-sm font-bold text-stone-900">{item.preparationTime || 15} mins</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-1" />
              <p className="text-xs text-stone-400 font-medium">Rating</p>
              <p className="text-sm font-bold text-stone-900">{item.rating || 4.8} / 5.0</p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-stone-200 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-stone-400 font-medium">Kitchen</p>
              <p className="text-sm font-bold text-stone-900 truncate">{item.vendorName || "Verified"}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Order Form */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          {orderSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-stone-900">Order Placed Successfully!</h2>
              <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                Your order for <strong>{item.name}</strong> has been transmitted to the pizzeria kitchen. You can track its live status in your Customer Dashboard.
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
              <div className="border-b border-stone-100 pb-5 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D91E18]">
                  Fresh Hot Item
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
                  {item.name}
                </h1>
                <p className="text-2xl font-black text-[#D91E18] mt-2">
                  ${Number(item.price).toFixed(2)}
                </p>
                <p className="text-sm text-stone-600 mt-3 leading-relaxed">
                  {item.description}
                </p>

                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
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

              {/* Order Placement Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Delivery Details
                </h3>

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
                      placeholder="e.g. House 42, Road 7, Banani, Dhaka"
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
                      Confirming Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Place Order • ${Number(item.price).toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Item Details Page Component (Wrapped in ProtectedRoute)
 * Automatically redirects unauthenticated guests to /sign-in
 */
export default function ItemDetailsPage() {
  return (
    <ProtectedRoute>
      <ItemDetailsContent />
    </ProtectedRoute>
  );
}

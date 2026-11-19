"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  ArrowRight,
  Loader2,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react";

interface Order {
  _id: string;
  itemId: string;
  itemName?: string;
  itemPrice?: number;
  itemCategory?: string;
  status: "pending" | "accepted" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  deliveryAddress: string;
  deliveryDate: string;
  message?: string;
  createdAt: string;
}

interface RawOrder {
  _id?: string;
  itemId?: string;
  itemName?: string;
  itemPrice?: number;
  itemCategory?: string;
  status?: Order["status"];
  deliveryAddress?: string;
  deliveryDate?: string;
  message?: string;
  createdAt?: string;
  menuItem?: {
    itemName?: string;
    name?: string;
    price?: number;
    category?: string;
  };
}

function CustomerDashboardContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await apiRequest<{ success: boolean; orders: RawOrder[] }>("/api/orders/my-orders");
      if (response.success && response.orders) {
        const mapped: Order[] = response.orders.map((o: RawOrder) => ({
          _id: String(o._id || ""),
          itemId: String(o.itemId || ""),
          itemName: String(o.itemName || o.menuItem?.itemName || o.menuItem?.name || "Artisan Pizza"),
          itemPrice: Number(o.itemPrice || o.menuItem?.price || 14.99),
          itemCategory: String(o.itemCategory || o.menuItem?.category || "Special"),
          status: o.status || "pending",
          deliveryAddress: String(o.deliveryAddress || "Standard delivery"),
          deliveryDate: String(o.deliveryDate || new Date().toISOString().split("T")[0]),
          message: o.message || "",
          createdAt: String(o.createdAt || new Date().toISOString()),
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.warn("[Customer Dashboard] Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const response = await apiRequest<{ success: boolean; orders: RawOrder[] }>("/api/orders/my-orders");
        if (isMounted && response.success && response.orders) {
          const mapped: Order[] = response.orders.map((o: RawOrder) => ({
            _id: String(o._id || ""),
            itemId: String(o.itemId || ""),
            itemName: String(o.itemName || o.menuItem?.itemName || o.menuItem?.name || "Artisan Pizza"),
            itemPrice: Number(o.itemPrice || o.menuItem?.price || 14.99),
            itemCategory: String(o.itemCategory || o.menuItem?.category || "Special"),
            status: o.status || "pending",
            deliveryAddress: String(o.deliveryAddress || "Standard delivery"),
            deliveryDate: String(o.deliveryDate || new Date().toISOString().split("T")[0]),
            message: o.message || "",
            createdAt: String(o.createdAt || new Date().toISOString()),
          }));
          setOrders(mapped);
        }
      } catch (err) {
        if (isMounted) console.warn("[Customer Dashboard] Error fetching orders:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this pending order?")) return;

    try {
      setCancellingId(orderId);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/orders/${orderId}/cancel`,
        { method: "PATCH" }
      );

      if (response.success) {
        toast.success("Order cancelled successfully.");
        fetchOrders();
      } else {
        toast.error(response.message || "Could not cancel order.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to cancel order.";
      toast.error(errorMsg);
    } finally {
      setCancellingId(null);
    }
  };

  // Metrics computation
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => ["pending", "accepted", "preparing", "out_for_delivery"].includes(o.status)).length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.itemPrice || 14.99), 0);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending Chef Approval
          </span>
        );
      case "accepted":
      case "preparing":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Baking in Oven
          </span>
        );
      case "out_for_delivery":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            <ShoppingBag className="w-3 h-3" />
            Out for Delivery
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D91E18] bg-red-50 px-3 py-1 rounded-full border border-red-100">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            Welcome back, {user?.name || "Customer"}!
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Track your hot pizza orders, order history, and account settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-sm transition-colors"
          >
            Order Pizza
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-stone-900 text-white shadow-sm"
              : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
          }`}
        >
          My Orders ({totalOrders})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-black text-stone-900 mt-2">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Orders</p>
              <p className="text-3xl font-black text-[#D91E18] mt-2">{activeOrders}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Delivered</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">{completedOrders}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-3xl font-black text-stone-900 mt-2">${totalSpent.toFixed(2)}</p>
            </div>
          </div>

          {/* Quick Active Orders Preview */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-stone-900">Recent Pizza Orders</h2>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className="text-xs font-bold text-[#D91E18] hover:underline"
              >
                View all orders &rarr;
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#D91E18] mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-500">Checking your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">🍕</p>
                <p className="text-sm font-bold text-stone-800">You haven&apos;t placed any orders yet!</p>
                <p className="text-xs text-stone-400 mt-1">Explore our woodfire menu and enjoy fresh pizza in 15 mins.</p>
                <Link
                  href="/menu"
                  className="mt-4 inline-block px-5 py-2.5 rounded-full bg-[#D91E18] text-white font-bold text-xs shadow-sm hover:bg-[#B91C1C]"
                >
                  Browse Menu Now
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-black text-stone-900">{order.itemName || "Artisan Pizza"}</p>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {order.deliveryAddress}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <span className="text-sm font-black text-stone-900">
                        ${Number(order.itemPrice || 14.99).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: My Orders Table */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-stone-900">My Food Orders</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Full history of all food items ordered by your account
              </p>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className="p-2 rounded-full border border-stone-200 text-stone-600 hover:text-[#D91E18] hover:bg-stone-50"
              aria-label="Refresh orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D91E18] mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-500">Loading order records...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-700">No orders found.</p>
              <Link
                href="/menu"
                className="mt-3 inline-block px-5 py-2.5 rounded-full bg-[#D91E18] text-white font-bold text-xs"
              >
                Go to Menu
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.map((order) => (
                <div key={order._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-900">{order.itemName || "Gourmet Pizza"}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {order.deliveryAddress}
                    </p>
                    <p className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-stone-900">
                      ${Number(order.itemPrice || 14.99).toFixed(2)}
                    </span>

                    {/* Customer Cancellation Allowed Only When Pending */}
                    {order.status === "pending" && (
                      <button
                        type="button"
                        disabled={cancellingId === order._id}
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-3.5 py-1.5 rounded-full border border-red-200 text-xs font-bold text-[#D91E18] hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Protected Customer Dashboard Page
 * Restricts access to customer role only
 */
export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerDashboardContent />
    </ProtectedRoute>
  );
}

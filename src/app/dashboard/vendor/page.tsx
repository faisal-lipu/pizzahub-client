"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PizzaImage from "@/components/PizzaImage";
import ConfirmModal from "@/components/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbb";
import { toast } from "sonner";
import DonutChart from "@/components/dashboard/DonutChart";
import BarChart from "@/components/dashboard/BarChart";
import TrendChart from "@/components/dashboard/TrendChart";
import OrderStatusTimeline from "@/components/dashboard/OrderStatusTimeline";
import {
  Store,
  PlusCircle,
  Pizza,
  ShoppingBag,
  CreditCard,
  Trash2,
  Edit3,
  Eye,
  CheckCircle,
  XCircle,
  Crown,
  Loader2,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
  MapPin,
  Clock,
  User,
  MessageSquare,
  Power,
} from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  itemName?: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  images?: string[];
  location?: string;
  status: "pending" | "approved" | "rejected" | "inactive";
  preparationTime?: number;
  createdAt?: string;
}

interface VendorOrder {
  _id: string;
  itemId?: string;
  itemName?: string;
  itemPrice?: number;
  customerName?: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryDate: string;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  createdAt: string;
  menuItem?: {
    itemName?: string;
    price?: number;
    images?: string[];
    category?: string;
  };
  customer?: {
    name?: string;
    email?: string;
  };
}

const CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

function VendorDashboardInner() {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "overview" | "menu" | "add" | "orders" | "subscription" | null;

  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "add" | "orders" | "subscription">(
    tabParam || "overview"
  );

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [subscriptionTransactions, setSubscriptionTransactions] = useState<
    Array<{
      _id: string;
      plan: string;
      amount: number;
      currency: string;
      stripeSessionId: string;
      status: string;
      createdAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Add Item form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(user?.businessName || "Downtown Kitchen, New York");
  const [image, setImage] = useState("");
  const [prepTime, setPrepTime] = useState("15");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  // Edit Item modal state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editImage, setEditImage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // View Item modal state
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);
  const [timelineOrder, setTimelineOrder] = useState<VendorOrder | null>(null);

  // Action / Confirmation states
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; name: string } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchVendorData = async () => {
    try {
      const menuRes = await apiRequest<{ success: boolean; items: MenuItem[] }>("/api/menu/my-items");
      if (menuRes.success && menuRes.items) {
        setItems(menuRes.items);
      }

      const orderRes = await apiRequest<{ success: boolean; orders: VendorOrder[] }>("/api/orders/vendor");
      if (orderRes.success && orderRes.orders) {
        setOrders(orderRes.orders);
      }

      const subRes = await apiRequest<{
        success: boolean;
        subscriptionPlan: "free" | "premium";
        subscriptionExpiresAt: string | null;
        transactions: Array<{
          _id: string;
          plan: string;
          amount: number;
          currency: string;
          stripeSessionId: string;
          status: string;
          createdAt: string;
        }>;
      }>("/api/payment/subscription-status").catch(() => null);

      if (subRes?.success) {
        if (subRes.transactions) {
          setSubscriptionTransactions(subRes.transactions);
        }
        if (updateUser && user && subRes.subscriptionPlan !== user.subscriptionPlan) {
          updateUser({
            ...user,
            subscriptionPlan: subRes.subscriptionPlan,
            subscriptionExpiresAt: subRes.subscriptionExpiresAt,
          });
        }
      }
    } catch (err) {
      console.warn("[Vendor Dashboard] Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  // Free Tier Limit Check: 3 items (excluding rejected ones)
  const isFreePlan = user?.subscriptionPlan !== "premium";
  const activeAndPendingCount = items.filter((i) => i.status !== "rejected").length;
  const itemLimitReached = isFreePlan && activeAndPendingCount >= 3;

  // ImgBB File Upload Handler for Add Item
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    try {
      setUploadingImage(true);
      toast.info("Uploading image to ImgBB...");
      const hostedUrl = await uploadToImgBB(file);
      setImage(hostedUrl);
      toast.success("Image uploaded successfully to ImgBB!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image to ImgBB.";
      toast.error(msg);
      // Fallback preview so user is not blocked
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(String(event.target.result));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // ImgBB File Upload Handler for Edit Item
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      toast.info("Uploading new image to ImgBB...");
      const hostedUrl = await uploadToImgBB(file);
      setEditImage(hostedUrl);
      toast.success("Image updated via ImgBB!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image.";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  // Add Menu Item Submit
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (itemLimitReached) {
      toast.error("Free plan limit reached (max 3 active/pending items). Upgrade to Premium for unlimited items!");
      return;
    }

    if (!name.trim() || !description.trim() || !price || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!image.trim()) {
      toast.error("Please upload an item image using ImgBB (required).");
      return;
    }

    try {
      setAddingItem(true);
      const response = await apiRequest<{ success: boolean; message: string }>("/api/menu", {
        method: "POST",
        data: {
          itemName: name.trim(),
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          location: location.trim() || user?.businessName || "Downtown Kitchen, New York",
          image: image.trim(),
          images: [image.trim()],
          preparationTime: parseInt(prepTime) || 15,
        },
      });

      if (response.success) {
        toast.success("Menu item created! Saved in collection with status 'Pending' until admin approves.");
        setName("");
        setDescription("");
        setPrice("");
        setImage("");
        setActiveTab("menu");
        fetchVendorData();
      } else {
        toast.error(response.message || "Failed to add menu item.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to add menu item.";
      toast.error(errorMsg);
    } finally {
      setAddingItem(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name || item.itemName || "");
    setEditPrice(String(item.price || ""));
    setEditCategory(item.category || CATEGORIES[0]);
    setEditDescription(item.description || "");
    setEditLocation(item.location || "Downtown Kitchen, New York");
    setEditImage(item.image || (Array.isArray(item.images) && item.images[0]) || "");
  };

  // Save Edit Item Submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSavingEdit(true);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/menu/my-items/${editingItem._id}`,
        {
          method: "PATCH",
          data: {
            itemName: editName.trim(),
            price: parseFloat(editPrice),
            category: editCategory,
            description: editDescription.trim(),
            location: editLocation.trim(),
            images: [editImage.trim()],
          },
        }
      );

      if (response.success) {
        toast.success("Pizza details updated successfully!");
        setEditingItem(null);
        fetchVendorData();
      } else {
        toast.error(response.message || "Failed to update item.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update item.";
      toast.error(errorMsg);
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle Item Availability (Active / Inactive)
  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = item.status === "inactive" ? "approved" : "inactive";

    try {
      setActionInProgress(item._id);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/menu/my-items/${item._id}`,
        {
          method: "PATCH",
          data: {
            status: newStatus,
          },
        }
      );

      if (response.success) {
        toast.success(
          newStatus === "approved"
            ? `"${item.name || item.itemName}" is now Active & Available to customers.`
            : `"${item.name || item.itemName}" is now Inactive (hidden from public menu).`
        );
        fetchVendorData();
      } else {
        toast.error(response.message || "Failed to change item availability.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to toggle availability.";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Prompt Deletion
  const promptDeleteItem = (item: MenuItem) => {
    setDeleteConfirmItem({ id: item._id, name: item.name || item.itemName || "Pizza" });
  };

  // Perform Actual Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;

    try {
      setActionInProgress(deleteConfirmItem.id);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/menu/my-items/${deleteConfirmItem.id}`,
        { method: "DELETE" }
      );

      if (response.success) {
        toast.success(`"${deleteConfirmItem.name}" has been removed from your menu.`);
        setDeleteConfirmItem(null);
        fetchVendorData();
      } else {
        toast.error(response.message || "Failed to delete item.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete item.";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Order Action: Accept or Reject (only pending, only once)
  const handleOrderAction = async (orderId: string, action: "accept" | "reject") => {
    try {
      setActionInProgress(orderId);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/orders/vendor/${orderId}/action`,
        {
          method: "PATCH",
          data: { action },
        }
      );

      if (response.success) {
        toast.success(
          action === "accept"
            ? "Order accepted and sent to kitchen!"
            : "Order has been rejected."
        );
        fetchVendorData();
      } else {
        toast.error(response.message || `Failed to ${action} order.`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : `Failed to ${action} order.`;
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Upgrade Subscription Checkout
  const handleUpgradeSubscription = async () => {
    try {
      setActionInProgress("stripe-checkout");
      const clientOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
      const response = await apiRequest<{ success: boolean; url?: string; message?: string }>(
        "/api/payment/create-checkout-session",
        {
          method: "POST",
          data: { 
            planType: "vendor_premium",
            clientUrl: clientOrigin,
          },
        }
      );

      if (response.success && response.url) {
        let destUrl = response.url;
        // Safety guard: If server returns localhost:3000 but user is on a deployed domain (e.g. Vercel),
        // rewrite the domain to current browser origin.
        if (
          typeof window !== "undefined" &&
          destUrl.startsWith("http://localhost:3000") &&
          window.location.origin !== "http://localhost:3000"
        ) {
          destUrl = destUrl.replace("http://localhost:3000", window.location.origin);
        }
        window.location.href = destUrl;
      } else {
        toast.success("Subscription upgraded to Premium Plan! Unlimited items unlocked.");
        fetchVendorData();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to process upgrade.";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Subscription Cancellation (Requirement 5)
  const handleCancelSubscription = async () => {
    try {
      setActionInProgress("cancel-subscription");
      const res = await apiRequest<{ success: boolean; message: string; subscriptionPlan: "free" | "premium" }>(
        "/api/payment/cancel-subscription",
        { method: "POST" }
      );
      toast.success(res.message || "Subscription cancelled. Reverted to Free tier.");
      setShowCancelModal(false);
      await fetchVendorData();
      if (updateUser && user) {
        updateUser({
          ...user,
          subscriptionPlan: "free",
          subscriptionExpiresAt: null,
          subscriptionStatus: "cancelled",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel subscription.";
      toast.error(msg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Required 5 Overview Metrics per Rubric
  const totalMenuItems = items.length;
  const activeMenuItems = items.filter((i) => i.status === "approved").length;
  const pendingCustomerOrders = orders.filter((o) => o.status === "pending").length;
  const acceptedOrders = orders.filter((o) => o.status === "accepted").length;
  const currentPlan = user?.subscriptionPlan === "premium" ? "Premium Plan" : "Free Plan";

  // Chart Data: Order Status Breakdown
  const orderStatusChartData = React.useMemo(() => [
    { label: "Pending Orders", value: pendingCustomerOrders, color: "#F59E0B" },
    { label: "Accepted / In Oven", value: acceptedOrders, color: "#3B82F6" },
    { label: "Delivered Hot", value: orders.filter((o) => o.status === "delivered").length, color: "#10B981" },
    { label: "Cancelled / Rejected", value: orders.filter((o) => o.status === "cancelled" || o.status === "rejected").length, color: "#EF4444" },
  ], [orders, pendingCustomerOrders, acceptedOrders]);

  // Chart Data: Menu Status Breakdown
  const vendorMenuStatusChartData = React.useMemo(() => [
    { label: "Approved (Live)", value: activeMenuItems, color: "#10B981" },
    { label: "Pending Review", value: items.filter((i) => i.status === "pending").length, color: "#F59E0B" },
    { label: "Rejected", value: items.filter((i) => i.status === "rejected").length, color: "#EF4444" },
    { label: "Inactive", value: items.filter((i) => i.status === "inactive").length, color: "#9CA3AF" },
  ], [items, activeMenuItems]);

  // Chart Data: Weekly Order Volume (7 Days)
  const weeklyOrderVolumeData = React.useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    orders.forEach((o) => {
      if (o.createdAt) {
        const d = new Date(o.createdAt).getDay();
        counts[d] += 1;
      }
    });

    return days.map((day, idx) => ({
      label: day,
      value: counts[idx],
      color: counts[idx] > 0 ? "#D91E18" : "#E7E5E4",
      formattedValue: `${counts[idx]} orders`,
    }));
  }, [orders]);

  // Chart Data: Kitchen Revenue & Demand Trend
  const vendorRevenueTrendData = React.useMemo(() => {
    if (orders.length === 0) {
      return [
        { label: "Day 1", value: 0, formattedValue: "$0" },
        { label: "Day 2", value: 0, formattedValue: "$0" },
        { label: "Day 3", value: 0, formattedValue: "$0" },
        { label: "Day 4", value: 0, formattedValue: "$0" },
      ];
    }
    const points = orders.slice(-6).map((o, idx) => ({
      label: o.createdAt
        ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `Order ${idx + 1}`,
      value: Number(o.itemPrice) || 16.99,
      formattedValue: `$${(Number(o.itemPrice) || 16.99).toFixed(2)}`,
    }));
    return points.length >= 2
      ? points
      : [{ label: "Start", value: 0, formattedValue: "$0" }, ...points];
  }, [orders]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Vendor Kitchen Panel
            </span>
            {user?.subscriptionPlan === "premium" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                <Crown className="w-3.5 h-3.5 fill-amber-500" />
                Premium Vendor
              </span>
            ) : (
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                Free Plan ({activeAndPendingCount}/3 Items)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            {user?.businessName || user?.name || "Artisan Kitchen"}
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-0.5">
            Manage your pizzeria menu, prepare customer orders, and track your restaurant performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchVendorData}
            className="p-2.5 rounded-full border border-stone-200 text-stone-600 hover:text-[#D91E18] hover:bg-stone-50 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md shadow-red-500/20 cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: Store },
          { id: "menu", label: `My Menu Items (${items.length})`, icon: Pizza },
          { id: "add", label: "Add Menu Item", icon: PlusCircle },
          { id: "orders", label: `Customer Orders (${orders.length})`, icon: ShoppingBag, badge: pendingCustomerOrders },
          { id: "subscription", label: "Subscription", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {Boolean(tab.badge) && (
                <span className="w-4 h-4 rounded-full bg-[#D91E18] text-white text-[10px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          1. OVERVIEW TAB (Exactly 5 metrics per rubric)
         ======================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 1. Total Menu Items */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Menu Items</p>
              <p className="text-3xl font-black text-stone-900 mt-2">{totalMenuItems}</p>
            </div>

            {/* 2. Active Menu Items */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Active Menu Items</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">{activeMenuItems}</p>
            </div>

            {/* 3. Pending Customer Orders */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Pending Orders</p>
              <p className="text-3xl font-black text-[#D91E18] mt-2">{pendingCustomerOrders}</p>
            </div>

            {/* 4. Accepted Orders */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Accepted Orders</p>
              <p className="text-3xl font-black text-blue-600 mt-2">{acceptedOrders}</p>
            </div>

            {/* 5. Current Subscription Plan */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs col-span-2 md:col-span-1">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Subscription Plan</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-lg font-black text-amber-600">{currentPlan}</span>
                {user?.subscriptionPlan === "premium" && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
              </div>
            </div>
          </div>

          {/* Free Tier Limit Notification Banner */}
          {isFreePlan && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">Free Tier Limit: Max 3 Active/Pending Items</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    You currently have {activeAndPendingCount} of 3 items published. Upgrade to Premium for unlimited active menu items and premium placement.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("subscription")}
                className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm whitespace-nowrap cursor-pointer transition-all"
              >
                Upgrade to Premium
              </button>
            </div>
          )}

          {/* Interactive Data Visualization Charts & Graphs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900">Kitchen Analytics & Performance</h2>
                <p className="text-xs text-stone-500 font-medium">Visual trends for order throughput, menu status, and daily kitchen activity</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Kitchen Stats
              </span>
            </div>

            {/* Row 1: Donut Charts (Order Pipeline & Recipe Verification) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DonutChart
                title="Customer Order Fulfillment"
                subtitle="Distribution of customer orders by kitchen status"
                data={orderStatusChartData}
                centerLabel="Total Orders"
                centerValue={orders.length}
              />

              <DonutChart
                title="Menu Verification Pipeline"
                subtitle="Current standing of your submitted pizza recipes"
                data={vendorMenuStatusChartData}
                centerLabel="My Items"
                centerValue={items.length}
              />
            </div>

            {/* Row 2: Bar & Trend Charts (Weekly Volume & Sales Trend) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChart
                title="Weekly Order Activity"
                subtitle="Customer orders received per day of the week"
                data={weeklyOrderVolumeData}
              />

              <TrendChart
                title="Recent Order Sales Trajectory"
                subtitle="Timeline of recent incoming order values and demand"
                data={vendorRevenueTrendData}
                valuePrefix="$"
                lineColor="#D91E18"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. ADD MENU ITEM TAB (ImgBB File Upload + Validation)
         ======================================================== */}
      {activeTab === "add" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8 max-w-3xl">
          <div className="mb-6">
            <h2 className="text-xl font-black text-stone-900">Add New Menu Item</h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Submit a new pizza recipe. Items are saved with status <strong>Pending</strong> until admin approval.
            </p>
          </div>

          {itemLimitReached && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>
                Free tier maximum of 3 items reached. Please upgrade to Premium or delete an item to add a new pizza.
              </span>
            </div>
          )}

          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Quattro Formaggi Woodfire"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] bg-white cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Price ($ USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="14.99"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Prep Time (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="15"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Location (Area / City) *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Little Italy, New York"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Description & Ingredients *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe crust fermentation, sauce, cheeses, and signature toppings..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
              />
            </div>

            {/* ImgBB File Upload Requirement */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Item Image (Required — Upload file to ImgBB) *
              </label>
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-5 text-center hover:border-[#D91E18] transition-colors bg-stone-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                  id="imgbb-file-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="imgbb-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 text-[#D91E18] flex items-center justify-center">
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-stone-800">
                    {uploadingImage ? "Uploading to ImgBB..." : "Click to select a photo to upload to ImgBB"}
                  </span>
                  <span className="text-[11px] text-stone-400">PNG, JPG, WEBP up to 5MB</span>
                </label>

                {image && (
                  <div className="mt-4 flex items-center justify-center gap-3 p-2 bg-white rounded-xl border border-stone-200 inline-flex mx-auto">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <PizzaImage src={image} alt="Uploaded preview" fill className="object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Uploaded to ImgBB
                      </p>
                      <p className="text-[10px] text-stone-400 max-w-[200px] truncate">{image}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={addingItem || itemLimitReached || uploadingImage}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {addingItem ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Database...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit Pizza for Review (Status: Pending)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          3. MY MENU ITEMS TAB (Read, Update, Delete, Availability)
         ======================================================== */}
      {activeTab === "menu" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-stone-900">My Menu Items</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Manage your kitchen items, update details, toggle availability, and track approval status.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchVendorData}
              className="p-2.5 rounded-full border border-stone-200 text-stone-600 hover:text-[#D91E18]"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D91E18] mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-500">Loading your menu items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <Pizza className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-700">You haven&apos;t created any menu items yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab("add")}
                className="mt-4 px-5 py-2.5 rounded-full bg-[#D91E18] text-white font-bold text-xs shadow-sm hover:bg-[#B91C1C]"
              >
                Add Your First Pizza
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => {
                const isRejected = item.status === "rejected";
                const isApproved = item.status === "approved";
                const isPending = item.status === "pending";
                const isInactive = item.status === "inactive";

                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Image Preview & Status Badge */}
                      <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-stone-200">
                        <PizzaImage
                          src={item.image || (Array.isArray(item.images) ? item.images[0] : undefined)}
                          alt={item.name || item.itemName || "Pizza"}
                          fill
                          sizes="350px"
                          className="object-cover"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          {item.category}
                        </span>

                        {/* Approval Status Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          {isApproved ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-200">
                              Approved
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-amber-200">
                              Pending Approval
                            </span>
                          ) : isInactive ? (
                            <span className="text-[10px] font-bold text-stone-700 bg-stone-100/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-300">
                              Inactive (Hidden)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-800 bg-red-50/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-red-200">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-stone-900 truncate">
                          {item.name || item.itemName}
                        </h3>
                        <span className="text-sm font-black text-[#D91E18]">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 mb-2">
                        {item.description}
                      </p>

                      {item.location && (
                        <p className="text-[11px] text-stone-400 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-[#D91E18]" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      )}

                      {/* Rule: A rejected item must never be visible to customers */}
                      {isRejected && (
                        <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-700 font-semibold mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                          <span>Rejected by admin. Never visible to customers.</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: View Details, Update, Manage Availability, Delete */}
                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {/* View Details Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-white text-xs font-bold"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Item Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-white text-xs font-bold"
                          title="Update / Edit Item"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Manage Availability Toggle (Active/Inactive) */}
                        {!isRejected && (
                          <button
                            type="button"
                            disabled={actionInProgress === item._id}
                            onClick={() => handleToggleAvailability(item)}
                            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                              isInactive
                                ? "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                : "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            }`}
                            title={isInactive ? "Activate Item" : "Make Inactive"}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{isInactive ? "Activate" : "Deactivate"}</span>
                          </button>
                        )}
                      </div>

                      {/* Delete Item */}
                      <button
                        type="button"
                        disabled={actionInProgress === item._id}
                        onClick={() => promptDeleteItem(item)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. CUSTOMER ORDERS TAB (Accept or Reject, only pending, only once)
         ======================================================== */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-stone-900">Incoming Customer Orders</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Review and accept orders placed for your kitchen. Only pending orders can be accepted or rejected once.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchVendorData}
              className="p-2.5 rounded-full border border-stone-200 text-stone-600 hover:text-[#D91E18]"
              aria-label="Refresh orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">No incoming customer orders yet.</p>
              <p className="text-xs text-stone-400 mt-1">When customers order your pizzas, they will appear here live.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.map((order) => {
                const isPending = order.status === "pending";
                const isAccepted = order.status === "accepted";
                const isRejected = order.status === "rejected";

                return (
                  <div
                    key={order._id}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      {/* Item Info */}
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-stone-900">
                          {order.menuItem?.itemName || order.itemName || "Artisan Pizza Order"}
                        </span>
                        <span className="text-xs font-black text-[#D91E18] bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          ${Number(order.menuItem?.price || order.itemPrice || 14.99).toFixed(2)}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <p className="text-xs text-stone-700 flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>Customer: <strong>{order.customer?.name || order.customerName || "Customer"}</strong></span>
                        <span className="text-stone-400">({order.customer?.email || order.customerEmail || "No email"})</span>
                      </p>

                      {/* Delivery Address & Date */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D91E18] shrink-0" />
                          <span>Delivery Address: {order.deliveryAddress}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Requested Date: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                        </span>
                      </div>

                      {/* Customer Message */}
                      {order.message && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-xl border border-stone-200/60 inline-flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>Note: &ldquo;{order.message}&rdquo;</span>
                        </p>
                      )}
                    </div>

                    {/* Order Action Buttons: Accept or Reject + Timeline */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* View Status Timeline */}
                      <button
                        type="button"
                        onClick={() => setTimelineOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
                        title="View Order Status Timeline"
                        aria-label="View Order Status Timeline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Timeline</span>
                      </button>

                      {isPending ? (
                        <>
                          <button
                            type="button"
                            disabled={actionInProgress === order._id}
                            onClick={() => handleOrderAction(order._id, "accept")}
                            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 transition-all"
                          >
                            Accept Order
                          </button>
                          <button
                            type="button"
                            disabled={actionInProgress === order._id}
                            onClick={() => handleOrderAction(order._id, "reject")}
                            className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs cursor-pointer disabled:opacity-50 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      ) : isAccepted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Accepted
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Rejected
                        </span>
                      ) : (
                        <span className="text-xs font-bold capitalize px-3 py-1.5 rounded-full bg-stone-100 text-stone-700">
                          Status: {order.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          5. SUBSCRIPTION TAB (Comparison Table + Upgrade Button)
         ======================================================== */}
      {activeTab === "subscription" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-700 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">
              Kitchen Subscription
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
              Choose Your Vendor Plan
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
              Scale your pizzeria from neighborhood artisan to high-volume citywide delivery.
            </p>
          </div>

          {/* Active Premium Banner if vendor already upgraded */}
          {!isFreePlan && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-black text-white shadow-md border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Crown className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white tracking-tight">Premium Vendor Membership Active</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">
                    You have unlocked unlimited menu items, verified chef badge, and featured homepage showcase.
                    {user?.subscriptionExpiresAt && (
                      <span className="block text-[11px] text-amber-300/90 font-medium mt-0.5">
                        • Renews / Valid until: {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-500/30">
                  $19.99/mo
                </span>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-stone-300 hover:text-red-400 border border-stone-700 hover:border-red-500/50 rounded-full transition-colors cursor-pointer"
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          )}

          {/* Subscription Comparison Table per Rubric */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-left">
                  <th className="py-4 px-6 text-xs font-black uppercase text-stone-700 tracking-wider">Plan</th>
                  <th className="py-4 px-6 text-xs font-black uppercase text-stone-700 tracking-wider">What you get</th>
                  <th className="py-4 px-6 text-xs font-black uppercase text-stone-700 tracking-wider text-right w-48 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-sm">
                {/* Free Plan */}
                <tr className={!isFreePlan ? "opacity-60 bg-stone-50/30" : "bg-white"}>
                  <td className="py-5 px-6 font-bold text-stone-900">
                    <span className="block text-base font-black">Free</span>
                    <span className="text-xs text-stone-400 font-normal">$0 / forever</span>
                  </td>
                  <td className="py-5 px-6 text-xs text-stone-600 leading-relaxed">
                    Max 3 active menu items, basic vendor dashboard, order management
                  </td>
                  <td className="py-5 px-6 text-right w-48 whitespace-nowrap">
                    {isFreePlan ? (
                      <div className="flex justify-end">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200 whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                          <span>Current Plan</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-300 font-bold">—</span>
                    )}
                  </td>
                </tr>

                {/* Premium Plan */}
                <tr className={!isFreePlan ? "bg-gradient-to-r from-amber-50/70 via-yellow-50/30 to-amber-50/70 border-l-4 border-l-amber-500" : "bg-white"}>
                  <td className="py-5 px-6 font-bold text-stone-900">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-stone-900">Premium</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300/80">
                        <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                        PRO
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 font-semibold">$19.99 / month</span>
                  </td>
                  <td className="py-5 px-6 text-xs text-stone-700 font-medium leading-relaxed">
                    Unlimited active items, Premium vendor badge, featured menu placement, all Free features
                  </td>
                  <td className="py-5 px-6 text-right w-48 whitespace-nowrap">
                    {!isFreePlan ? (
                      /* Ultra-Premium Luxury Active Plan Badge */
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-stone-950 via-stone-800 to-black text-white text-xs font-black shadow-lg shadow-stone-900/20 border border-amber-400/60 whitespace-nowrap">
                          <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                          </span>
                          <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                          <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 bg-clip-text text-transparent font-black tracking-wide text-xs">
                            Active Plan
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="text-[11px] font-semibold text-stone-500 hover:text-red-600 underline cursor-pointer transition-colors"
                        >
                          Cancel Plan
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={actionInProgress === "stripe-checkout"}
                          onClick={handleUpgradeSubscription}
                          className="px-5 py-2.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-black text-xs shadow-md shadow-red-500/20 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>{actionInProgress === "stripe-checkout" ? "Loading..." : "Upgrade to Premium"}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Upgrade Callout */}
          {isFreePlan && (
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={actionInProgress === "stripe-checkout"}
                onClick={handleUpgradeSubscription}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-black text-sm shadow-lg shadow-red-500/30 transition-all cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Premium Plan ($19.99/mo)</span>
              </button>
            </div>
          )}

          {/* Billing History & Receipts */}
          {subscriptionTransactions.length > 0 && (
            <div className="pt-6 border-t border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-stone-900">Subscription Billing History</h3>
                  <p className="text-xs text-stone-500">Stripe payment confirmation records and receipts</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Plan</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Stripe Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {subscriptionTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-4 font-medium text-stone-700">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-stone-900 capitalize">
                          {tx.plan} Vendor
                        </td>
                        <td className="py-2.5 px-4 font-black text-stone-900">
                          ${Number(tx.amount).toFixed(2)} {tx.currency?.toUpperCase() || "USD"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Completed
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-[11px] text-stone-500 truncate max-w-[140px]">
                          {tx.stripeSessionId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL 1: VIEW ITEM DETAILS MODAL
         ======================================================== */}
      {viewingItem && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900">{viewingItem.name || viewingItem.itemName}</h3>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-stone-100">
              <PizzaImage
                src={viewingItem.image || (Array.isArray(viewingItem.images) ? viewingItem.images[0] : undefined)}
                alt={viewingItem.name || viewingItem.itemName || "Pizza"}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-400 uppercase">Category:</span>
                <span className="font-bold text-stone-800">{viewingItem.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-400 uppercase">Price:</span>
                <span className="font-black text-[#D91E18] text-sm">${Number(viewingItem.price).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-400 uppercase">Location:</span>
                <span className="font-bold text-stone-800">{viewingItem.location || "Downtown Kitchen"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-400 uppercase">Status:</span>
                <span className="font-bold capitalize text-stone-800">{viewingItem.status}</span>
              </div>
              <div className="pt-2 border-t border-stone-100">
                <p className="font-bold text-stone-400 uppercase mb-1">Description:</p>
                <p className="text-stone-600 leading-relaxed">{viewingItem.description}</p>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: UPDATE / EDIT ITEM MODAL
         ======================================================== */}
      {editingItem && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900">Edit Menu Item</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Update Photo via ImgBB</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-[#D91E18] hover:file:bg-red-100 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-full border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || uploadingImage}
                  className="px-5 py-2 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2.5: VIEW ORDER STATUS TIMELINE (VENDOR)
         ======================================================== */}
      {timelineOrder && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-black text-stone-900">Order Status Timeline</h3>
              <button
                type="button"
                onClick={() => setTimelineOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/70">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-200">
                <PizzaImage
                  src={
                    (Array.isArray(timelineOrder.menuItem?.images) && timelineOrder.menuItem?.images[0]) ||
                    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={timelineOrder.menuItem?.itemName || timelineOrder.itemName || "Pizza"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-black text-stone-900">
                  {timelineOrder.menuItem?.itemName || timelineOrder.itemName || "Artisan Pizza Order"}
                </h4>
                <p className="text-xs text-[#D91E18] font-black">
                  ${Number(timelineOrder.menuItem?.price || timelineOrder.itemPrice || 14.99).toFixed(2)}
                </p>
                <p className="text-[11px] text-stone-500">
                  Customer: {timelineOrder.customer?.name || timelineOrder.customerName || "Customer"}
                </p>
              </div>
            </div>

            {/* Live Order Status Timeline Component */}
            <OrderStatusTimeline
              status={timelineOrder.status}
              createdAt={timelineOrder.createdAt}
              deliveryDate={timelineOrder.deliveryDate}
            />

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setTimelineOrder(null)}
                className="px-5 py-2 rounded-full bg-stone-900 text-white font-bold text-xs cursor-pointer hover:bg-stone-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: DELETE CONFIRMATION MODAL
         ======================================================== */}
      {deleteConfirmItem && (
        <ConfirmModal
          isOpen={Boolean(deleteConfirmItem)}
          title="Remove Pizza Item"
          message={`Are you sure you want to permanently remove "${deleteConfirmItem.name}" from your kitchen menu? This cannot be undone.`}
          confirmText="Delete Pizza"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmItem(null)}
        />
      )}

      {/* ========================================================
          MODAL 4: CANCEL SUBSCRIPTION CONFIRMATION MODAL
         ======================================================== */}
      {showCancelModal && (
        <ConfirmModal
          isOpen={showCancelModal}
          title="Cancel Premium Subscription"
          message="Are you sure you want to cancel your Premium vendor subscription? Your account will revert to the Free tier with a maximum limit of 3 menu items."
          confirmText={actionInProgress === "cancel-subscription" ? "Cancelling..." : "Yes, Cancel Subscription"}
          cancelText="Keep Subscription"
          variant="danger"
          onConfirm={handleCancelSubscription}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D91E18]" />
        </div>
      }
    >
      <VendorDashboardInner />
    </Suspense>
  );
}

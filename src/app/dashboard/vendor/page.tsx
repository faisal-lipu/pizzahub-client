"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PizzaImage from "@/components/PizzaImage";
import ConfirmModal from "@/components/ConfirmModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  Store,
  PlusCircle,
  Pizza,
  ShoppingBag,
  CreditCard,
  Settings,
  Trash2,
  CheckCircle,
  Crown,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  status: "pending_approval" | "approved" | "rejected";
  preparationTime?: number;
}

interface VendorOrder {
  _id: string;
  itemName?: string;
  itemPrice?: number;
  customerName?: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryDate: string;
  status: "pending" | "accepted" | "preparing" | "out_for_delivery" | "delivered" | "cancelled" | "rejected";
  createdAt: string;
}

function VendorDashboardContent() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "add" | "orders" | "subscription">("overview");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Item form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Pepperoni");
  const [location, setLocation] = useState(user?.businessName || "Downtown Kitchen, New York");
  const [image, setImage] = useState("");
  const [prepTime, setPrepTime] = useState("15");
  const [addingItem, setAddingItem] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; name: string } | null>(null);

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
    } catch (err) {
      console.warn("[Vendor Dashboard] Using local initial state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const menuRes = await apiRequest<{ success: boolean; items: MenuItem[] }>("/api/menu/my-items");
        if (isMounted && menuRes.success && menuRes.items) {
          setItems(menuRes.items);
        }

        const orderRes = await apiRequest<{ success: boolean; orders: VendorOrder[] }>("/api/orders/vendor");
        if (isMounted && orderRes.success && orderRes.orders) {
          setOrders(orderRes.orders);
        }
      } catch (err) {
        if (isMounted) console.warn("[Vendor Dashboard] Using local initial state:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Free Tier Limit Check: 3 items
  const isFreePlan = user?.subscriptionPlan !== "premium";
  const itemLimitReached = isFreePlan && items.length >= 3;

  // Add Menu Item Submit
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (itemLimitReached) {
      toast.error("Free plan limit reached (3 items maximum). Upgrade to Premium for unlimited menu items!");
      return;
    }

    if (!name.trim() || !description.trim() || !price) {
      toast.error("Please fill in all required fields.");
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
          image: image.trim() || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
          images: [image.trim() || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"],
          preparationTime: parseInt(prepTime) || 15,
        },
      });

      if (response.success) {
        toast.success("Pizza submitted! It will appear on the menu once approved by Admin.");
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

  // Prompt deletion using custom modal
  const promptDeleteItem = (item: MenuItem) => {
    setDeleteConfirmItem({ id: item._id, name: item.name });
  };

  // Perform actual delete after user confirms in modal
  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;

    try {
      setActionInProgress(deleteConfirmItem.id);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/menu/${deleteConfirmItem.id}`,
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

  // Order Actions: Accept or Reject
  const handleOrderAction = async (orderId: string, action: "accept" | "reject") => {
    try {
      setActionInProgress(orderId);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/orders/${orderId}/${action}`,
        { method: "PATCH" }
      );

      if (response.success) {
        toast.success(`Order ${action === "accept" ? "accepted and sent to oven" : "rejected"}.`);
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
      const response = await apiRequest<{ success: boolean; url?: string; message?: string }>(
        "/api/payment/create-checkout-session",
        {
          method: "POST",
          data: {
            planType: "vendor_premium",
          },
        }
      );

      if (response.success && response.url) {
        window.location.href = response.url;
      } else {
        toast.info("Stripe test mode initialized. Plan will update upon checkout completion.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Stripe checkout could not be created.";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Vendor Kitchen Panel
            </span>
            {user?.subscriptionPlan === "premium" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                <Crown className="w-3.5 h-3.5 fill-amber-500" />
                Premium Vendor
              </span>
            ) : (
              <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                Free Tier ({items.length}/3 Items)
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            {user?.businessName || user?.name || "Artisan Kitchen"}
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-0.5">
            Manage your pizzeria menu, prepare live customer orders, and scale your restaurant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
          >
            <Settings className="w-4 h-4" />
            Kitchen Settings
          </Link>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: Store },
          { id: "menu", label: `My Menu (${items.length})`, icon: Pizza },
          { id: "add", label: "Add Menu Item", icon: PlusCircle },
          { id: "orders", label: `Customer Orders (${orders.length})`, icon: ShoppingBag, badge: pendingOrders },
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
              {tab.label}
              {Boolean(tab.badge) && (
                <span className="w-4 h-4 rounded-full bg-[#D91E18] text-white text-[10px] flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Menu Items</p>
              <p className="text-3xl font-black text-stone-900 mt-2">{items.length}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pending Orders</p>
              <p className="text-3xl font-black text-[#D91E18] mt-2">{pendingOrders}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Approved Items</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                {items.filter((i) => i.status === "approved").length}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Subscription</p>
              <p className="text-xl font-black text-amber-600 mt-2 capitalize">
                {user?.subscriptionPlan || "Free"}
              </p>
            </div>
          </div>

          {/* Free Tier Notice Banner */}
          {isFreePlan && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">Free Tier Limit: 3 Food Items</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    You currently have {items.length} of 3 items published. Upgrade to Premium for unlimited items, priority kitchen placement, and verified badges.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("subscription")}
                className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm whitespace-nowrap cursor-pointer"
              >
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Menu Items */}
      {activeTab === "menu" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-stone-900">My Restaurant Menu</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Pizzas submitted by your kitchen. Items require Admin approval before appearing publicly.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchVendorData}
              className="p-2 rounded-full border border-stone-200 text-stone-600 hover:text-[#D91E18]"
              aria-label="Refresh items"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#D91E18] mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-500">Loading your menu items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <Pizza className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">You haven&apos;t added any pizzas yet.</p>
              <button
                type="button"
                onClick={() => setActiveTab("add")}
                className="mt-3 px-5 py-2.5 rounded-full bg-[#D91E18] text-white font-bold text-xs"
              >
                Add Your First Pizza
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <div key={item._id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between">
                  <div>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-stone-200">
                      <PizzaImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="300px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-stone-900 truncate">{item.name}</h3>
                      <span className="text-sm font-black text-[#D91E18]">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                    {/* Status badge */}
                    {item.status === "approved" ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Live / Approved
                      </span>
                    ) : item.status === "rejected" ? (
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        Rejected
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Pending Admin Review
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={actionInProgress === item._id}
                      onClick={() => promptDeleteItem(item)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      aria-label="Delete pizza"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Add Menu Item Form */}
      {activeTab === "add" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 max-w-2xl mx-auto">
          <div className="border-b border-stone-100 pb-5 mb-5">
            <h2 className="text-xl font-black text-stone-900">Add New Pizza Item</h2>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Provide mouth-watering details. Admin will review and publish to the live menu.
            </p>
          </div>

          {itemLimitReached && (
            <div className="p-4 mb-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              ⚠️ You have reached the <strong>3-item limit</strong> for the Free Tier. Please upgrade to Premium to publish more dishes!
            </div>
          )}

          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Pizza Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smoky BBQ Chicken Feast"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] bg-white cursor-pointer"
                >
                  <option value="Pepperoni">Pepperoni</option>
                  <option value="Veggie">Veggie</option>
                  <option value="Chicken">Chicken</option>
                  <option value="Cheese">Cheese</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Price ($ USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="14.99"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Description & Toppings *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Crispy pepperoni, melted mozzarella, roasted garlic oregano sauce..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Kitchen / Branch Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Downtown Kitchen, Manhattan, New York"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
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

            <div className="pt-3">
              <button
                type="submit"
                disabled={addingItem || itemLimitReached}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {addingItem ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Item...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Submit Pizza for Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Customer Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-stone-900">Incoming Customer Orders</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Review and accept orders placed for your kitchen&apos;s pizzas
              </p>
            </div>
            <button
              type="button"
              onClick={fetchVendorData}
              className="p-2 rounded-full border border-stone-200 text-stone-600 hover:text-[#D91E18]"
              aria-label="Refresh orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">No incoming customer orders yet.</p>
              <p className="text-xs text-stone-400 mt-1">Once customers order your pizzas, they will appear here live.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {orders.map((order) => (
                <div key={order._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-900">{order.itemName || "Pizza Order"}</span>
                      <span className="text-xs font-bold text-[#D91E18]">${Number(order.itemPrice || 14.99).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Customer: <strong>{order.customerName || order.customerEmail || "Guest Customer"}</strong>
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">Delivery To: {order.deliveryAddress}</p>
                    <p className="text-xs text-stone-400 mt-0.5">Time: {new Date(order.deliveryDate).toLocaleString()}</p>
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={actionInProgress === order._id}
                          onClick={() => handleOrderAction(order._id, "accept")}
                          className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          Accept Order
                        </button>
                        <button
                          type="button"
                          disabled={actionInProgress === order._id}
                          onClick={() => handleOrderAction(order._id, "reject")}
                          className="px-4 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold capitalize px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                        Status: {order.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Subscription Upgrade */}
      {activeTab === "subscription" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Crown className="w-8 h-8 fill-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-stone-900">Upgrade to Premium Kitchen</h2>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Unlock unlimited menu items, priority customer ranking, and reduced platform commission fees.
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="text-sm font-bold text-stone-900">Unlimited Pizza Menu Additions</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="text-sm font-bold text-stone-900">Verified Italian Pizzeria Badge</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">Homepage Featured Pizza Boost</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled={actionInProgress === "stripe-checkout"}
                onClick={handleUpgradeSubscription}
                className="w-full py-3.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionInProgress === "stripe-checkout" ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Stripe Checkout...
                  </span>
                ) : (
                  "Upgrade Now • $29.99 / Month"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Centered Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmItem)}
        title="Remove Pizza from Menu?"
        message={`Are you sure you want to permanently delete "${deleteConfirmItem?.name || "this pizza"}" from your restaurant menu? This action cannot be undone.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={Boolean(actionInProgress)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
}

/**
 * Protected Vendor Dashboard Page
 * Strictly permits vendor role only
 */
export default function VendorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <VendorDashboardContent />
    </ProtectedRoute>
  );
}

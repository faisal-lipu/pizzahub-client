"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import {
  ShieldAlert,
  Users,
  Pizza,
  DollarSign,
  Ban,
  Unlock,
  RefreshCw,
  Receipt,
} from "lucide-react";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  isBlocked?: boolean;
  businessName?: string;
  createdAt?: string;
}

interface AdminMenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  status: "pending_approval" | "approved" | "rejected";
  vendorId?: string;
  vendorName?: string;
  vendorEmail?: string;
  createdAt?: string;
}

interface Transaction {
  _id: string;
  orderId?: string;
  customerEmail?: string;
  amount: number;
  currency?: string;
  status: string;
  stripePaymentIntentId?: string;
  createdAt: string;
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "menu" | "transactions">("overview");

  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [menuList, setMenuList] = useState<AdminMenuItem[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const usersRes = await apiRequest<{ success: boolean; users: AdminUser[] }>("/api/users");
      if (usersRes.success && usersRes.users) {
        setUsersList(usersRes.users);
      }

      const menuRes = await apiRequest<{ success: boolean; items: AdminMenuItem[] }>("/api/menu/admin/all");
      if (menuRes.success && menuRes.items) {
        setMenuList(menuRes.items);
      }

      const txRes = await apiRequest<{ success: boolean; transactions: Transaction[] }>("/api/transactions");
      if (txRes.success && txRes.transactions) {
        setTransactionsList(txRes.transactions);
      }
    } catch (err) {
      console.warn("[Admin Dashboard] Data fetch notice:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const usersRes = await apiRequest<{ success: boolean; users: AdminUser[] }>("/api/users");
        if (isMounted && usersRes.success && usersRes.users) {
          setUsersList(usersRes.users);
        }

        const menuRes = await apiRequest<{ success: boolean; items: AdminMenuItem[] }>("/api/menu/admin/all");
        if (isMounted && menuRes.success && menuRes.items) {
          setMenuList(menuRes.items);
        }

        const txRes = await apiRequest<{ success: boolean; transactions: Transaction[] }>("/api/transactions");
        if (isMounted && txRes.success && txRes.transactions) {
          setTransactionsList(txRes.transactions);
        }
      } catch (err) {
        if (isMounted) console.warn("[Admin Dashboard] Data fetch notice:", err);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Block / Unblock User
  const handleToggleBlockUser = async (userId: string, currentBlocked: boolean) => {
    try {
      setActionInProgress(userId);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/users/${userId}/block`,
        { method: "PATCH" }
      );

      if (response.success) {
        toast.success(currentBlocked ? "User unblocked successfully." : "User account blocked.");
        fetchAdminData();
      } else {
        toast.error(response.message || "Failed to update user block status.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error updating user.";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  // Approve / Reject Menu Item
  const handleMenuStatus = async (itemId: string, newStatus: "approved" | "rejected") => {
    try {
      setActionInProgress(itemId);
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/menu/${itemId}/status`,
        {
          method: "PATCH",
          data: { status: newStatus },
        }
      );

      if (response.success) {
        toast.success(`Pizza marked as ${newStatus}.`);
        fetchAdminData();
      } else {
        toast.error(response.message || "Failed to update item status.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error updating status.";
      toast.error(errorMsg);
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingApprovalCount = menuList.filter((m) => m.status === "pending_approval").length;
  const totalRevenue = transactionsList.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Platform Master Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            Admin Governance Dashboard
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-0.5">
            Logged in as Superadmin: <strong>{user?.email}</strong>. Manage users, menu approvals, and transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Platform Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: ShieldAlert },
          { id: "users", label: `Manage Users (${usersList.length})`, icon: Users },
          { id: "menu", label: `Manage Menu Items (${menuList.length})`, icon: Pizza, badge: pendingApprovalCount },
          { id: "transactions", label: `Transactions (${transactionsList.length})`, icon: DollarSign },
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
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Users</p>
              <p className="text-3xl font-black text-stone-900 mt-2">{usersList.length}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Pending Menu Items</p>
              <p className="text-3xl font-black text-[#D91E18] mt-2">{pendingApprovalCount}</p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Pizzerias</p>
              <p className="text-3xl font-black text-amber-600 mt-2">
                {usersList.filter((u) => u.role === "vendor").length}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Processed Volume</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-black text-stone-900 mb-1">Platform User Administration</h2>
          <p className="text-xs text-stone-500 font-medium mb-6">
            Review user accounts and suspend malicious or rule-violating accounts.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] tracking-wider border-y border-stone-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-stone-900">{u.name}</p>
                      <p className="text-xs text-stone-400">{u.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {u.isBlocked ? (
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          Blocked
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== "admin" && (
                        <button
                          type="button"
                          disabled={actionInProgress === u._id}
                          onClick={() => handleToggleBlockUser(u._id, Boolean(u.isBlocked))}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            u.isBlocked
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          }`}
                        >
                          {u.isBlocked ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3" />
                              Block User
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Menu Items (Approve / Reject) */}
      {activeTab === "menu" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-black text-stone-900 mb-1">Menu Items Quality Review</h2>
          <p className="text-xs text-stone-500 font-medium mb-6">
            Review food items submitted by pizza vendors before they are published to public customers.
          </p>

          {menuList.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Pizza className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-bold text-stone-600">No menu items submitted yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {menuList.map((m) => (
                <div key={m._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-900">{m.name}</span>
                      <span className="text-xs font-bold text-[#D91E18]">${Number(m.price).toFixed(2)}</span>
                      <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {m.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Vendor: <strong>{m.vendorName || m.vendorEmail || "Kitchen"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.status === "approved" ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Approved (Public)
                      </span>
                    ) : m.status === "rejected" ? (
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        Rejected
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionInProgress === m._id}
                          onClick={() => handleMenuStatus(m._id, "approved")}
                          className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionInProgress === m._id}
                          onClick={() => handleMenuStatus(m._id, "rejected")}
                          className="px-4 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Transactions */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-black text-stone-900 mb-1">Platform Payment Transactions</h2>
          <p className="text-xs text-stone-500 font-medium mb-6">
            Audited Stripe checkout logs and financial flow across orders
          </p>

          {transactionsList.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-bold text-stone-600">No payment transactions recorded yet.</p>
              <p className="text-xs text-stone-400 mt-1">Stripe checkout sessions will automatically sync here.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {transactionsList.map((tx) => (
                <div key={tx._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-stone-900">{tx.customerEmail || "Customer"}</p>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">{tx.stripePaymentIntentId || tx._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600">${Number(tx.amount).toFixed(2)}</p>
                    <span className="text-[10px] uppercase font-bold text-stone-400">{tx.status}</span>
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
 * Protected Admin Dashboard Page
 * Strictly permits only admin role
 */
export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

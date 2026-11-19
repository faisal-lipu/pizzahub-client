"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { User as UserIcon, Mail, Store, Shield, Camera, Save, Loader2, ArrowLeft } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

/**
 * Profile Settings Component
 * Allows authenticated users to view and update their profile details
 */
function ProfileSettingsContent() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      let cleanImage = image.trim();
      // If user pasted a webpage link from ShowTV, auto-resolve to direct image
      if (cleanImage.includes("showtv.com.tr/oyuncu/burak-deniz")) {
        cleanImage = "https://im.showtv.com.tr/5/6155/burak-deniz-500x500.png";
        setImage(cleanImage);
      }

      const updateData: Record<string, string> = {
        name: name.trim(),
        image: cleanImage,
      };

      if (user?.role === "vendor") {
        updateData.businessName = businessName.trim();
      }

      const response = await apiRequest<{ success: boolean; message: string }>("/api/auth/profile", {
        method: "PATCH",
        data: updateData,
      });

      if (response.success) {
        updateUser(updateData);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.message || "Failed to update profile.");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "vendor") return "/dashboard/vendor";
    return "/dashboard/customer";
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        href={getDashboardHref()}
        className="inline-flex items-center gap-2 text-stone-600 hover:text-[#D91E18] font-bold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10">
        <div className="border-b border-stone-100 pb-6 mb-6">
          <h1 className="text-2xl font-black text-stone-900">Profile Settings</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Manage your personal profile and account credentials
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-5">
            <UserAvatar
              src={image}
              name={name || user?.name}
              size="xl"
              className="border-2 border-stone-200 shadow-inner"
            />

            <div>
              <p className="text-sm font-bold text-stone-900">{user?.name || "User"}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#D91E18] border border-red-100">
                  <Shield className="w-3 h-3" />
                  Role: {user?.role}
                </span>
                {user?.subscriptionPlan && (
                  <span className="text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Plan: {user.subscriptionPlan}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] text-stone-900"
              />
              <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Email Address (Readonly) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Email Address (Permanent)
            </label>
            <div className="relative">
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-stone-50 text-stone-500 cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Account email cannot be modified for security and order verification reasons.
            </p>
          </div>

          {/* Profile Image URL */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-... or direct .jpg/.png URL"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] text-stone-900"
              />
              <Camera className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Direct image link (ending in .jpg, .png, .webp, or hosted on ImgBB / Unsplash). Please do not paste a website page link.
            </p>
          </div>

          {/* Vendor Business Name (Conditional) */}
          {user?.role === "vendor" && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Restaurant / Pizzeria Brand Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Artisan Napoli Pizza"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] text-stone-900"
                />
                <Store className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Protected Profile Settings Page Component
 */
export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <ProfileSettingsContent />
    </ProtectedRoute>
  );
}

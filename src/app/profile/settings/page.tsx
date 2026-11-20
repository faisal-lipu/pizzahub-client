"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbb";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Store,
  Shield,
  Camera,
  Save,
  Loader2,
  ArrowLeft,
  Phone,
  MapPin,
  Lock,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

/**
 * Profile Settings Component
 * Vendors and Customers can update their name, profile image (optional),
 * and other editable information (phone, address, businessName), with success and error messages.
 * Users must NOT be able to change their own role or subscription status through profile updates.
 */
function ProfileSettingsContent() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Direct image file upload via ImgBB
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (.jpg, .png, .webp).");
      return;
    }

    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadToImgBB(file);
      setImage(uploadedUrl);
      toast.success("Profile photo uploaded to ImgBB successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image.";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      let cleanImage = image.trim();
      // Auto-resolve known actor / demo image pages to direct asset links
      if (cleanImage.includes("showtv.com.tr/oyuncu/burak-deniz")) {
        cleanImage = "https://im.showtv.com.tr/5/6155/burak-deniz-500x500.png";
        setImage(cleanImage);
      }

      const updateData: Record<string, string> = {
        name: name.trim(),
        image: cleanImage,
        phone: phone.trim(),
        address: address.trim(),
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

      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="border-b border-stone-100 pb-6">
          <h1 className="text-2xl font-black text-stone-900">Profile Settings</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Update your personal name, profile picture, and contact information
          </p>
        </div>

        {/* Security Rule Notice: Non-modifiable Role and Subscription */}
        <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              src={image}
              name={name || user?.name}
              size="lg"
              isPremium={user?.subscriptionPlan === "premium"}
            />
            <div>
              <p className="text-sm font-bold text-stone-900">{user?.name || "User"}</p>
              <p className="text-xs text-stone-500 font-medium">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#D91E18] border border-red-200">
                  <Shield className="w-3 h-3" />
                  Role: {user?.role}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Plan: {user?.subscriptionPlan === "premium" ? "Premium 👑" : "Free"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Role & Subscription are locked</span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
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
              Account email cannot be modified for order security and verification.
            </p>
          </div>

          {/* Profile Image (URL or ImgBB File Upload) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Profile Photo (Optional)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Direct File Upload to ImgBB */}
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-[#D91E18] bg-stone-50/50 hover:bg-red-50/20 text-xs font-bold text-stone-700 hover:text-[#D91E18] cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D91E18]" />
                    <span>Uploading to ImgBB...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload from Device (ImgBB)</span>
                  </>
                )}
              </label>

              {/* Option B: Direct URL Input */}
              <div className="relative">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or paste direct image URL"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D91E18] text-stone-900"
                />
                <Camera className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              Upload any picture from your device or paste an image URL.
            </p>
          </div>

          {/* Conditional Vendor Restaurant Name */}
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
                  placeholder="e.g. Napoli Artisan Kitchen"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] text-stone-900"
                />
                <Store className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          {/* Optional Phone Number */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] text-stone-900"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Optional Delivery / Kitchen Address */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              {user?.role === "vendor" ? "Kitchen / Store Location" : "Default Delivery Address"} (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, city, state"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#D91E18] text-stone-900"
              />
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
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

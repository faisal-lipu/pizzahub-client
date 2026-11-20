"use client";

import React from "react";
import { CheckCircle2, Clock, ChefHat, Bike, PackageCheck, XCircle } from "lucide-react";

export type OrderTimelineStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected";

interface OrderStatusTimelineProps {
  status: OrderTimelineStatus;
  createdAt?: string;
  deliveryDate?: string;
}

const STAGES = [
  { id: "pending", label: "Order Placed", desc: "Awaiting Chef Confirmation", icon: Clock },
  { id: "accepted", label: "Chef Accepted", desc: "Order confirmed by kitchen", icon: CheckCircle2 },
  { id: "preparing", label: "In The Oven", desc: "Woodfired at 450°C", icon: ChefHat },
  { id: "out_for_delivery", label: "Out for Delivery", desc: "On the way to your door", icon: Bike },
  { id: "delivered", label: "Delivered Hot", desc: "Completed & enjoyed", icon: PackageCheck },
];

export default function OrderStatusTimeline({
  status,
  createdAt,
  deliveryDate,
}: OrderStatusTimelineProps) {
  const isCancelled = status === "cancelled" || status === "rejected";

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 space-y-2">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <h4 className="text-sm font-black text-red-900">
            {status === "cancelled" ? "Order Cancelled" : "Order Declined by Restaurant"}
          </h4>
        </div>
        <p className="text-xs text-red-700 leading-relaxed pl-7">
          {status === "cancelled"
            ? "You cancelled this order while it was still pending chef review. No charges were made."
            : "The pizzeria could not fulfill this request at the requested delivery slot. Please browse our menu for other kitchens."}
        </p>
      </div>
    );
  }

  // Determine stage progression index (0 to 4)
  const getStageIndex = (s: OrderTimelineStatus): number => {
    switch (s) {
      case "pending":
        return 0;
      case "accepted":
        return 1;
      case "preparing":
        return 2;
      case "out_for_delivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(status);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
          Live Order Status Timeline
        </span>
        <span className="text-xs font-black text-[#D91E18]">
          Stage {currentIndex + 1} of 5
        </span>
      </div>

      {/* Progress Steps */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.id} className="relative flex items-start gap-3.5 group">
              {/* Timeline Indicator Dot / Icon */}
              <div
                className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isPassed
                    ? "bg-emerald-500 text-white shadow-xs"
                    : isCurrent
                    ? "bg-[#D91E18] text-white ring-4 ring-red-100 shadow-sm animate-pulse"
                    : "bg-white border-2 border-stone-300 text-stone-300"
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Stage Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs font-black tracking-tight ${
                      isCurrent
                        ? "text-[#D91E18]"
                        : isPassed
                        ? "text-stone-900"
                        : "text-stone-400"
                    }`}
                  >
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#D91E18] bg-red-100/70 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isCurrent
                      ? "text-stone-700 font-medium"
                      : isPassed
                      ? "text-stone-500"
                      : "text-stone-400"
                  }`}
                >
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

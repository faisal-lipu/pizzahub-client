"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle, ThumbsUp, MessageSquare, Send, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export interface ReviewItem {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedOrder: boolean;
  helpfulCount: number;
  restaurantRating?: number;
}

interface ReviewsSectionProps {
  itemId: string;
  itemName: string;
  vendorName: string;
  initialRating?: number;
}

const DEFAULT_REVIEWS: Record<string, ReviewItem[]> = {
  default: [
    {
      id: "rev-1",
      author: "Sophia Sterling",
      rating: 5,
      date: "2 days ago",
      comment:
        "Absolute perfection! The crust had that authentic woodfired blistered leopard spots and the cheese pull was phenomenal. Delivered piping hot in 20 minutes.",
      verifiedOrder: true,
      helpfulCount: 14,
      restaurantRating: 5,
    },
    {
      id: "rev-2",
      author: "Marcus Vance",
      rating: 5,
      date: "1 week ago",
      comment:
        "One of the best artisanal pizzas in the city. The San Marzano sauce is noticeably fresh with zero acidity. Definitely ordering from this kitchen again!",
      verifiedOrder: true,
      helpfulCount: 9,
      restaurantRating: 5,
    },
    {
      id: "rev-3",
      author: "Elena Rostova",
      rating: 4,
      date: "2 weeks ago",
      comment:
        "Generous toppings and fragrant sweet basil. Crust was super airy. Slightly cooler than expected upon arrival but 2 minutes in the toaster oven made it 10/10.",
      verifiedOrder: true,
      helpfulCount: 5,
      restaurantRating: 4,
    },
  ],
};

export default function ReviewsSection({
  itemId,
  itemName,
  vendorName,
  initialRating = 4.9,
}: ReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState(user?.name || "");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  // Load reviews from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`pizzahub_reviews_${itemId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
          return;
        }
      }
    } catch {
      // fallback
    }
    // Set default reviews
    setReviews(DEFAULT_REVIEWS.default);
  }, [itemId]);

  useEffect(() => {
    if (user?.name && !authorName) {
      setAuthorName(user.name);
    }
  }, [user, authorName]);

  // Calculate live statistics
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
      : initialRating;

  // Star breakdown
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Please write a few words about your experience.");
      return;
    }

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: authorName.trim() || user?.name || "Verified Customer",
      rating: userRating,
      date: "Just now",
      comment: comment.trim(),
      verifiedOrder: true,
      helpfulCount: 0,
      restaurantRating: userRating,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);

    try {
      localStorage.setItem(`pizzahub_reviews_${itemId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save review to localStorage:", err);
    }

    toast.success("Review published! Thank you for rating this artisan pizza.");
    setComment("");
    setUserRating(5);
  };

  const handleHelpfulClick = (reviewId: string) => {
    if (helpfulVotes[reviewId]) {
      return; // already voted
    }

    setHelpfulVotes((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    );
    toast.success("Thank you for your feedback!");
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Community Feedback & Kitchen Reputation</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Reviews & Ratings for {itemName}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Prepared with passion by{" "}
            <span className="font-bold text-stone-800">{vendorName}</span>. Read verified food lovers&apos; reviews.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70 shrink-0">
          <div className="text-center">
            <p className="text-3xl font-black text-stone-900 leading-none">
              {averageRating.toFixed(1)}
            </p>
            <div className="flex items-center gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-stone-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-1">
              {totalReviews} verified reviews
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Rating Breakdown + Review Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Star Breakdown Bars */}
        <div className="lg:col-span-5 bg-stone-50/80 rounded-2xl p-6 border border-stone-200/70 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-500 mb-2">
            Rating Breakdown
          </h3>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-stone-700 flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-stone-400 text-[11px]">
                  {count}
                </span>
              </div>
            );
          })}

          <div className="mt-4 pt-4 border-t border-stone-200/60 text-xs text-stone-500 space-y-1">
            <p className="font-bold text-stone-800">
              Kitchen Rating: {vendorName}
            </p>
            <p className="text-[11px] text-stone-500">
              ★ 4.9 Restaurant Score • Top 5% Food Safety & Customer Satisfaction
            </p>
          </div>
        </div>

        {/* Right: Write a Review Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-stone-900">
              Share Your Review & Rating
            </h3>
            <span className="text-[11px] font-bold text-stone-400">
              {user ? `Posting as ${user.name || "Customer"}` : "Guest / Customer"}
            </span>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Interactive Star Picker */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Your Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || userRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(star)}
                      className="p-1 -m-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active
                            ? "text-amber-400 fill-amber-400"
                            : "text-stone-300 stroke-stone-300"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {userRating} / 5 Stars ({userRating === 5 ? "Exceptional" : userRating === 4 ? "Very Good" : userRating === 3 ? "Good" : "Could Improve"})
                </span>
              </div>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Jessica Taylor"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#D91E18]"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Review & Taste Experience *
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the dough texture, cheese, toppings, and delivery temperature? Tell other foodies..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs font-medium text-stone-800 focus:outline-none focus:border-[#D91E18]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          </form>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4 pt-4 border-t border-stone-100">
        <h3 className="text-lg font-black text-stone-900">
          Customer Reviews ({reviews.length})
        </h3>

        <div className="divide-y divide-stone-100">
          {reviews.map((rev) => (
            <div key={rev.id} className="py-5 first:pt-0 last:pb-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 text-[#D91E18] flex items-center justify-center font-black text-xs">
                    {rev.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-900">
                        {rev.author}
                      </span>
                      {rev.verifiedOrder && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified Order
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-stone-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-400">• {rev.date}</span>
                    </div>
                  </div>
                </div>

                {/* Helpful button */}
                <button
                  type="button"
                  onClick={() => handleHelpfulClick(rev.id)}
                  disabled={Boolean(helpfulVotes[rev.id])}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    helpfulVotes[rev.id]
                      ? "bg-stone-100 text-stone-400 border-stone-200"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                  title="Mark as helpful"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{rev.helpfulCount > 0 ? `Helpful (${rev.helpfulCount})` : "Helpful"}</span>
                </button>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed pl-12">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

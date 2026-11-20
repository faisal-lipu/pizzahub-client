"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Play,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  Flame,
  Heart,
  X,
  Pizza,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  rating?: number;
  preparationTime?: number;
}

// Fallback featured pizzas when database has fresh empty state
const DEFAULT_FEATURED_PIZZAS: MenuItem[] = [
  {
    _id: "demo-1",
    name: "Classic Pepperoni Supreme",
    description: "Crispy beef pepperoni, rich San Marzano tomato sauce, and double mozzarella cheese.",
    price: 14.99,
    category: "Pepperoni",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    preparationTime: 15,
  },
  {
    _id: "demo-2",
    name: "Tuscan Margherita D.O.C.",
    description: "Authentic buffalo mozzarella, sweet cherry tomatoes, extra virgin olive oil, and fresh basil.",
    price: 12.50,
    category: "Veggie",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    preparationTime: 12,
  },
  {
    _id: "demo-3",
    name: "Smokey BBQ Chicken Feast",
    description: "Tender roasted chicken strips, hickory BBQ glaze, caramelized red onions, and smoked gouda.",
    price: 16.20,
    category: "Chicken",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    preparationTime: 18,
  },
  {
    _id: "demo-4",
    name: "Quattro Formaggi Deluxe",
    description: "A velvety four-cheese blend of gorgonzola, aged parmesan, fontina, and melted mozzarella.",
    price: 15.00,
    category: "Cheese",
    image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    preparationTime: 14,
  },
  {
    _id: "demo-5",
    name: "Truffle Mushroom Special",
    description: "Wild portobello and button mushrooms with aromatic white truffle oil and fresh thyme.",
    price: 17.50,
    category: "Special",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    rating: 5.0,
    preparationTime: 15,
  },
  {
    _id: "demo-6",
    name: "Spicy Diavola & Jalapeno",
    description: "Calabrian hot salami, roasted red chili peppers, spicy tomato reduction, and fresh herbs.",
    price: 15.80,
    category: "Pepperoni",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    preparationTime: 15,
  },
];

// Interactive Category definitions matching UI mockup
const CATEGORIES = [
  { id: "all", label: "All Pizza", icon: "🍕" },
  { id: "pepperoni", label: "Pepperoni", icon: "🍕" },
  { id: "veggie", label: "Veggie", icon: "🌿" },
  { id: "chicken", label: "Chicken", icon: "🍗" },
  { id: "cheese", label: "Cheese", icon: "🧀" },
  { id: "special", label: "Special", icon: "⭐" },
];

/**
 * Public Home Page Component
 * Renders Hero section, Pizza Categories, and Featured Menu Items
 */
export default function HomePage() {
  const router = useRouter();
  const [featuredPizzas, setFeaturedPizzas] = useState<MenuItem[]>(DEFAULT_FEATURED_PIZZAS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Fetch live menu items from backend API
  useEffect(() => {
    async function loadLiveMenu() {
      try {
        const response = await apiRequest<{ success: boolean; items: Record<string, unknown>[] }>("/api/menu?limit=6");
        if (response.success && response.items && response.items.length > 0) {
          const mappedItems: MenuItem[] = response.items.map((raw: Partial<MenuItem> & { itemName?: string; images?: string[] }) => ({
            _id: String(raw._id),
            name: String(raw.name || raw.itemName || "Artisan Pizza"),
            description: String(raw.description || ""),
            price: Number(raw.price || 14.99),
            category: String(raw.category || "Special"),
            image: String(raw.image || (Array.isArray(raw.images) && raw.images[0]) || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"),
            rating: Number(raw.rating || 4.9),
            preparationTime: Number(raw.preparationTime || 15),
          }));
          setFeaturedPizzas(mappedItems);
        }
      } catch (err) {
        console.warn("[Home Page] Using fallback featured pizzas:", err);
      }
    }
    loadLiveMenu();
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId === "all") {
      router.push("/menu");
    } else {
      router.push(`/menu?category=${encodeURIComponent(categoryId)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 overflow-x-hidden">
      {/* ========================================================
          1. BANNER SECTION (Hero Banner per Assignment Requirements)
          - Clear headline: "Hot & Fresh Pizza Delivered to Your Door"
          - Short description
          - CTA button: "Explore Pizza Menu"
          - Pizza-themed background image or illustration
          - Sleek, compact, professional layout
         ======================================================== */}
      <section className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
        {/* Pizza-Themed Ambient Background Illustration & Glow */}
        <div className="absolute top-2 right-12 w-72 h-72 bg-gradient-to-br from-amber-400/20 via-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-gradient-to-tr from-red-500/10 via-amber-300/10 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />
        
        {/* Background decorative pizza doodle SVG watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] -z-10 bg-[radial-gradient(#D91E18_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            {/* PizzaHub Fresh Kicker */}
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full shadow-2xs">
              <span className="font-serif italic text-xs font-bold text-amber-700 tracking-wide">
                Artisan Woodfired Pizza
              </span>
              <span className="text-amber-500 text-xs">✨</span>
            </div>

            {/* Clear Headline (Compact & Professional) */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black tracking-tight text-stone-900 leading-[1.18]">
              Hot &amp; Fresh Pizza{" "}
              <span className="block text-[#D91E18]">Delivered to Your Door.</span>
            </h1>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-md leading-relaxed">
              Craving authentic stone-oven pizza? Enjoy hand-tossed artisanal pizzas baked with
              fresh San Marzano sauce, 100% real mozzarella, and gourmet toppings delivered hot to your doorstep.
            </p>

            {/* Action Buttons with Required CTA: "Explore Pizza Menu" */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md shadow-red-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Pizza className="w-4 h-4 stroke-[2]" />
                <span>Explore Pizza Menu</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>

              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full border border-stone-200 shadow-2xs transition-all cursor-pointer"
              >
                <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-[#D91E18]">
                  <Play className="w-2.5 h-2.5 fill-[#D91E18] ml-0.5" />
                </span>
                <span>Watch Video</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-3 grid grid-cols-3 gap-3 border-t border-stone-200/60 max-w-xs">
              <div>
                <p className="text-lg font-black text-stone-900 leading-tight">15m</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase">Fast Delivery</p>
              </div>
              <div>
                <p className="text-lg font-black text-stone-900 leading-tight">100%</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase">Fresh Sourced</p>
              </div>
              <div>
                <p className="text-lg font-black text-[#D91E18] leading-tight">4.9 ★</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase">Customer Love</p>
              </div>
            </div>
          </div>

          {/* Right Visual Column (Compact & Refined Pizza Composition) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Background Warm Sunburst Shape */}
            <div className="absolute w-60 sm:w-72 h-60 sm:h-72 rounded-full bg-gradient-to-tr from-amber-400/30 via-amber-200/30 to-red-100/20 blur-xl -z-10" />

            {/* Floating Top Badge: 100% Real Cheese */}
            <div className="absolute -top-2.5 -left-2 z-10 bg-white/95 backdrop-blur-md rounded-xl px-3 py-1 shadow-md border border-stone-200/80 flex items-center gap-1.5">
              <span className="text-base">🧀</span>
              <div>
                <p className="text-[10px] font-black text-stone-900 leading-tight">100% Mozzarella</p>
                <p className="text-[9px] font-medium text-stone-400">Melted perfection</p>
              </div>
            </div>

            {/* Hero Pizza Composition (Compact Frame) */}
            <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-xl border-2 border-white transform hover:scale-[1.01] transition-transform duration-300">
              <Image
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=85"
                alt="Hot & Fresh Artisan Pizza with melted cheese and fresh toppings"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Bottom Tag: Fresh Oven Baked */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-md flex items-center justify-between border border-white">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[#D91E18]">
                    <Flame className="w-3.5 h-3.5 fill-[#D91E18]" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black text-stone-900 leading-tight">Woodfire Baked</p>
                    <p className="text-[9px] font-medium text-stone-500">450°C Italian Stone Oven</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#D91E18] bg-red-50 px-2 py-0.5 rounded-full">
                  Hot &amp; Crispy
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. PIZZA CATEGORIES SECTION (Matching Mockup)
         ======================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8 flex items-center justify-center gap-4">
          <span className="h-px bg-stone-300 flex-1 max-w-[80px] hidden sm:block" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Pizza Categories
          </h2>
          <span className="h-px bg-stone-300 flex-1 max-w-[80px] hidden sm:block" />
        </div>

        {/* Categories Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#D91E18] shadow-md shadow-red-500/10 scale-105"
                    : "border-stone-200/80 shadow-xs hover:border-amber-400 hover:shadow-sm"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mb-3 shadow-inner">
                  {cat.icon}
                </div>
                <span className="text-sm font-bold text-stone-800">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          3. FEATURED PIZZAS SECTION
         ======================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Featured Pizzas
            </h2>
            <p className="text-sm text-stone-500 font-medium mt-1">
              Discover our most loved pizzas crafted by artisan chefs.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 border border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all"
          >
            View All Menu
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Pizzas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPizzas.map((pizza) => {
            const isFav = Boolean(favorites[pizza._id]);

            return (
              <div
                key={pizza._id}
                className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative w-full h-52 overflow-hidden bg-stone-100">
                  <Image
                    src={pizza.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"}
                    alt={pizza.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {pizza.category}
                  </span>

                  {/* Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(pizza._id, e)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-[#D91E18] shadow-sm transition-colors cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? "fill-[#D91E18] text-[#D91E18]" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-[#D91E18] transition-colors truncate">
                        {pizza.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pizza.rating || 4.8}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                      {pizza.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-xs text-stone-400 block font-medium">Price</span>
                      <span className="text-lg font-black text-stone-900">
                        ${Number(pizza.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Order / View Details Link (Private page: prompts login if not logged in) */}
                    <Link
                      href={`/menu/${pizza._id}`}
                      className="bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shadow-sm"
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          4. WHY CHOOSE PIZZAHUB? (Value Proposition)
         ======================================================== */}
      <section className="py-16 bg-white border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Why PizzaHub Stands Out
            </h2>
            <p className="text-sm text-stone-500 font-medium mt-2">
              We connect passionate local pizza chefs directly with hungry foodies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#D91E18] flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">15-Minute Fast Dispatch</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Our kitchen partners bake hot and fast, dispatching in record time directly to your door.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Admin Verified Pizzerias</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Every vendor menu item undergoes quality review by platform administrators before publication.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">Artisan Woodfire Taste</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Slow-fermented 48-hour sourdough dough baked on fiery stone slabs for that authentic blistered crust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. VIDEO MODAL DIALOG
         ======================================================== */}
      {videoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <div
            className="bg-black rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full aspect-video relative border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src="https://www.youtube-nocookie.com/embed/1-SJGQ2HLp8?autoplay=1"
              title="Authentic Pizza Making Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
  MapPin,
  Store,
  ChefHat,
  Truck,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";
import PizzaImage from "@/components/PizzaImage";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getFavoriteIds, toggleFavoriteItem } from "@/lib/favorites";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  rating?: number;
  preparationTime?: number;
  location?: string;
  vendorName?: string;
  vendorImage?: string | null;
  isPremiumVendor?: boolean;
}

// Fallback featured pizzas when database has fresh empty state
const DEFAULT_FEATURED_PIZZAS: MenuItem[] = [
  {
    _id: "demo-1",
    name: "Classic Pepperoni Supreme",
    description: "Crispy beef pepperoni, rich San Marzano tomato sauce, and double mozzarella cheese.",
    price: 14.99,
    category: "Meat Lovers",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    preparationTime: 15,
    location: "Little Italy, New York",
    vendorName: "Artisan Napoli Pizza Co.",
    isPremiumVendor: true,
  },
  {
    _id: "demo-2",
    name: "Tuscan Margherita D.O.C.",
    description: "Authentic buffalo mozzarella, sweet cherry tomatoes, extra virgin olive oil, and fresh basil.",
    price: 12.50,
    category: "Classic Pizzas",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    preparationTime: 12,
    location: "SoHo, Manhattan",
    vendorName: "Bella Italia Ristorante",
    isPremiumVendor: true,
  },
  {
    _id: "demo-3",
    name: "Smokey BBQ Chicken Feast",
    description: "Tender roasted chicken strips, hickory BBQ glaze, caramelized red onions, and smoked gouda.",
    price: 16.20,
    category: "Meat Lovers",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    preparationTime: 18,
    location: "Williamsburg, Brooklyn",
    vendorName: "Brooklyn Slice House",
    isPremiumVendor: false,
  },
  {
    _id: "demo-4",
    name: "Quattro Formaggi Deluxe",
    description: "A velvety four-cheese blend of gorgonzola, aged parmesan, fontina, and melted mozzarella.",
    price: 15.00,
    category: "Vegetarian Pizzas",
    image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    preparationTime: 14,
    location: "Greenwich Village, NY",
    vendorName: "Roma Woodfire Pizzeria",
    isPremiumVendor: true,
  },
  {
    _id: "demo-5",
    name: "Truffle Mushroom Special",
    description: "Wild portobello and button mushrooms with aromatic white truffle oil and fresh thyme.",
    price: 17.50,
    category: "Specialty / Gourmet Pizzas",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    rating: 5.0,
    preparationTime: 15,
    location: "Upper East Side, NY",
    vendorName: "Milano Gourmet Pizza",
    isPremiumVendor: true,
  },
  {
    _id: "demo-6",
    name: "Spicy Diavola & Jalapeno",
    description: "Calabrian hot salami, roasted red chili peppers, spicy tomato reduction, and fresh herbs.",
    price: 15.80,
    category: "Classic Pizzas",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    preparationTime: 15,
    location: "DUMBO, Brooklyn",
    vendorName: "Venezia Pizzeria",
    isPremiumVendor: false,
  },
];

export interface PizzaCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  badge: string;
}

// Dynamic Section 2: 6 Pizza Categories per Assignment Requirements
export const PIZZA_CATEGORIES: PizzaCategory[] = [
  {
    id: "classic-pizzas",
    name: "Classic Pizzas",
    icon: "🍕",
    description: "Authentic stone-baked crusts, San Marzano marinara & fresh mozzarella.",
    badge: "Authentic",
  },
  {
    id: "vegetarian-pizzas",
    name: "Vegetarian Pizzas",
    icon: "🌿",
    description: "Garden-fresh vegetables, sweet cherry tomatoes, fresh basil & artisan cheeses.",
    badge: "Fresh & Green",
  },
  {
    id: "meat-lovers",
    name: "Meat Lovers",
    icon: "🥩",
    description: "Loaded with crispy beef pepperoni, smoky BBQ chicken & spicy Calabrian salami.",
    badge: "High Protein",
  },
  {
    id: "specialty-gourmet-pizzas",
    name: "Specialty / Gourmet Pizzas",
    icon: "⭐",
    description: "Chef's gourmet recipes featuring white truffle oil, roasted garlic & portobello.",
    badge: "Chef's Special",
  },
  {
    id: "sides-appetizers",
    name: "Sides & Appetizers",
    icon: "🍟",
    description: "Oven-baked crispy garlic knots, savory dips, mozzarella sticks & seasoned wings.",
    badge: "Crispy Bites",
  },
  {
    id: "beverages-desserts",
    name: "Beverages & Desserts",
    icon: "🥤",
    description: "Authentic Italian tiramisu, artisan desserts & sparkling Italian blood orange soda.",
    badge: "Sweet Treats",
  },
];

// Required Extra Section: Why Choose PizzaHub? (Key Benefits)
const BENEFITS = [
  {
    icon: Flame,
    title: "Artisan Woodfire Taste",
    description: "48-hour cold-fermented sourdough baked at 450°C on fiery stone slabs for that authentic blistered crust.",
    tag: "Authentic Neapolitan",
    bgClass: "bg-red-50",
    colorClass: "text-[#D91E18]",
  },
  {
    icon: ShieldCheck,
    title: "Admin Verified Kitchens",
    description: "Every vendor pizzeria and recipe undergoes rigorous quality inspection for hygiene and food standards.",
    tag: "100% Quality Vetted",
    bgClass: "bg-amber-50",
    colorClass: "text-amber-700",
  },
  {
    icon: Clock,
    title: "15-Minute Fast Dispatch",
    description: "Orders travel straight from the stone oven into insulated heat-lock carriers without unnecessary wait time.",
    tag: "Lightning Fast Speed",
    bgClass: "bg-emerald-50",
    colorClass: "text-emerald-700",
  },
  {
    icon: ChefHat,
    title: "Fresh Farm Ingredients",
    description: "100% whole milk mozzarella, authentic San Marzano D.O.P. tomatoes, and aromatic cold-pressed olive oil.",
    tag: "Zero Artificial Flavors",
    bgClass: "bg-blue-50",
    colorClass: "text-blue-700",
  },
];

// Extra Section: How PizzaHub Works (Simple 3-Step Process)
const HOW_IT_WORKS_STEPS = [
  {
    icon: ShoppingBag,
    title: "1. Pick Your Pizza",
    description: "Explore handcrafted artisan pizzas, gourmet sides, and chilled desserts from top local pizzerias.",
    tip: "Browse by category or search toppings",
  },
  {
    icon: Flame,
    title: "2. Baked in 450°C Stone Ovens",
    description: "Certified chefs hand-toss your dough and bake it to fiery perfection the moment you order.",
    tip: "Freshly prepared every single time",
  },
  {
    icon: Truck,
    title: "3. Fast & Steaming Delivery",
    description: "Dedicated couriers deliver your pizza in heat-preserving thermal bags right to your doorstep.",
    tip: "Contactless & hot on arrival",
  },
];

// Extra Section: Customer Testimonials (Social Proof)
const TESTIMONIALS = [
  {
    name: "Sophia Chen",
    role: "Verified Foodie • Brooklyn, NY",
    quote: "The crust is out of this world — crispy, airy, and with that distinct woodfire flavor you only get in Naples. PizzaHub is now our weekly family tradition!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Marcus Sterling",
    role: "Food Blogger • Manhattan, NY",
    quote: "PizzaHub connects me with local artisan pizzerias I never knew existed. The Truffle Mushroom Special is hands down the best gourmet pizza in NYC.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  },
  {
    name: "Elena Rostova",
    role: "Pizza Enthusiast • Queens, NY",
    quote: "Fastest delivery ever! Arrived in under 20 minutes steaming hot, cheese still bubbling. Ordering was effortless, and the quality is unbeatable.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  },
];

/**
 * Public Home Page Component
 * Renders Hero section, Pizza Categories, and Featured Menu Items
 */
export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [featuredPizzas, setFeaturedPizzas] = useState<MenuItem[]>(DEFAULT_FEATURED_PIZZAS);
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const handleViewDetails = (pizzaId: string) => {
    if (!user) {
      toast.info("Please sign in to view item details and order.");
      router.push(`/sign-in?redirect=${encodeURIComponent(`/menu/${pizzaId}`)}`);
    } else {
      router.push(`/menu/${pizzaId}`);
    }
  };

  // Fetch live menu items from backend API
  useEffect(() => {
    async function loadLiveMenu() {
      try {
        const response = await apiRequest<{ success: boolean; items: Record<string, unknown>[] }>("/api/menu?limit=6");
        if (response.success && response.items && response.items.length > 0) {
          const mappedItems: MenuItem[] = response.items.map((raw: Record<string, any>) => ({
            _id: String(raw._id),
            name: String(raw.name || raw.itemName || "Artisan Pizza"),
            description: String(raw.description || ""),
            price: Number(raw.price || 14.99),
            category: String(raw.category || "Special"),
            image: String(
              (Array.isArray(raw.images) && raw.images[0]) ||
              raw.image ||
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
            ),
            rating: Number(raw.rating || 4.8),
            preparationTime: Number(raw.preparationTime || 15),
            location: String(raw.location || "Downtown Kitchen, New York"),
            vendorName: String(raw.vendor?.businessName || raw.vendor?.name || raw.vendorName || "Artisan Pizzeria"),
            vendorImage: raw.vendor?.image || null,
            isPremiumVendor: raw.vendor?.subscriptionPlan === "premium",
          }));
          setFeaturedPizzas(mappedItems);
        }
      } catch (err) {
        console.warn("[Home Page] Using fallback featured pizzas:", err);
      }
    }
    loadLiveMenu();
  }, []);

  useEffect(() => {
    setFavorites(getFavoriteIds());
    const onSync = () => setFavorites(getFavoriteIds());
    window.addEventListener("pizzahub_favorites_updated", onSync);
    return () => window.removeEventListener("pizzahub_favorites_updated", onSync);
  }, []);

  const toggleFavorite = (pizza: MenuItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavoriteItem({
      _id: pizza._id,
      name: pizza.name,
      price: pizza.price,
      category: pizza.category,
      image: pizza.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
      rating: pizza.rating,
      vendorName: pizza.vendorName,
      location: pizza.location,
    });
    setFavorites(getFavoriteIds());
    if (added) {
      toast.success(`Added ${pizza.name} to your Wishlist!`);
    } else {
      toast.info(`Removed ${pizza.name} from Wishlist`);
    }
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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 overflow-x-clip">
      {/* ========================================================
          1. BANNER SECTION (Hero Banner per Assignment Requirements)
          - Clear headline: "Hot & Fresh Pizza Delivered to Your Door"
          - Short description
          - CTA button: "Explore Pizza Menu"
          - Pizza-themed background image or illustration
          - Sleek, compact, professional layout
         ======================================================== */}
      <section className="relative py-10 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Pizza-Themed Ambient Background Illustration & Glow */}
        <div className="absolute top-2 right-12 w-80 h-80 bg-gradient-to-br from-amber-400/20 via-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-gradient-to-tr from-red-500/10 via-amber-300/10 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />
        
        {/* Background decorative pizza doodle SVG watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] -z-10 bg-[radial-gradient(#D91E18_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-stretch">
          {/* Left Text Column with Motion */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col justify-between w-full text-left"
          >
            <div>
              {/* PizzaHub Fresh Kicker */}
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-800/80 px-4 py-1.5 rounded-full shadow-2xs">
                <span className="font-serif italic text-sm font-bold text-amber-800 dark:text-amber-400 tracking-wide">
                  Artisan Woodfired Pizza
                </span>
                <span className="text-amber-500 text-sm">✨</span>
              </div>

              {/* Clear Headline (Large, Bold & Commanding) */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[44px] xl:text-[50px] font-black tracking-tight text-stone-900 dark:text-stone-100 leading-[1.12] mt-3.5 sm:mt-4">
                Hot &amp; Fresh Pizza{" "}
                <span className="block text-[#D91E18]">Delivered to Your Door.</span>
              </h1>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-medium max-w-xl leading-relaxed mt-3 sm:mt-4">
                Craving authentic stone-oven pizza? Enjoy hand-tossed artisanal pizzas baked with
                fresh San Marzano sauce, 100% real mozzarella, and gourmet toppings delivered hot to your doorstep.
              </p>
            </div>

            {/* Action Buttons: SIDE BY SIDE (পাশাপাশি) per Screenshot 1 */}
            <div className="flex flex-nowrap items-center gap-3 sm:gap-4 pt-4 mt-auto">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full shadow-lg shadow-red-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Pizza className="w-5 h-5 stroke-[2]" />
                <span>Explore Pizza Menu</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4 rounded-full border border-stone-200 dark:border-stone-800 shadow-xs transition-all cursor-pointer hover:border-stone-300 whitespace-nowrap shrink-0"
              >
                <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#D91E18]">
                  <Play className="w-3 h-3 fill-[#D91E18] ml-0.5" />
                </span>
                <span>Watch Video</span>
              </button>
            </div>
          </motion.div>

          {/* Right Visual Column - Height aligns with Artisan Woodfired Pizza at top and buttons at bottom */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-6 relative w-full h-full min-h-[350px] lg:min-h-0 flex items-stretch justify-center lg:justify-end"
          >
            {/* Background Warm Sunburst Shape */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/30 via-amber-200/30 to-red-100/20 blur-2xl -z-10" />

            {/* Floating Top Badge: 100% Real Cheese */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl px-4 py-2 sm:px-4.5 sm:py-2.5 shadow-xl border border-stone-200/90 dark:border-stone-800 flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl">🧀</span>
              <div>
                <p className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 leading-tight">100% Mozzarella</p>
                <p className="text-[10px] sm:text-xs font-medium text-stone-500">Melted perfection</p>
              </div>
            </div>

            {/* Hero Pizza Composition - Matches height of left column content */}
            <div className="relative w-full h-full min-h-[340px] sm:min-h-[370px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 transform hover:scale-[1.01] transition-transform duration-300">
              <Image
                src="/banner.jpg"
                alt="Hot & Fresh Artisan Woodfired Pizza with melted cheese and fresh toppings"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 650px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Bottom Tag: Fresh Oven Baked */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl flex items-center justify-between border border-white dark:border-stone-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#D91E18]">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-[#D91E18]" />
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 leading-tight">Woodfire Baked</p>
                    <p className="text-[10px] sm:text-xs font-medium text-stone-500">450°C Italian Stone Oven</p>
                  </div>
                </div>
                <span className="text-xs font-black text-[#D91E18] bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/60">
                  Hot &amp; Crispy
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Centered 3 Metrics Badges (Moved to Center per 2nd Screenshot) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
        >
          {/* Badge 1: Fast Delivery */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 sm:p-6 text-center shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <p className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 leading-tight">15m</p>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1.5">Fast Delivery</p>
          </div>

          {/* Badge 2: Fresh Sourced */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 sm:p-6 text-center shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
            <p className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 leading-tight">100%</p>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1.5">Fresh Sourced</p>
          </div>

          {/* Badge 3: Customer Love */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 sm:p-6 text-center shadow-xs hover:border-red-300 dark:hover:border-red-800 transition-colors">
            <p className="text-3xl sm:text-4xl font-black text-[#D91E18] leading-tight">4.9 ★</p>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1.5">Customer Love</p>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          2. FEATURED MENU ITEMS SECTION (Dynamic Section 1)
          - Shows at least 6 approved items from database
          - Displays: item image, name, category, price, location, vendor info, View Details button
         ======================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D91E18] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chef&apos;s Handcrafted Picks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Featured Menu Items
            </h2>
            <p className="text-sm text-stone-500 font-medium mt-1">
              Discover our top chef-crafted pizzas, freshly baked and delivered to your doorstep.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 border border-[#D91E18] text-[#D91E18] hover:bg-[#D91E18] hover:text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all shrink-0 cursor-pointer"
          >
            <span>View All Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Featured Menu Items Grid with Motion Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPizzas.map((pizza) => {
            const isFav = Boolean(favorites[pizza._id]);

            return (
              <motion.div
                key={pizza._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* 1. Item Image Container */}
                <div className="relative w-full h-52 overflow-hidden bg-stone-100">
                  <PizzaImage
                    src={pizza.image}
                    alt={pizza.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* 3. Category Pill Tag */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-stone-800 text-xs font-bold px-3 py-1 rounded-full shadow-xs border border-stone-200/60">
                    {pizza.category}
                  </span>

                  {/* Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(pizza, e)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-[#D91E18] shadow-xs transition-colors cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? "fill-[#D91E18] text-[#D91E18]" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* 2. Item Name & Rating */}
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <h3
                        className="text-base font-bold text-stone-900 group-hover:text-[#D91E18] transition-colors truncate"
                        title={pizza.name}
                      >
                        {pizza.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pizza.rating ? pizza.rating.toFixed(1) : "4.8"}</span>
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                      {pizza.description}
                    </p>

                    {/* Meta info: Vendor Info & Location */}
                    <div className="space-y-1.5 py-2.5 border-t border-stone-100">
                      {/* 6. Vendor Info */}
                      <div className="flex items-center gap-2 text-xs text-stone-700 font-semibold truncate">
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                          <Store className="w-3 h-3" />
                        </div>
                        <span className="truncate" title={pizza.vendorName || "Artisan Kitchen"}>
                          {pizza.vendorName || "Artisan Kitchen"}
                        </span>
                        {pizza.isPremiumVendor && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 border border-amber-300">
                            PRO
                          </span>
                        )}
                      </div>

                      {/* 5. Location (restaurant area / city) */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-medium truncate">
                        <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-[#D91E18] shrink-0">
                          <MapPin className="w-3 h-3" />
                        </div>
                        <span className="truncate" title={pizza.location || "Downtown, New York"}>
                          {pizza.location || "Downtown, New York"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action: 4. Price & 7. View Details Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                        Price
                      </span>
                      <span className="text-lg font-black text-stone-900">
                        ${Number(pizza.price).toFixed(2)}
                      </span>
                    </div>

                    {/* 7. View Details Button (redirects to Sign In if logged out) */}
                    <button
                      type="button"
                      onClick={() => handleViewDetails(pizza._id)}
                      className="inline-flex items-center gap-1.5 bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm shadow-red-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          3. PIZZA CATEGORIES SECTION (Dynamic Section 2: Pizza Categories)
          - Requirement: Users can explore items by category:
            1. Classic Pizzas
            2. Vegetarian Pizzas
            3. Meat Lovers
            4. Specialty / Gourmet Pizzas
            5. Sides & Appetizers
            6. Beverages & Desserts
         ======================================================== */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D91E18] uppercase tracking-wider mb-1">
              <Pizza className="w-3.5 h-3.5" />
              <span>Explore By Taste</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Pizza Categories
            </h2>
            <p className="text-sm text-stone-500 font-medium mt-1">
              Explore freshly crafted pizzas, gourmet sides, and artisan desserts by category.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D91E18] hover:text-[#B91C1C] transition-colors"
          >
            <span>Browse All Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* 6 Category Interactive Cards Grid with Motion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PIZZA_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Link
                href={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="group relative bg-white rounded-3xl border border-stone-200/90 hover:border-amber-400 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer h-full"
              >
                {/* Subtle Ambient Hover Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none -z-0" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3.5">
                    {/* Category Food Icon Box */}
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-100/80 border border-amber-200/60 flex items-center justify-center text-3xl shadow-inner transition-colors">
                      {cat.icon}
                    </div>

                    {/* Badge */}
                    <span className="bg-stone-100 group-hover:bg-red-50 text-stone-600 group-hover:text-[#D91E18] text-[11px] font-bold px-2.5 py-1 rounded-full border border-stone-200/60 group-hover:border-red-200 transition-colors">
                      {cat.badge}
                    </span>
                  </div>

                  {/* Category Title */}
                  <h3 className="text-lg font-black text-stone-900 group-hover:text-[#D91E18] transition-colors tracking-tight">
                    {cat.name}
                  </h3>

                  {/* Category Description */}
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mt-1.5 mb-4">
                    {cat.description}
                  </p>
                </div>

                {/* Action Link Footer */}
                <div className="relative z-10 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 group-hover:text-[#D91E18] transition-colors">
                  <span className="inline-flex items-center gap-1">
                    Explore {cat.name.split(" ")[0]}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-[#D91E18] group-hover:text-white flex items-center justify-center transition-all transform group-hover:translate-x-0.5 shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================
          4. EXTRA SECTION 1 (REQUIRED): WHY CHOOSE PIZZAHUB? (Benefits)
         ======================================================== */}
      <section className="py-16 md:py-24 bg-white border-y border-stone-200/60 relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-100/40 via-red-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-[#D91E18] text-xs font-bold px-3.5 py-1 rounded-full mb-3 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>The PizzaHub Advantage</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Why Choose PizzaHub?
            </h2>
            <p className="text-sm text-stone-600 font-medium mt-2.5 leading-relaxed">
              We connect authentic artisan pizza kitchens directly with pizza lovers. Handcrafted ingredients, certified pizzerias, and fiery oven heat in every single bite.
            </p>
          </motion.div>

          {/* 4 Benefits Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b, idx) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 hover:border-amber-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl ${b.bgClass} ${b.colorClass} flex items-center justify-center mb-5 shadow-inner transition-transform group-hover:scale-110 duration-300`}>
                    <b.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mb-2 group-hover:text-[#D91E18] transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    {b.description}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-center gap-1.5 text-[11px] font-bold text-stone-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{b.tag}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Metrics Highlight Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">100%</p>
              <p className="text-xs text-stone-300 font-semibold mt-1">Real Whole Mozzarella</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">450°C</p>
              <p className="text-xs text-stone-300 font-semibold mt-1">Stone Oven Baking</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">15 min</p>
              <p className="text-xs text-stone-300 font-semibold mt-1">Average Dispatch Speed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400">4.9 ★</p>
              <p className="text-xs text-stone-300 font-semibold mt-1">From 50,000+ Foodies</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          5. EXTRA SECTION 2: HOW PIZZAHUB WORKS (Step-by-Step Flow)
         ======================================================== */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            How PizzaHub Works
          </h2>
          <p className="text-sm text-stone-500 font-medium mt-2">
            Getting fiery hot, authentic woodfire pizza to your table is easier than ever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-7 border border-stone-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 relative flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#D91E18] flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="text-2xl font-black text-stone-200 group-hover:text-red-200 transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-[#D91E18] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-bold text-[#D91E18]">
                <span>{step.tip}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================
          6. EXTRA SECTION 3: CUSTOMER TESTIMONIALS (Social Proof)
         ======================================================== */}
      <section className="py-16 md:py-20 bg-[#FAF8F5] border-t border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3.5 py-1 rounded-full mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Real Reviews</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Loved by Foodies Everywhere
            </h2>
            <p className="text-sm text-stone-500 font-medium mt-2">
              See what our community of pizza lovers say about their PizzaHub dining experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-stone-200 shrink-0">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-tight">{t.name}</p>
                    <p className="text-[10px] font-medium text-stone-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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

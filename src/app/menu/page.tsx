"use client";

import React, { useState, useEffect, Suspense } from "react";
import PizzaImage from "@/components/PizzaImage";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Filter, ArrowUpDown, Star, Heart, Loader2 } from "lucide-react";
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

const CATEGORIES = ["All", "Pepperoni", "Veggie", "Chicken", "Cheese", "Special"];

// Fallback pizzas for demo state
const FALLBACK_MENU: MenuItem[] = [
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

/**
 * Menu View Component inside Suspense Boundary
 */
function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search.trim()) queryParams.set("search", search.trim());
        if (selectedCategory && selectedCategory !== "All") queryParams.set("category", selectedCategory);
        if (sortOrder !== "none") queryParams.set("sort", sortOrder);

        const response = await apiRequest<{ success: boolean; items: Record<string, unknown>[] }>(
          `/api/menu?${queryParams.toString()}`
        );

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
          setItems(mappedItems);
        } else if (search.trim() || (selectedCategory && selectedCategory !== "All")) {
          // Empty result for specific search/filter query
          setItems([]);
        } else {
          // If no items in database, display fallback menu
          const filtered = [...FALLBACK_MENU];
          if (sortOrder === "asc") {
            filtered.sort((a, b) => a.price - b.price);
          } else if (sortOrder === "desc") {
            filtered.sort((a, b) => b.price - a.price);
          }
          setItems(filtered);
        }
      } catch (err) {
        console.warn("[Menu Page] Using fallback menu data:", err);
        setItems(FALLBACK_MENU);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchMenu();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, sortOrder]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#D91E18] bg-red-50 px-3.5 py-1 rounded-full border border-red-100">
          Woodfire Handcrafted
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Browse Our Artisan Menu
        </h1>
        <p className="mt-2 text-sm text-stone-500 font-medium">
          Freshly prepared pizzas made with premium Italian flour, farm-fresh toppings, and 100% whole milk mozzarella.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pizzas by name, ingredient, flavor..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 focus:outline-none focus:border-[#D91E18] focus:bg-white transition-all"
            />
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Sort By Price Dropdown (Challenge #1 from Backend) */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-48">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "none")}
                className="w-full pl-9 pr-8 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 appearance-none focus:outline-none focus:border-[#D91E18] cursor-pointer"
              >
                <option value="none">Sort by: Default</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1 mr-1" />
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#D91E18] text-white shadow-sm shadow-red-500/20"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200/80"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D91E18] mx-auto mb-3" />
          <p className="text-sm font-bold text-stone-600">Loading oven-fresh pizzas...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
          <p className="text-4xl mb-3">🍕</p>
          <h3 className="text-lg font-bold text-stone-800">No Pizzas Found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            We could not find any pizza matching &ldquo;{search}&rdquo;. Try another keyword or reset the category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSortOrder("none");
            }}
            className="mt-5 px-5 py-2.5 rounded-full bg-[#D91E18] text-white text-xs font-bold shadow-sm hover:bg-[#B91C1C]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((pizza) => {
            const isFav = Boolean(favorites[pizza._id]);

            return (
              <div
                key={pizza._id}
                className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative w-full h-52 overflow-hidden bg-stone-100">
                  <PizzaImage
                    src={pizza.image}
                    alt={pizza.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-stone-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {pizza.category}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(pizza._id, e)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-[#D91E18] shadow-sm transition-colors cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFav ? "fill-[#D91E18] text-[#D91E18]" : ""}`}
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

                    {/* Links to Protected Item Details Page */}
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
      )}
    </div>
  );
}

/**
 * Browse Menu Page Component with Suspense
 */
export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <Loader2 className="w-8 h-8 animate-spin text-[#D91E18]" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}

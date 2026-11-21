"use client";

import React, { useState, useEffect, Suspense } from "react";
import PizzaImage from "@/components/PizzaImage";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, ArrowUpDown, Star, Heart, Loader2, MapPin, Store, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/api";
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
  isPremiumVendor?: boolean;
}

// 6 Official Categories per Assignment 9 Requirements + "All"
const CATEGORIES = [
  "All",
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
];

// Locations for filtering per Assignment 9 requirements
const LOCATIONS = [
  "All Locations",
  "Little Italy, New York",
  "SoHo, Manhattan",
  "Williamsburg, Brooklyn",
  "Greenwich Village, NY",
  "Upper East Side, NY",
  "DUMBO, Brooklyn",
];

// Fallback pizzas for demo state covering all categories
const FALLBACK_MENU: MenuItem[] = [
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
  },
  {
    _id: "demo-7",
    name: "Crispy Garlic Knots & Marinara",
    description: "Golden oven-baked garlic herb knots served with warm San Marzano marinara dipping sauce.",
    price: 7.99,
    category: "Sides & Appetizers",
    image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    preparationTime: 10,
    location: "Little Italy, New York",
    vendorName: "Artisan Napoli Pizza Co.",
  },
  {
    _id: "demo-8",
    name: "Authentic Italian Tiramisu & Soda",
    description: "Classic mascarpone coffee dessert with ladyfingers, paired with chilled Italian blood orange soda.",
    price: 8.50,
    category: "Beverages & Desserts",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    preparationTime: 8,
    location: "Little Italy, New York",
    vendorName: "Artisan Napoli Pizza Co.",
  },
];

/**
 * Menu View Component inside Suspense Boundary
 */
function MenuContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const paramCategory = searchParams.get("category");
  const initialCategory = paramCategory || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "All";

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Synchronize category if searchParams change dynamically
  useEffect(() => {
    if (paramCategory) {
      setSelectedCategory(paramCategory);
    }
  }, [paramCategory]);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search.trim()) queryParams.set("search", search.trim());
        if (selectedCategory && selectedCategory !== "All") queryParams.set("category", selectedCategory);
        if (selectedLocation && selectedLocation !== "All") queryParams.set("location", selectedLocation);
        if (sortOrder !== "none") {
          queryParams.set("sortBy", "price");
          queryParams.set("order", sortOrder);
        }

        const response = await apiRequest<{ success: boolean; items: Record<string, unknown>[] }>(
          `/api/menu?${queryParams.toString()}`
        );

        if (response.success && response.items && response.items.length > 0) {
          const mappedItems: MenuItem[] = response.items.map((raw: Record<string, any>) => ({
            _id: String(raw._id),
            name: String(raw.name || raw.itemName || "Artisan Pizza"),
            description: String(raw.description || ""),
            price: Number(raw.price || 14.99),
            category: String(raw.category || "Classic Pizzas"),
            image: String(
              (Array.isArray(raw.images) && raw.images[0]) ||
              raw.image ||
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
            ),
            rating: Number(raw.rating || 4.8),
            preparationTime: Number(raw.preparationTime || 15),
            location: String(raw.location || "Downtown Kitchen, New York"),
            vendorName: String(raw.vendor?.businessName || raw.vendor?.name || raw.vendorName || "Artisan Pizzeria"),
            isPremiumVendor: raw.vendor?.subscriptionPlan === "premium",
          }));
          setItems(mappedItems);
        } else if (search.trim() || (selectedCategory && selectedCategory !== "All") || (selectedLocation && selectedLocation !== "All")) {
          // Empty result for specific search/filter query
          setItems([]);
        } else {
          // If no items in database, display fallback menu
          let filtered = [...FALLBACK_MENU];
          if (sortOrder === "asc") {
            filtered.sort((a, b) => a.price - b.price);
          } else if (sortOrder === "desc") {
            filtered.sort((a, b) => b.price - a.price);
          }
          setItems(filtered);
        }
      } catch (err) {
        console.warn("[Menu Page] Using fallback menu data:", err);
        let filtered = [...FALLBACK_MENU];
        if (selectedCategory && selectedCategory !== "All") {
          filtered = filtered.filter(i => i.category.toLowerCase() === selectedCategory.toLowerCase());
        }
        if (selectedLocation && selectedLocation !== "All") {
          filtered = filtered.filter(i => (i.location || "").toLowerCase().includes(selectedLocation.toLowerCase()));
        }
        if (search.trim()) {
          filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));
        }
        setItems(filtered);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchMenu();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLocation, sortOrder]);

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

  const handleViewDetails = (pizzaId: string) => {
    if (!user) {
      toast.info("Please sign in to view item details and order.");
      router.push(`/sign-in?redirect=${encodeURIComponent(`/menu/${pizzaId}`)}`);
    } else {
      router.push(`/menu/${pizzaId}`);
    }
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
        <div className="flex flex-col md:flex-row gap-3">
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

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Filter by Location Dropdown */}
            <div className="relative w-full sm:w-56">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-9 pr-8 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 appearance-none focus:outline-none focus:border-[#D91E18] cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>

            {/* Sort By Price Dropdown (Challenge #1 from Backend) */}
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
            We could not find any pizza matching your filters. Try another search or reset the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSelectedLocation("All");
              setSortOrder("none");
            }}
            className="mt-5 px-5 py-2.5 rounded-full bg-[#D91E18] text-white text-xs font-bold shadow-sm hover:bg-[#B91C1C] cursor-pointer"
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
                className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
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

                  <span className="absolute top-3 left-3 bg-white/90 dark:bg-gradient-to-r dark:from-[#152331] dark:to-[#000000] backdrop-blur-md text-stone-800 dark:text-amber-300 dark:!text-amber-300 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-stone-200/60 dark:border-amber-400/30">
                    {pizza.category}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(pizza, e)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-stone-900/90 dark:border dark:border-stone-800 backdrop-blur-md flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-[#D91E18] dark:hover:text-[#D91E18] shadow-sm transition-colors cursor-pointer"
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

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                      {pizza.description}
                    </p>

                    {/* Meta info: Vendor Info & Location */}
                    {(pizza.vendorName || pizza.location) && (
                      <div className="space-y-1.5 py-2.5 border-t border-stone-100">
                        {pizza.vendorName && (
                          <div className="flex items-center gap-2 text-xs text-stone-700 font-semibold truncate">
                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                              <Store className="w-3 h-3" />
                            </div>
                            <span className="truncate">{pizza.vendorName}</span>
                            {pizza.isPremiumVendor && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 border border-amber-300">
                                PRO
                              </span>
                            )}
                          </div>
                        )}

                        {pizza.location && (
                          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium truncate">
                            <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-[#D91E18] shrink-0">
                              <MapPin className="w-3 h-3" />
                            </div>
                            <span className="truncate">{pizza.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Price</span>
                      <span className="text-lg font-black text-stone-900">
                        ${Number(pizza.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Links to Protected Item Details Page (redirects to Sign In if logged out) */}
                    <button
                      type="button"
                      onClick={() => handleViewDetails(pizza._id)}
                      className="inline-flex items-center gap-1.5 bg-[#D91E18] hover:bg-[#B91C1C] text-white font-bold text-xs px-4 py-2 rounded-full transition-all transform hover:-translate-y-0.5 shadow-sm shadow-red-500/20 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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

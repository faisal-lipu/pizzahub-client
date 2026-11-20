"use client";

export interface FavoritePizzaItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  rating?: number;
  vendorName?: string;
  location?: string;
}

const STORAGE_KEY_IDS = "pizzahub_favorites";
const STORAGE_KEY_ITEMS = "pizzahub_favorite_items";

export function getFavoriteIds(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_IDS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getFavoriteItems(): FavoritePizzaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteItem(item: FavoritePizzaItem): boolean {
  if (typeof window === "undefined") return false;

  const currentIds = getFavoriteIds();
  const currentItems = getFavoriteItems();
  const isAlreadyFav = Boolean(currentIds[item._id]);

  let updatedIds: Record<string, boolean>;
  let updatedItems: FavoritePizzaItem[];

  if (isAlreadyFav) {
    // Remove
    updatedIds = { ...currentIds };
    delete updatedIds[item._id];
    updatedItems = currentItems.filter((i) => i._id !== item._id);
  } else {
    // Add
    updatedIds = { ...currentIds, [item._id]: true };
    updatedItems = [item, ...currentItems.filter((i) => i._id !== item._id)];
  }

  try {
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(updatedIds));
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("pizzahub_favorites_updated"));
  } catch (e) {
    console.warn("Error updating favorites in localStorage:", e);
  }

  return !isAlreadyFav;
}

export function removeFavoriteItem(id: string): void {
  if (typeof window === "undefined") return;

  const currentIds = getFavoriteIds();
  const currentItems = getFavoriteItems();

  const updatedIds = { ...currentIds };
  delete updatedIds[id];
  const updatedItems = currentItems.filter((i) => i._id !== id);

  try {
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(updatedIds));
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updatedItems));
    window.dispatchEvent(new Event("pizzahub_favorites_updated"));
  } catch (e) {
    console.warn("Error removing favorite from localStorage:", e);
  }
}

import { useEffect, useState } from "react";
import { itemsApi } from "../api/items.api";
import { Item } from "../types/item.types";

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi.getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}

export function useItem(id: string) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi.getById(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading };
}

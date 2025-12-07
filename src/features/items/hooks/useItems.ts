import { useEffect, useState } from "react";
import { itemsApi } from "../api/items.api";
import { ItemResponse } from "../types/items.types";

export function useItems() {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi.getAll()
      .then((data) => setItems(data.content))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}

export function useItem(id: string) {
  const [item, setItem] = useState<ItemResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi.getById(id)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading };
}

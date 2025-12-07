'use client';

import { useEffect, useState } from "react";
import { itemsApi } from "@/features/items/api/items.api";
import type { ItemResponse } from "@/features/items/types/types";

export default function ItemsPage() {
    const [items, setItems] = useState<ItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      itemsApi
        .getAllItemsOnly()
        .then(setItems)
        .finally(() => setLoading(false));
    }, []);
  
    if (loading) return <p>Loading…</p>;
  
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="border rounded-xl p-4">
            <h2 className="font-semibold">{item.name}</h2>
            {item.price != null && <p>${item.price}</p>}
          </article>
        ))}
      </div>
    );
}   
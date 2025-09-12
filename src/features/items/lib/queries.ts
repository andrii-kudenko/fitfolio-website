import { api } from "@/lib/fetch";
import { z } from "zod";
import { CreateItemRequest, ItemResponse } from "@/features/items/lib/schema";

export async function listItems() {
    const data = await api<ItemResponse[]>("/api/items");
    return z.array(ItemResponse).parse(data);
}

export async function createItem(item: CreateItemRequest) {
    const body = CreateItemRequest.parse(item);
    const data = await api<ItemResponse>("/api/items", {
        method: "POST",
        body: JSON.stringify(body),
    });
    return ItemResponse.parse(data);
}
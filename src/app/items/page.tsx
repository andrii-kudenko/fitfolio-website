// import { getItems } from ""

import { api } from "@/lib/fetch";

export default async function ItemsPage() {
    // return <div className="text-red-300">Hello</div>
    const items = await api<any[]>("/items");
    // return <div>Hello</div>
    return <pre>{JSON.stringify(items, null, 2)}</pre>;
}   
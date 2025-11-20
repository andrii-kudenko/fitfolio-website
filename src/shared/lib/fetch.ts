// export async function api<T>(path: string, init?: RequestInit): Promise<T> {
//     console.log(`FETCHING: ${process.env.NEXT_PUBLIC_API_URL}${path}`)
//     const base = process.env.NEXT_PUBLIC_API_URL!;
//     const res = await fetch(`${base}${path}`, { cache: "no-store", ...init });
//     if (!res.ok) throw new Error(`API ${res.status}`);
//     return res.json() as Promise<T>;
//   }
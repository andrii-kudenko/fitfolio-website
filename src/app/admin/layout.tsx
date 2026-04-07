"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function navLink(href: string, label: string) {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`block rounded-md px-4 py-3 text-base font-medium transition ${
          isActive
            ? "border border-cyan-700 bg-[#031014] text-cyan-300"
            : "border border-gray-700 text-white hover:border-cyan-900 hover:bg-[#031014]"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-ff-black">
      <div className="max-w-6xl mx-auto px-10 py-10">
        <h1 className="text-4xl font-bold text-white mb-10">Admin</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-md border border-gray-700 bg-[#040707] p-6">
              <div className="space-y-4">
                {navLink("/admin", "Dashboard")}
                {navLink("/admin/users", "Users")}
                {navLink("/admin/items", "Items")}
                {navLink("/admin/comments", "Comments")}
                {navLink("/admin/reviews", "Reviews")}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-3">
            <div className="rounded-md border border-gray-700 bg-[#040707] p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
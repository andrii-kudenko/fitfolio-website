import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-10 py-10">
        <h1 className="text-4xl font-bold text-white mb-10">Admin</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-md border border-gray-700 bg-[#040707] p-6">
              <div className="space-y-4">
                <Link
                  href="/admin"
                  className="block text-white text-base font-medium hover:underline"
                >
                  Dashboard
                </Link>

                {/* Add more links later */}
                {/* <Link href="/admin/users" className="block text-white hover:underline">Users</Link> */}
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

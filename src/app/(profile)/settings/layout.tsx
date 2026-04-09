import Link from "next/link";

const nav = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/privacy", label: "Privacy" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/delete-account", label: "Delete Account" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-md border border-gray-700 bg-[#040707] p-3">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-sm px-4 py-2 text-sm text-white hover:bg-black transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            <div className="w-full bg-[#040707] border border-gray-700 rounded-md p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

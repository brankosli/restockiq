import Link from "next/link";
import { db } from "@/db";
import { pendingAlerts, stores } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

async function getPendingCount(): Promise<number> {
  const [store] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
  if (!store) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(pendingAlerts)
    .where(and(eq(pendingAlerts.storeId, store.id), eq(pendingAlerts.status, "pending")));

  return result?.count ?? 0;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pendingCount = await getPendingCount();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-slate-700">
          <span className="text-lg font-bold text-white tracking-tight">RestockIQ</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/dashboard">Inventory</NavLink>
          <NavLink href="/dashboard/vendors">Vendors</NavLink>
          <NavLink href="/dashboard/pending" badge={pendingCount}>
            Restock Orders
          </NavLink>
          <NavLink href="/dashboard/alerts">Alert Log</NavLink>
          <NavLink href="/dashboard/settings">Settings</NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  badge,
  children,
}: {
  href: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
    >
      <span>{children}</span>
      {badge != null && badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </Link>
  );
}

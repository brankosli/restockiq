import { db } from "@/db";
import { vendors, stores, productVariants } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import VendorsClient from "./VendorsClient";

export const dynamic = "force-dynamic";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>;
}) {
  const { shop } = await searchParams;

  // Pronađi store
  let store = null;
  if (shop) {
    const [s] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
    store = s ?? null;
  } else {
    const [s] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
    store = s ?? null;
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-full p-12 text-slate-400">
        No connected store found.
      </div>
    );
  }

  const vendorRows = await db
    .select({
      id: vendors.id,
      name: vendors.name,
      email: vendors.email,
      phone: vendors.phone,
      channel: vendors.channel,
      active: vendors.active,
      variantCount: sql<number>`count(${productVariants.id})`.mapWith(Number),
    })
    .from(vendors)
    .leftJoin(productVariants, eq(productVariants.vendorId, vendors.id))
    .where(eq(vendors.storeId, store.id))
    .groupBy(vendors.id)
    .orderBy(vendors.name);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Vendors</h1>
          <p className="text-sm text-slate-400 mt-0.5">{store.shopDomain}</p>
        </div>
      </div>
      <VendorsClient initialVendors={vendorRows} shop={store.shopDomain} />
    </div>
  );
}

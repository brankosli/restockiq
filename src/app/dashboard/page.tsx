import { db } from "@/db";
import { productVariants, vendors, stores } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import VariantsTable from "./VariantsTable";
import SyncButton from "./SyncButton";

export const dynamic = "force-dynamic";

async function getStore(shop?: string) {
  if (shop) {
    const [store] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
    return store ?? null;
  }
  const [store] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
  return store ?? null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>;
}) {
  const { shop } = await searchParams;
  const store = await getStore(shop);

  if (!store) {
    return (
      <div className="flex items-center justify-center h-full p-12 text-slate-400">
        No connected store found.{" "}
        <a href="/api/auth?shop=your-store.myshopify.com" className="ml-1 underline text-brand-600">
          Connect a store
        </a>
      </div>
    );
  }

  // Eksplicitno biramo samo polja koja trebaju Client Componentu
  // (izbjegavamo Date objekte koji mogu uzrokovati hydration mismatch)
  const variantRows = await db
    .select({
      id: productVariants.id,
      productTitle: productVariants.productTitle,
      variantTitle: productVariants.variantTitle,
      sku: productVariants.sku,
      currentStock: productVariants.currentStock,
      minimumStock: productVariants.minimumStock,
      vendorId: productVariants.vendorId,
      imageUrl: productVariants.imageUrl,
      vendorName: vendors.name,
    })
    .from(productVariants)
    .leftJoin(vendors, eq(productVariants.vendorId, vendors.id))
    .where(eq(productVariants.storeId, store.id))
    .orderBy(asc(productVariants.productTitle));

  const vendorList = await db
    .select({ id: vendors.id, name: vendors.name })
    .from(vendors)
    .where(eq(vendors.storeId, store.id));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-400 mt-0.5">{store.shopDomain}</p>
        </div>
        <SyncButton shop={store.shopDomain} />
      </div>

      <VariantsTable initialVariants={variantRows} vendors={vendorList} />
    </div>
  );
}

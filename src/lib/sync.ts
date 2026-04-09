import { db } from "@/db";
import { stores, productVariants } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { fetchAllProducts } from "@/lib/shopify";

export interface SyncResult {
  synced: number;
  storeId: number;
  shopDomain: string;
}

export async function syncStoreInventory(shopDomain: string): Promise<SyncResult> {
  // Dohvati store iz baze
  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.shopDomain, shopDomain))
    .limit(1);

  if (!store) {
    throw new Error(`Store not found: ${shopDomain}`);
  }

  if (!store.active) {
    throw new Error(`Store is inactive: ${shopDomain}`);
  }

  // Dohvati sve proizvode iz Shopify API-ja
  const products = await fetchAllProducts(store.shopDomain, store.accessToken);

  // Pripremi sve varijante za upsert
  const values = products.flatMap((product) => {
    // Pronađi glavnu sliku proizvoda
    const productImage = product.image?.src ?? null;

    return product.variants.map((variant) => {
      // Ako varijanta ima svoju sliku, koristi je; inače koristi sliku proizvoda
      const variantImageSrc =
        variant.image_id
          ? product.images.find((img) => img.id === variant.image_id)?.src ?? productImage
          : productImage;

      return {
        storeId: store.id,
        shopifyProductId: String(product.id),
        shopifyVariantId: String(variant.id),
        inventoryItemId: String(variant.inventory_item_id),
        productTitle: product.title,
        variantTitle: variant.title === "Default Title" ? null : variant.title,
        sku: variant.sku ?? null,
        currentStock: variant.inventory_quantity,
        imageUrl: variantImageSrc,
        updatedAt: new Date(),
      };
    });
  });

  if (values.length === 0) {
    return { synced: 0, storeId: store.id, shopDomain: store.shopDomain };
  }

  // Batch upsert — upsertujemo u grupama od 100 da izbjegnemo prevelike upite
  const BATCH_SIZE = 100;
  for (let i = 0; i < values.length; i += BATCH_SIZE) {
    const batch = values.slice(i, i + BATCH_SIZE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conflictSet: any = {
      productTitle: sql`excluded.product_title`,
      variantTitle: sql`excluded.variant_title`,
      sku: sql`excluded.sku`,
      currentStock: sql`excluded.current_stock`,
      imageUrl: sql`excluded.image_url`,
      updatedAt: sql`excluded.updated_at`,
    };
    await db
      .insert(productVariants)
      .values(batch)
      .onConflictDoUpdate({
        target: productVariants.shopifyVariantId,
        set: conflictSet,
      });
  }

  return { synced: values.length, storeId: store.id, shopDomain: store.shopDomain };
}

export async function syncAllStores(): Promise<SyncResult[]> {
  const activeStores = await db
    .select()
    .from(stores)
    .where(eq(stores.active, true));

  const results = await Promise.allSettled(
    activeStores.map((store) => syncStoreInventory(store.shopDomain))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<SyncResult> => r.status === "fulfilled")
    .map((r) => r.value);
}

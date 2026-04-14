import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariants, vendors, pendingAlerts, stores } from "@/db/schema";
import { eq, and, lte, gte, isNotNull } from "drizzle-orm";
import type { PendingItem } from "@/app/api/webhooks/inventory/route";

// Varijanta ne ulazi u novi order ako je bila u poslanom orderu unutar ovog perioda
const REORDER_COOLDOWN_DAYS = 7;

// POST /api/pending/sync
// Skenira sve varijante ispod minimuma sa assignovanim vendorom
// i kreira/ažurira restock ordere
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { shop } = body as { shop?: string };

  let store = null;
  if (shop) {
    const [s] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
    store = s;
  } else {
    const [s] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
    store = s;
  }

  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  // Dohvati sve varijante ispod minimuma sa assignovanim vendorom
  const lowStockVariants = await db
    .select({
      id: productVariants.id,
      storeId: productVariants.storeId,
      productTitle: productVariants.productTitle,
      variantTitle: productVariants.variantTitle,
      sku: productVariants.sku,
      imageUrl: productVariants.imageUrl,
      currentStock: productVariants.currentStock,
      minimumStock: productVariants.minimumStock,
      vendorId: productVariants.vendorId,
      vendorActive: vendors.active,
    })
    .from(productVariants)
    .innerJoin(vendors, eq(productVariants.vendorId, vendors.id))
    .where(
      and(
        eq(productVariants.storeId, store.id),
        isNotNull(productVariants.vendorId),
        eq(vendors.active, true),
        lte(productVariants.currentStock, productVariants.minimumStock)
      )
    );

  if (lowStockVariants.length === 0) {
    return NextResponse.json({ ok: true, created: 0, updated: 0 });
  }

  // Grupiši po vendoru
  const byVendor = new Map<number, typeof lowStockVariants>();
  for (const v of lowStockVariants) {
    if (!v.vendorId) continue;
    if (!byVendor.has(v.vendorId)) byVendor.set(v.vendorId, []);
    byVendor.get(v.vendorId)!.push(v);
  }

  // Dohvati sve nedavno poslane ordere (unutar cooldown perioda)
  const cooldownCutoff = new Date(Date.now() - REORDER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  const recentlySent = await db
    .select({ items: pendingAlerts.items, vendorId: pendingAlerts.vendorId })
    .from(pendingAlerts)
    .where(
      and(
        eq(pendingAlerts.storeId, store.id),
        eq(pendingAlerts.status, "sent"),
        gte(pendingAlerts.sentAt, cooldownCutoff)
      )
    );

  // Skup variantId-ova koji su nedavno naručeni (po vendoru)
  const recentlyOrderedByVendor = new Map<number, Set<number>>();
  for (const order of recentlySent) {
    const items: PendingItem[] = JSON.parse(order.items);
    if (!order.vendorId) continue;
    if (!recentlyOrderedByVendor.has(order.vendorId)) {
      recentlyOrderedByVendor.set(order.vendorId, new Set());
    }
    for (const item of items) {
      recentlyOrderedByVendor.get(order.vendorId)!.add(item.variantId);
    }
  }

  let created = 0;
  let updated = 0;

  for (const [vendorId, variants] of byVendor) {
    // Provjeri postoji li već pending order za ovog vendora
    const [existing] = await db
      .select()
      .from(pendingAlerts)
      .where(
        and(
          eq(pendingAlerts.storeId, store.id),
          eq(pendingAlerts.vendorId, vendorId),
          eq(pendingAlerts.status, "pending")
        )
      )
      .limit(1);

    // Filtriraj varijante koje su nedavno naručene
    const recentlyOrdered = recentlyOrderedByVendor.get(vendorId) ?? new Set();
    const filteredVariants = variants.filter((v) => !recentlyOrdered.has(v.id));

    if (filteredVariants.length === 0) continue;

    const newItems: PendingItem[] = filteredVariants.map((v) => ({
      variantId: v.id,
      productTitle: v.productTitle,
      variantTitle: v.variantTitle,
      sku: v.sku,
      imageUrl: v.imageUrl,
      currentStock: v.currentStock ?? 0,
      minimumStock: v.minimumStock ?? 10,
      suggestedQty: Math.max((v.minimumStock ?? 10) * 2 - (v.currentStock ?? 0), 1),
    }));

    if (existing) {
      // Dodaj samo one varijante koje već nisu u listi
      const existingItems: PendingItem[] = JSON.parse(existing.items);
      const existingIds = new Set(existingItems.map((i) => i.variantId));
      const toAdd = newItems.filter((i) => !existingIds.has(i.variantId));

      if (toAdd.length > 0) {
        const merged = [...existingItems, ...toAdd];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.update(pendingAlerts).set({ items: JSON.stringify(merged) } as any)
          .where(eq(pendingAlerts.id, existing.id));
        updated++;
      }
    } else {
      // Napravi novi restock order
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.insert(pendingAlerts).values({
        storeId: store.id,
        vendorId,
        items: JSON.stringify(newItems),
        status: "pending",
      } as any);
      created++;
    }
  }

  return NextResponse.json({ ok: true, created, updated });
}

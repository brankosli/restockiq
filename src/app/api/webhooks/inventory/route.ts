import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { productVariants, vendors, pendingAlerts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function verifyShopifyHmac(rawBody: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_API_SECRET!;
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  const computedBuf = Buffer.from(computed);
  const headerBuf = Buffer.from(hmacHeader);
  if (computedBuf.length !== headerBuf.length) return false;
  return crypto.timingSafeEqual(computedBuf, headerBuf);
}

export interface PendingItem {
  variantId: number;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  imageUrl: string | null;
  currentStock: number;
  minimumStock: number;
  suggestedQty: number;
}

// POST /api/webhooks/inventory
export async function POST(req: NextRequest) {
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  if (!hmacHeader) {
    return NextResponse.json({ error: "Missing HMAC" }, { status: 401 });
  }

  const rawBody = await req.text();

  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    inventory_item_id: number;
    available: number;
  };

  const { inventory_item_id, available } = payload;

  // Update stock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db
    .update(productVariants)
    .set({ currentStock: available, updatedAt: new Date() } as any)
    .where(eq(productVariants.inventoryItemId, String(inventory_item_id)));

  // Dohvati varijantu sa vendor info
  const [variant] = await db
    .select({
      id: productVariants.id,
      storeId: productVariants.storeId,
      minimumStock: productVariants.minimumStock,
      productTitle: productVariants.productTitle,
      variantTitle: productVariants.variantTitle,
      sku: productVariants.sku,
      imageUrl: productVariants.imageUrl,
      vendorId: productVariants.vendorId,
      vendorActive: vendors.active,
    })
    .from(productVariants)
    .leftJoin(vendors, eq(productVariants.vendorId, vendors.id))
    .where(eq(productVariants.inventoryItemId, String(inventory_item_id)))
    .limit(1);

  // Nema varijante, vendora ili vendor nije aktivan ili stock je OK
  if (
    !variant ||
    !variant.vendorId ||
    !variant.vendorActive ||
    available > (variant.minimumStock ?? 10)
  ) {
    return NextResponse.json({ ok: true });
  }

  const newItem: PendingItem = {
    variantId: variant.id,
    productTitle: variant.productTitle,
    variantTitle: variant.variantTitle,
    sku: variant.sku,
    imageUrl: variant.imageUrl,
    currentStock: available,
    minimumStock: variant.minimumStock ?? 10,
    suggestedQty: Math.max((variant.minimumStock ?? 10) * 2 - available, 1),
  };

  // Provjeri postoji li već pending draft za ovog vendora
  const [existing] = await db
    .select()
    .from(pendingAlerts)
    .where(
      and(
        eq(pendingAlerts.storeId, variant.storeId!),
        eq(pendingAlerts.vendorId, variant.vendorId),
        eq(pendingAlerts.status, "pending")
      )
    )
    .limit(1);

  if (existing) {
    // Dodaj proizvod u postojeći draft (ako već nije tamo)
    const items: PendingItem[] = JSON.parse(existing.items);
    const alreadyExists = items.some((i) => i.variantId === variant.id);

    if (!alreadyExists) {
      items.push(newItem);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db
        .update(pendingAlerts)
        .set({ items: JSON.stringify(items) } as any)
        .where(eq(pendingAlerts.id, existing.id));
    }

    return NextResponse.json({ ok: true, draft: "updated", pendingId: existing.id });
  }

  // Napravi novi draft
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.insert(pendingAlerts).values({
    storeId: variant.storeId!,
    vendorId: variant.vendorId,
    items: JSON.stringify([newItem]),
    status: "pending",
  } as any);

  return NextResponse.json({ ok: true, draft: "created" });
}

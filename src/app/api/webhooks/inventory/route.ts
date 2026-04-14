import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { productVariants, vendors, alertLogs } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { getNotificationQueue } from "@/lib/queue";
import type { NotifyJobData } from "@/lib/queue";

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
    location_id: number;
    available: number;
  };

  const { inventory_item_id, available } = payload;

  // Update stock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db
    .update(productVariants)
    .set({ currentStock: available, updatedAt: new Date() } as any)
    .where(eq(productVariants.inventoryItemId, String(inventory_item_id)));

  // Dohvati varijantu sa vendor info da provjerimo da li treba alert
  const [variant] = await db
    .select({
      id: productVariants.id,
      storeId: productVariants.storeId,
      minimumStock: productVariants.minimumStock,
      productTitle: productVariants.productTitle,
      variantTitle: productVariants.variantTitle,
      sku: productVariants.sku,
      vendorId: productVariants.vendorId,
      vendorName: vendors.name,
      vendorEmail: vendors.email,
      vendorPhone: vendors.phone,
      vendorChannel: vendors.channel,
      vendorFormat: vendors.format,
      vendorActive: vendors.active,
      imageUrl: productVariants.imageUrl,
    })
    .from(productVariants)
    .leftJoin(vendors, eq(productVariants.vendorId, vendors.id))
    .where(eq(productVariants.inventoryItemId, String(inventory_item_id)))
    .limit(1);

  // Ako nema varijante, nema assignovanog vendora, vendor nije aktivan, ili stock nije ispod minimuma — kraj
  if (
    !variant ||
    !variant.vendorId ||
    !variant.vendorActive ||
    available > (variant.minimumStock ?? 10)
  ) {
    return NextResponse.json({ ok: true });
  }

  // Dedup: ne šaljemo isti alert više od jednom u 24h po varijanti
  const cooldownMs = 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - cooldownMs);

  const [recentAlert] = await db
    .select({ id: alertLogs.id })
    .from(alertLogs)
    .where(
      and(
        eq(alertLogs.storeId, variant.storeId!),
        eq(alertLogs.vendorId, variant.vendorId),
        gte(alertLogs.sentAt, cutoff)
      )
    )
    .limit(1);

  if (recentAlert) {
    return NextResponse.json({ ok: true, skipped: "cooldown" });
  }

  // Enqueue notifikaciju
  const jobData: NotifyJobData = {
    variantId: variant.id,
    vendorId: variant.vendorId,
    storeId: variant.storeId!,
    currentStock: available,
    minimumStock: variant.minimumStock ?? 10,
    productTitle: variant.productTitle,
    variantTitle: variant.variantTitle,
    sku: variant.sku,
    vendorEmail: variant.vendorEmail,
    vendorPhone: variant.vendorPhone,
    vendorName: variant.vendorName!,
    channel: variant.vendorChannel ?? "email",
    format: variant.vendorFormat ?? "plain_text",
    imageUrl: variant.imageUrl ?? null,
  };

  await getNotificationQueue().add("notify", jobData);

  return NextResponse.json({ ok: true, queued: true });
}

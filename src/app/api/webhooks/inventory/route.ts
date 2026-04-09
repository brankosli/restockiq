import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";

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
// Shopify šalje inventory_levels/update event
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db
    .update(productVariants)
    .set({ currentStock: available, updatedAt: new Date() } as any)
    .where(eq(productVariants.inventoryItemId, String(inventory_item_id)));

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/vendors?shop=...
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing ?shop=" }, { status: 400 });
  }

  const [store] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const list = await db.select().from(vendors).where(eq(vendors.storeId, store.id));
  return NextResponse.json(list);
}

// POST /api/vendors
// Body: { shop, name, email?, phone?, channel?, format? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { shop, name, email, phone, channel, format } = body;

  if (!shop || !name) {
    return NextResponse.json({ error: "shop and name are required" }, { status: 400 });
  }

  const [store] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vendor] = await db
    .insert(vendors)
    .values({
      storeId: store.id,
      name,
      email: email ?? null,
      phone: phone ?? null,
      channel: channel ?? "email",
      format: format ?? "plain_text",
    } as any)
    .returning();

  return NextResponse.json(vendor, { status: 201 });
}

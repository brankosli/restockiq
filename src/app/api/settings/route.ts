import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getStore(shop?: string) {
  if (shop) {
    const [s] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
    return s ?? null;
  }
  const [s] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
  return s ?? null;
}

// GET /api/settings?shop=xxx
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop") ?? undefined;
  const store = await getStore(shop);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const [settings] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.storeId, store.id))
    .limit(1);

  return NextResponse.json(settings ?? { storeId: store.id });
}

// PUT /api/settings
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { shop, ...fields } = body as {
    shop?: string;
    companyName?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    logoUrl?: string;
    currency?: string;
    orderNotes?: string;
  };

  const store = await getStore(shop);
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const values = { ...fields, storeId: store.id, updatedAt: new Date() };

  await db
    .insert(storeSettings)
    .values(values)
    .onConflictDoUpdate({
      target: storeSettings.storeId,
      set: { ...fields, updatedAt: new Date() },
    });

  const [updated] = await db
    .select()
    .from(storeSettings)
    .where(eq(storeSettings.storeId, store.id))
    .limit(1);

  return NextResponse.json(updated);
}

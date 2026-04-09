import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariants, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/variants?shop=store.myshopify.com
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Missing ?shop=store.myshopify.com" }, { status: 400 });
  }

  const [store] = await db
    .select()
    .from(stores)
    .where(eq(stores.shopDomain, shop))
    .limit(1);

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.storeId, store.id));

  return NextResponse.json({ total: variants.length, variants });
}

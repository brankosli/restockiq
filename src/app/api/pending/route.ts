import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pendingAlerts, vendors, stores } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/pending?shop=xxx — lista svih pending draftova
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop") ?? undefined;

  let storeId: number | undefined;
  if (shop) {
    const [s] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
    storeId = s?.id;
  } else {
    const [s] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
    storeId = s?.id;
  }

  if (!storeId) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const rows = await db
    .select({
      id: pendingAlerts.id,
      storeId: pendingAlerts.storeId,
      vendorId: pendingAlerts.vendorId,
      vendorName: vendors.name,
      vendorPhone: vendors.phone,
      vendorEmail: vendors.email,
      vendorChannel: vendors.channel,
      vendorFormat: vendors.format,
      items: pendingAlerts.items,
      notes: pendingAlerts.notes,
      status: pendingAlerts.status,
      createdAt: pendingAlerts.createdAt,
    })
    .from(pendingAlerts)
    .innerJoin(vendors, eq(pendingAlerts.vendorId, vendors.id))
    .where(
      and(
        eq(pendingAlerts.storeId, storeId),
        eq(pendingAlerts.status, "pending")
      )
    )
    .orderBy(pendingAlerts.createdAt);

  return NextResponse.json(rows);
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariants, vendors, stores } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { getNotificationQueue } from "@/lib/queue";
import type { NotifyJobData } from "@/lib/queue";

// POST /api/test/notify
// Body: { shop, variantId? }
// Pronađi prvi variant s assignovanim vendorom i enqueue notifikaciju
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { shop, variantId } = body as { shop?: string; variantId?: number };

  // Pronađi store
  let store = null;
  if (shop) {
    const [s] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
    store = s;
  } else {
    const [s] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
    store = s;
  }

  if (!store) return NextResponse.json({ error: "No store found" }, { status: 404 });

  // Pronađi variant s assignovanim vendorom
  const query = db
    .select({
      id: productVariants.id,
      storeId: productVariants.storeId,
      productTitle: productVariants.productTitle,
      variantTitle: productVariants.variantTitle,
      sku: productVariants.sku,
      currentStock: productVariants.currentStock,
      minimumStock: productVariants.minimumStock,
      vendorId: productVariants.vendorId,
      vendorName: vendors.name,
      vendorEmail: vendors.email,
      vendorPhone: vendors.phone,
      vendorChannel: vendors.channel,
      vendorFormat: vendors.format,
    })
    .from(productVariants)
    .innerJoin(vendors, eq(productVariants.vendorId, vendors.id))
    .where(
      and(
        eq(productVariants.storeId, store.id),
        isNotNull(productVariants.vendorId),
        ...(variantId ? [eq(productVariants.id, variantId)] : [])
      )
    )
    .limit(1);

  const [variant] = await query;

  if (!variant) {
    return NextResponse.json(
      { error: "No variant with assigned vendor found. Assign a vendor to a product first." },
      { status: 404 }
    );
  }

  const jobData: NotifyJobData = {
    variantId: variant.id,
    vendorId: variant.vendorId!,
    storeId: variant.storeId!,
    currentStock: variant.currentStock ?? 0,
    minimumStock: variant.minimumStock ?? 10,
    productTitle: variant.productTitle,
    variantTitle: variant.variantTitle,
    sku: variant.sku,
    vendorEmail: variant.vendorEmail,
    vendorPhone: variant.vendorPhone,
    vendorName: variant.vendorName,
    channel: variant.vendorChannel ?? "email",
    format: variant.vendorFormat ?? "plain_text",
  };

  const job = await getNotificationQueue().add("notify-test", jobData);

  return NextResponse.json({
    ok: true,
    jobId: job.id,
    sending: {
      to: variant.vendorName,
      channel: jobData.channel,
      via: jobData.channel === "email" ? jobData.vendorEmail : jobData.vendorPhone,
      product: `${variant.productTitle}${variant.variantTitle ? ` - ${variant.variantTitle}` : ""}`,
    },
  });
}

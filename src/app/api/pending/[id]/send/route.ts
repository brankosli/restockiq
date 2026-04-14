import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pendingAlerts, vendors, alertLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getNotificationQueue } from "@/lib/queue";
import type { NotifyJobData } from "@/lib/queue";
import type { PendingItem } from "@/app/api/webhooks/inventory/route";

// POST /api/pending/:id/send
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [pending] = await db
    .select({
      id: pendingAlerts.id,
      storeId: pendingAlerts.storeId,
      vendorId: pendingAlerts.vendorId,
      items: pendingAlerts.items,
      notes: pendingAlerts.notes,
      vendorName: vendors.name,
      vendorPhone: vendors.phone,
      vendorEmail: vendors.email,
      vendorChannel: vendors.channel,
      vendorFormat: vendors.format,
    })
    .from(pendingAlerts)
    .innerJoin(vendors, eq(pendingAlerts.vendorId, vendors.id))
    .where(eq(pendingAlerts.id, Number(id)))
    .limit(1);

  if (!pending) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items: PendingItem[] = JSON.parse(pending.items);

  if (items.length === 0) {
    return NextResponse.json({ error: "No items to send" }, { status: 400 });
  }

  const jobData: NotifyJobData = {
    variantId: items[0].variantId,
    vendorId: pending.vendorId!,
    storeId: pending.storeId!,
    currentStock: items[0].currentStock,
    minimumStock: items[0].minimumStock,
    productTitle: items[0].productTitle,
    variantTitle: items[0].variantTitle,
    sku: items[0].sku,
    imageUrl: items[0].imageUrl,
    vendorEmail: pending.vendorEmail,
    vendorPhone: pending.vendorPhone,
    vendorName: pending.vendorName,
    channel: pending.vendorChannel ?? "whatsapp",
    format: pending.vendorFormat ?? "plain_text",
    // Multi-product fields
    allItems: items,
    notes: pending.notes ?? null,
  };

  await getNotificationQueue().add("notify-pending", jobData);

  // Označi kao sent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.update(pendingAlerts).set({ status: "sent", sentAt: new Date() } as any)
    .where(eq(pendingAlerts.id, Number(id)));

  return NextResponse.json({ ok: true });
}

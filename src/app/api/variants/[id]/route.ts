import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariants, vendors, pendingAlerts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { PendingItem } from "@/app/api/webhooks/inventory/route";

// PATCH /api/variants/:id
// Body: { vendorId?, minimumStock? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variantId = parseInt(id, 10);
  if (isNaN(variantId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { vendorId, minimumStock } = body;

  if (vendorId === undefined && minimumStock === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    ...(vendorId !== undefined && { vendorId: vendorId === null ? null : Number(vendorId) }),
    ...(minimumStock !== undefined && { minimumStock: Number(minimumStock) }),
    updatedAt: new Date(),
  };

  const [updated] = await db
    .update(productVariants)
    .set(updateData)
    .where(eq(productVariants.id, variantId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  // Ako je vendor assignovan, provjeri da li je stock ispod minimuma
  // i dodaj u restock orders ako treba
  const newVendorId = updated.vendorId;
  const currentStock = updated.currentStock ?? 0;
  const minStock = updated.minimumStock ?? 10;

  if (newVendorId && currentStock <= minStock) {
    // Provjeri da li je vendor aktivan
    const [vendor] = await db
      .select({ active: vendors.active })
      .from(vendors)
      .where(eq(vendors.id, newVendorId))
      .limit(1);

    if (vendor?.active) {
      const newItem: PendingItem = {
        variantId: updated.id,
        productTitle: updated.productTitle,
        variantTitle: updated.variantTitle,
        sku: updated.sku,
        imageUrl: updated.imageUrl,
        currentStock,
        minimumStock: minStock,
        suggestedQty: Math.max(minStock * 2 - currentStock, 1),
      };

      // Provjeri postoji li već pending order za ovog vendora
      const [existing] = await db
        .select()
        .from(pendingAlerts)
        .where(
          and(
            eq(pendingAlerts.storeId, updated.storeId!),
            eq(pendingAlerts.vendorId, newVendorId),
            eq(pendingAlerts.status, "pending")
          )
        )
        .limit(1);

      if (existing) {
        const items: PendingItem[] = JSON.parse(existing.items);
        const alreadyExists = items.some((i) => i.variantId === updated.id);
        if (!alreadyExists) {
          items.push(newItem);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await db.update(pendingAlerts).set({ items: JSON.stringify(items) } as any)
            .where(eq(pendingAlerts.id, existing.id));
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.insert(pendingAlerts).values({
          storeId: updated.storeId!,
          vendorId: newVendorId,
          items: JSON.stringify([newItem]),
          status: "pending",
        } as any);
      }
    }
  }

  return NextResponse.json(updated);
}

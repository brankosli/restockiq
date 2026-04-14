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

  // Dohvati trenutno stanje varijante (trebamo stari vendorId)
  const [current] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);

  if (!current) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  const oldVendorId = current.vendorId;
  const newVendorId = vendorId !== undefined
    ? (vendorId === null ? null : Number(vendorId))
    : oldVendorId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [updated] = await db
    .update(productVariants)
    .set({
      ...(vendorId !== undefined && { vendorId: newVendorId }),
      ...(minimumStock !== undefined && { minimumStock: Number(minimumStock) }),
      updatedAt: new Date(),
    } as any)
    .where(eq(productVariants.id, variantId))
    .returning();

  // Ako se vendor promijenio, ukloni proizvod iz starog vendorovog pending ordera
  const vendorChanged = vendorId !== undefined && oldVendorId !== newVendorId;

  if (vendorChanged && oldVendorId) {
    const [oldPending] = await db
      .select()
      .from(pendingAlerts)
      .where(
        and(
          eq(pendingAlerts.storeId, current.storeId!),
          eq(pendingAlerts.vendorId, oldVendorId),
          eq(pendingAlerts.status, "pending")
        )
      )
      .limit(1);

    if (oldPending) {
      const items: PendingItem[] = JSON.parse(oldPending.items).filter(
        (i: PendingItem) => i.variantId !== variantId
      );

      if (items.length === 0) {
        // Order je prazan — obriši ga
        await db.delete(pendingAlerts).where(eq(pendingAlerts.id, oldPending.id));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.update(pendingAlerts).set({ items: JSON.stringify(items) } as any)
          .where(eq(pendingAlerts.id, oldPending.id));
      }
    }
  }

  // Ako je novi vendor assignovan i stock je ispod minimuma → dodaj u pending
  const currentStock = updated.currentStock ?? 0;
  const minStock = updated.minimumStock ?? 10;

  if (vendorChanged && newVendorId && currentStock <= minStock) {
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
        if (!items.some((i) => i.variantId === updated.id)) {
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

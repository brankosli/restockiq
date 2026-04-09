import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";

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
  return NextResponse.json(updated);
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/vendors/:id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendorId = parseInt(id, 10);
  if (isNaN(vendorId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const { name, email, phone, channel, format, active } = body;

  const [updated] = await db
    .update(vendors)
    .set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(channel !== undefined && { channel }),
      ...(format !== undefined && { format }),
      ...(active !== undefined && { active }),
    })
    .where(eq(vendors.id, vendorId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE /api/vendors/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendorId = parseInt(id, 10);
  if (isNaN(vendorId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await db.delete(vendors).where(eq(vendors.id, vendorId));
  return NextResponse.json({ ok: true });
}

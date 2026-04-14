import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pendingAlerts, alertLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getNotificationQueue } from "@/lib/queue";
import type { NotifyJobData } from "@/lib/queue";
import type { PendingItem } from "@/app/api/webhooks/inventory/route";

// PUT /api/pending/:id — update items, notes
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json() as { items?: PendingItem[]; notes?: string };

  const [existing] = await db
    .select()
    .from(pendingAlerts)
    .where(eq(pendingAlerts.id, Number(id)))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.update(pendingAlerts).set({
    ...(body.items !== undefined ? { items: JSON.stringify(body.items) } : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
  } as any).where(eq(pendingAlerts.id, Number(id)));

  return NextResponse.json({ ok: true });
}

// POST /api/pending/:id/send — pošalji i označi kao sent
// Ovo je handled u /api/pending/[id]/send/route.ts

// DELETE /api/pending/:id — odbaci draft
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.update(pendingAlerts).set({ status: "dismissed" } as any)
    .where(eq(pendingAlerts.id, Number(id)));

  return NextResponse.json({ ok: true });
}

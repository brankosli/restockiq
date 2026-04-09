import { NextRequest, NextResponse } from "next/server";
import { syncStoreInventory, syncAllStores } from "@/lib/sync";

// POST /api/sync
// Body: { shop: "store.myshopify.com" }  — sync jedne prodavnice
// Body: {}                                — sync svih aktivnih prodavnica
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { shop } = body as { shop?: string };

    if (shop) {
      const result = await syncStoreInventory(shop);
      return NextResponse.json({ success: true, result });
    }

    const results = await syncAllStores();
    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// GET /api/sync?shop=store.myshopify.com  — korisno za testiranje iz browsera
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");

  if (!shop) {
    return NextResponse.json(
      { error: "Missing ?shop=store.myshopify.com" },
      { status: 400 }
    );
  }

  try {
    const result = await syncStoreInventory(shop);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

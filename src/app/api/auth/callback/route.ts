import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { syncStoreInventory } from "@/lib/sync";
import { registerInventoryWebhook } from "@/lib/webhooks";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");

  if (!code || !shop) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Zamijeni code za access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  const { access_token } = await tokenRes.json();

  // Sačuvaj store u bazu
  await db
    .insert(stores)
    .values({
      shopDomain: shop,
      accessToken: access_token,
      name: shop.replace(".myshopify.com", ""),
    })
    .onConflictDoUpdate({
      target: stores.shopDomain,
      set: { accessToken: access_token },
    });

  // Registruj webhook i pokreni inicijalni sync u pozadini (ne blokiramo redirect)
  Promise.all([
    registerInventoryWebhook(shop, access_token),
    syncStoreInventory(shop),
  ]).catch((err) => console.error(`[setup] Post-install setup failed for ${shop}:`, err));

  // Redirect na dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
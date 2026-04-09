const SHOPIFY_API_VERSION = "2024-10";

export async function registerInventoryWebhook(
  shopDomain: string,
  accessToken: string
): Promise<void> {
  const callbackUrl = `https://${process.env.SHOPIFY_APP_HOST}/api/webhooks/inventory`;

  const res = await fetch(
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook: {
          topic: "inventory_levels/update",
          address: callbackUrl,
          format: "json",
        },
      }),
    }
  );

  // 422 znači da webhook već postoji — to je OK
  if (!res.ok && res.status !== 422) {
    const text = await res.text();
    throw new Error(`Failed to register webhook (${res.status}): ${text}`);
  }
}

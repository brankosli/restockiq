import twilio from "twilio";
import type { NotifyJobData } from "@/lib/queue";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
  return twilio(sid, token);
}


export async function sendWhatsAppNotification(data: NotifyJobData): Promise<string> {
  if (!data.vendorPhone) {
    throw new Error(`Vendor ${data.vendorName} has no phone number`);
  }

  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) throw new Error("Missing TWILIO_WHATSAPP_FROM");

  const to = data.vendorPhone.startsWith("whatsapp:")
    ? data.vendorPhone
    : `whatsapp:${data.vendorPhone}`;

  const client = getClient();

  const items = data.allItems && data.allItems.length > 0
    ? data.allItems
    : [{
        variantId: data.variantId,
        productTitle: data.productTitle,
        variantTitle: data.variantTitle,
        sku: data.sku,
        imageUrl: data.imageUrl,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
        suggestedQty: Math.max(data.minimumStock * 2 - data.currentStock, 1),
      }];

  // Jedna poruka po proizvodu: slika + caption
  for (const item of items) {
    const variant = item.variantTitle ? ` (${item.variantTitle})` : "";
    const sku = item.sku ? `\nSKU: ${item.sku}` : "";
    const caption = `${item.productTitle}${variant}${sku}\nQty: ${item.suggestedQty}`;

    await client.messages.create({
      from,
      to,
      body: caption,
      ...(item.imageUrl ? { mediaUrl: [item.imageUrl] } : {}),
    });
  }

  // Ako postoji napomena, šaljemo je kao zasebnu poruku
  if (data.notes?.trim()) {
    await client.messages.create({ from, to, body: `📝 ${data.notes.trim()}` });
  }

  return items.map((i) => i.productTitle).join(", ");
}

export async function sendSmsNotification(data: NotifyJobData): Promise<string> {
  if (!data.vendorPhone) {
    throw new Error(`Vendor ${data.vendorName} has no phone number`);
  }

  const from = process.env.TWILIO_SMS_FROM;
  if (!from) throw new Error("Missing TWILIO_SMS_FROM");

  // SMS — kraća poruka bez markdown
  const variantPart = data.variantTitle ? ` - ${data.variantTitle}` : "";
  const body = `RestockIQ: Low stock alert!\n${data.productTitle}${variantPart}\nCurrent: ${data.currentStock} | Min: ${data.minimumStock}\nPlease restock soon.`;

  await getClient().messages.create({ from, to: data.vendorPhone, body });
  return body;
}

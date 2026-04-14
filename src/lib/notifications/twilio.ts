import twilio from "twilio";
import type { NotifyJobData } from "@/lib/queue";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
  return twilio(sid, token);
}

function buildMessage(data: NotifyJobData): string {
  const variantPart = data.variantTitle ? ` - ${data.variantTitle}` : "";
  const skuPart = data.sku ? `\nSKU: ${data.sku}` : "";
  return [
    `⚠️ *Low Stock Alert* — RestockIQ`,
    ``,
    `Hi ${data.vendorName},`,
    ``,
    `*${data.productTitle}${variantPart}*${skuPart}`,
    `Current stock: *${data.currentStock}*`,
    `Minimum stock: ${data.minimumStock}`,
    ``,
    `Please restock as soon as possible.`,
  ].join("\n");
}

export async function sendWhatsAppNotification(data: NotifyJobData): Promise<string> {
  if (!data.vendorPhone) {
    throw new Error(`Vendor ${data.vendorName} has no phone number`);
  }

  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) throw new Error("Missing TWILIO_WHATSAPP_FROM");

  const body = buildMessage(data);

  // Twilio WhatsApp format: "whatsapp:+387xxxxxxxx"
  const to = data.vendorPhone.startsWith("whatsapp:")
    ? data.vendorPhone
    : `whatsapp:${data.vendorPhone}`;

  await getClient().messages.create({ from, to, body });
  return body;
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

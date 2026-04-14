import nodemailer from "nodemailer";
import type { NotifyJobData } from "@/lib/queue";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  auth:
    process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

function buildPlainText(data: NotifyJobData): string {
  const variantPart = data.variantTitle ? ` - ${data.variantTitle}` : "";
  return [
    `Hi ${data.vendorName},`,
    "",
    `This is a low stock alert from RestockIQ.`,
    "",
    `Product: ${data.productTitle}${variantPart}`,
    data.sku ? `SKU: ${data.sku}` : null,
    `Current stock: ${data.currentStock}`,
    `Minimum stock: ${data.minimumStock}`,
    "",
    "Please restock as soon as possible.",
    "",
    "— RestockIQ",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function buildHtml(data: NotifyJobData): string {
  const variantPart = data.variantTitle ? ` <span style="color:#64748b">— ${data.variantTitle}</span>` : "";
  return `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1e293b">
  <div style="background:#fee2e2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;margin-bottom:24px">
    <strong style="color:#dc2626">⚠ Low Stock Alert</strong>
  </div>
  <p>Hi <strong>${data.vendorName}</strong>,</p>
  <p>The following product needs restocking:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="border-bottom:1px solid #e2e8f0">
      <td style="padding:8px 0;color:#64748b;width:140px">Product</td>
      <td style="padding:8px 0"><strong>${data.productTitle}</strong>${variantPart}</td>
    </tr>
    ${data.sku ? `<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px 0;color:#64748b">SKU</td><td style="padding:8px 0;font-family:monospace">${data.sku}</td></tr>` : ""}
    <tr style="border-bottom:1px solid #e2e8f0">
      <td style="padding:8px 0;color:#64748b">Current stock</td>
      <td style="padding:8px 0;color:#dc2626;font-weight:bold">${data.currentStock}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#64748b">Minimum stock</td>
      <td style="padding:8px 0">${data.minimumStock}</td>
    </tr>
  </table>
  <p style="color:#64748b;font-size:13px">Please restock as soon as possible.</p>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
  <p style="color:#94a3b8;font-size:12px">Sent by RestockIQ</p>
</body>
</html>`;
}

export async function sendEmailNotification(data: NotifyJobData): Promise<string> {
  if (!data.vendorEmail) {
    throw new Error(`Vendor ${data.vendorName} has no email address`);
  }

  const variantPart = data.variantTitle ? ` - ${data.variantTitle}` : "";
  const subject = `Low stock: ${data.productTitle}${variantPart} (${data.currentStock} remaining)`;

  const text = buildPlainText(data);
  const html = data.format === "html" ? buildHtml(data) : undefined;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@restockiq.app",
    to: data.vendorEmail,
    subject,
    text,
    html,
  });

  return text;
}

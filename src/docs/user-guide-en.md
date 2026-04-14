# RestockIQ — User Guide

**Version:** 1.0  
**Language:** English

---

## What is RestockIQ?

RestockIQ is an automated inventory monitoring system connected to your Shopify store. When a product's stock falls below your configured minimum, the system automatically sends a WhatsApp message to your supplier (vendor) with the product photo and current stock level — no manual work required on your end.

**Key benefits:**
- Never miss a restock order again
- Suppliers instantly see which product needs replenishment, even without language knowledge
- Everything runs automatically, 24/7

---

## 1. Company Settings

Before you begin, enter your company information. This data will be used on purchase orders and documents.

**[SCREENSHOT: Settings]**

Go to **Settings** in the left menu and fill in:

| Field | Description |
|---|---|
| Company Name | Your company's legal name |
| Tax ID / VAT Number | Your tax identification number |
| Address | Company address |
| City / Country | City and country |
| Email | Company contact email |
| Phone | Company phone number |
| Website | Your website (optional) |
| Logo URL | Direct link to your logo image |
| Currency | Currency you use for orders |
| Default Notes | Note displayed at the bottom of every purchase order |

Click **Save Settings** when done.

> **Logo tip:** Use a direct image link ending in `.png`, `.jpg`, or `.svg`. If you're not sure how to get a direct link, contact us and we'll help.

---

## 2. Managing Suppliers (Vendors)

A vendor is a company or person you order goods from. Each vendor receives WhatsApp notifications when their assigned products reach minimum stock levels.

### Vendor List

**[SCREENSHOT: Vendors-main]**

The **Vendors** page shows all your suppliers with:
- **Name** — supplier name
- **Email** — email address
- **Channel** — notification channel (WhatsApp)
- **Products** — number of products assigned to this vendor
- **Status** — Active / Inactive

### Adding a New Vendor

**[SCREENSHOT: Vendors-add]**

Click **+ Add vendor** and fill in the form:

| Field | Description |
|---|---|
| Name * | Vendor name (required) |
| Email | Vendor's email address |
| Phone | WhatsApp number in international format (e.g. `+8613812345678` for China) |
| Notification channel | Select **WhatsApp** |

Click **Create** to save the vendor.

> **Important for WhatsApp:** The phone number must be in international format with the country code. Examples:
> - China: `+86 138 1234 5678`
> - USA: `+1 212 123 4567`
> - UK: `+44 7911 123456`
>
> The vendor must have WhatsApp installed on that number to receive messages.

### Editing and Deleting

Use **Edit** to update vendor details or **Delete** to remove a vendor. Vendors assigned to products cannot be deleted until those assignments are removed.

---

## 3. Inventory Management

**[SCREENSHOT: Inventory]**

The **Inventory** page displays all your Shopify products and their current stock levels.

### Status Overview

At the top of the page you'll see a summary:

| Card | Description |
|---|---|
| **Total** | Total number of tracked products |
| **Critical** (red) | Stock is at or below minimum |
| **Warning** (orange) | Stock is below twice the minimum |
| **OK** (green) | Stock level is healthy |

### Product Table

Each row shows:
- **Product** — product name and variant (color, size, etc.) with image
- **SKU** — stock keeping unit number
- **Stock** — current inventory (red = critical, orange = warning, green = OK)
- **Min** — minimum stock threshold, editable directly in the table
- **Vendor** — assigned supplier

### Setting Minimum Stock Levels

Click the number in the **Min** column next to any product and type a new value. Changes are saved automatically.

> **Example:** If you sell an average of 5 units per week and your supplier takes 2-3 weeks to deliver, set Min to 10-15 to ensure you never run out.

### Assigning a Vendor to a Product

In the **Vendor** column, click the dropdown and select a supplier for that product. From that point on, the vendor will receive WhatsApp alerts whenever stock drops below the minimum.

### Syncing with Shopify

Click **Sync now** (top right corner) to pull the latest stock data from your Shopify store. This is useful if you've manually adjusted inventory in Shopify.

> **Note:** The system automatically receives updates from Shopify whenever stock changes (sales, returns, manual adjustments). Manual sync is usually not needed.

---

## 4. How Notifications Work

The system automatically sends a WhatsApp message to the vendor when:

1. A product's stock drops **below the configured minimum**
2. At least **24 hours** have passed since the last alert for the same product

The message includes:
- Product name and photo
- Current stock level
- Minimum threshold
- Request to restock

**Example message:**
```
⚠️ Low Stock Alert — RestockIQ

Hi [Vendor Name],

[Product Name]
Current stock: 3
Minimum stock: 10

Please restock as soon as possible.
```

---

## 5. Alert History (Alert Log)

**[SCREENSHOT: Alert-Log]**

The **Alert Log** page shows the history of all notifications sent:

| Column | Description |
|---|---|
| Time | Date and time the message was sent |
| Vendor | Name of the vendor who received the message |
| Channel | Notification channel (WhatsApp) |
| Status | **sent** = delivered / **failed** = not delivered |
| Message | Message content preview |

The top right corner shows the total count of sent and failed messages.

> If you see a **failed** status, contact us — there may be an issue with the vendor's phone number or WhatsApp account.

---

## Frequently Asked Questions

**When will a vendor start receiving messages?**
As soon as you assign a vendor to a product and that product's stock is below the configured minimum.

**Can one vendor be assigned to multiple products?**
Yes, a single vendor can be assigned to an unlimited number of products. They will receive a separate message for each product that falls below its minimum.

**Can multiple vendors be assigned to one product?**
Currently, each product can have one vendor. Support for multiple vendors per product is planned for a future update.

**What if a vendor doesn't receive a message?**
Check that the phone number is correct and in international format. Check the Alert Log to see if the message shows as "sent" or "failed". If it shows "failed", please contact us.

**Does the system work if I lose internet?**
The system runs on our servers and is independent of your local internet connection. As long as Shopify can send inventory updates, everything will work.

**Can I pause notifications for a specific vendor?**
Yes. Click **Edit** next to the vendor and set their status to Inactive. No alerts will be sent to inactive vendors.

**How often can a vendor receive alerts for the same product?**
Maximum once every 24 hours per product. This prevents notification overload.

---

## Support

For technical support or questions, contact us at:

**Email:** [your contact email]  
**WhatsApp:** [your contact number]

---

*RestockIQ — Automate your restocking, focus on your sales.*

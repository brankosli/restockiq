# RestockIQ — User Guide

**Version:** 1.0  
**Language:** English

---

## What is RestockIQ?

RestockIQ is an automated inventory monitoring system connected to your Shopify store. When a product's stock falls below your configured minimum, the system automatically notifies your supplier — via a WhatsApp message with product photos, or a formatted email with all items — without any manual work on your end.

**Key benefits:**
- Never miss a restock order again
- Suppliers instantly see which products need replenishment, even without language knowledge
- You review and approve every request before it's sent
- Everything runs automatically, 24/7

---

## 1. Company Settings

Before you begin, enter your company information. This data will be used on purchase orders and documents.

**[SCREENSHOT: Settings-data.png]**

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
| Default Notes | Note displayed on every purchase order |

Click **Save Settings** when done.

> **Logo tip:** Use a direct image link ending in `.png`, `.jpg`, or `.svg`. If you're not sure how to get a direct link, contact us.

---

## 2. Managing Suppliers (Vendors)

A vendor is a company or person you order goods from. Each vendor receives notifications when their assigned products reach minimum stock levels.

### Vendor List

**[SCREENSHOT: Vendors-main.png]**

The **Vendors** page shows all your suppliers with:
- **Name** — supplier name
- **Email** — email address
- **Channel** — notification channel (WhatsApp or Email)
- **Products** — number of products assigned to this vendor
- **Status** — Active / Inactive

### Adding a New Vendor

**[SCREENSHOT: Vendors-add.png]**

Click **+ Add vendor** and fill in the form:

| Field | Description |
|---|---|
| Name * | Vendor name (required) |
| Email | Vendor's email address |
| Phone | WhatsApp number in international format |
| Notification channel | WhatsApp or Email |

Click **Create** to save the vendor.

> **Important for WhatsApp:** The phone number must be in international format with the country code:
> - China: `+86 138 1234 5678`
> - USA: `+1 212 123 4567`
> - UK: `+44 7911 123456`

### Editing and Deleting

Use **Edit** to update vendor details or **Delete** to remove a vendor.

---

## 3. Inventory Management

**[SCREENSHOT: Inventory.png]**

The **Inventory** page displays all your Shopify products and their current stock levels.

### Status Overview

| Card | Description |
|---|---|
| **Total** | Total number of tracked products |
| **Critical** (red) | Stock is at or below minimum |
| **Warning** (orange) | Stock is below twice the minimum |
| **OK** (green) | Stock level is healthy |

### Setting Minimum Stock Levels

Click the number in the **Min** column next to any product and type a new value. Changes are saved automatically.

> **Example:** If you sell an average of 5 units per week and your supplier takes 2-3 weeks to deliver, set Min to 15-20.

### Assigning a Vendor to a Product

In the **Vendor** column, click the dropdown and select a supplier for that product.

**Important:** At the moment of assignment, the system automatically checks if stock is below minimum. If it is, the product immediately appears in **Restock Orders**.

If you change the vendor for a product, the system automatically:
- Removes the product from the old vendor's restock order
- Adds it to the new vendor's order (if stock is below minimum)

### Syncing with Shopify

Click **Sync now** (top right corner) to pull the latest stock data from your Shopify store.

---

## 4. Restock Orders — Review and Send

**[SCREENSHOT: Restock-WhatsApp.png]**

The **Restock Orders** page is where you review and send requests to suppliers. Each vendor has their own **tab** with a list of products that need restocking.

### How is an order created?

The system automatically creates a restock order when:
1. You assign a vendor to a product whose stock is below minimum
2. Shopify reports that stock dropped below minimum (a sale, manual adjustment)

Everything after that is handled automatically — no manual steps needed.

### Order Overview

For each vendor you see:
- **Product list** with image, name, and current stock
- **Qty** — suggested order quantity (you can change this)
- **Preview** — exact view of the message the vendor will receive

### WhatsApp Order

**[SCREENSHOT: Restock-WhatsApp.png]**

When a vendor is set to **WhatsApp**, the preview shows each product as a separate message with photo and quantity — exactly as the vendor will see it on their phone.

### Email Order

**[SCREENSHOT: Restock-Email.png]**

When a vendor is set to **Email**, the preview shows a formatted email with all products, images, and quantities listed together.

### Editing Before Sending

Before sending, you can:
- **Change Qty** — click the number and type a new value
- **Remove a product** — click × next to the product
- **Add a note** — type in the field below the list (appears at the end of the message)

### Sending

Click **Send to [vendor name]** when you're ready. The order is sent and disappears from the list.

Click **Dismiss** if you don't want to send (e.g. you've already contacted the supplier directly).

> **Note:** After sending, the same products won't reappear until Shopify reports a new stock change.

---

## 5. Alert History (Alert Log)

**[SCREENSHOT: Alert-Log.png]**

The **Alert Log** page shows the history of all sent notifications:

| Column | Description |
|---|---|
| Time | Date and time the message was sent |
| Vendor | Name of the vendor who received the message |
| Channel | WhatsApp or Email |
| Status | **sent** = delivered / **failed** = not delivered |
| Message | Message content preview |

> If you see a **failed** status, contact us — there may be an issue with the vendor's phone number or email address.

---

## Frequently Asked Questions

**When will a vendor start receiving messages?**
As soon as you assign a vendor to a product whose stock is below the configured minimum.

**Can one vendor be assigned to multiple products?**
Yes, a single vendor can be assigned to an unlimited number of products.

**What happens if I change the vendor for a product?**
The system automatically moves the product to the new vendor and updates the Restock Orders accordingly.

**Can I pause notifications for a specific vendor?**
Yes — click **Edit** next to the vendor and set their status to Inactive.

**What if a vendor doesn't receive a message?**
Check the Alert Log — if the status shows "failed", please contact us.

**Does the system work if I lose internet?**
Yes — the system runs on our servers and is independent of your local internet connection.

---

## Support

For technical support or questions, contact us at:

**Email:** [your contact email]  
**WhatsApp:** [your contact number]

---

*RestockIQ — Automate your restocking, focus on your sales.*

import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  shopDomain: text("shop_domain").notNull().unique(),
  accessToken: text("access_token").notNull(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  channel: text("channel").default("email"),
  format: text("format").default("plain_text"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id),
  shopifyProductId: text("shopify_product_id").notNull(),
  shopifyVariantId: text("shopify_variant_id").notNull().unique(),
  inventoryItemId: text("inventory_item_id").notNull(),
  productTitle: text("product_title").notNull(),
  variantTitle: text("variant_title"),
  sku: text("sku"),
  vendorId: integer("vendor_id").references(() => vendors.id),
  minimumStock: integer("minimum_stock").default(10),
  currentStock: integer("current_stock").default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alertLogs = pgTable("alert_logs", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  channel: text("channel").notNull(),
  format: text("format").notNull(),
  status: text("status").notNull(), // sent, failed, pending
  payload: text("payload"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow(),
});
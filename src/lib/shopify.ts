const SHOPIFY_API_VERSION = "2024-10";

export interface ShopifyVariant {
  id: number;
  title: string;
  sku: string | null;
  inventory_item_id: number;
  inventory_quantity: number;
  image_id: number | null;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  image: { src: string } | null;
  images: { id: number; src: string }[];
  variants: ShopifyVariant[];
}

async function shopifyFetch<T>(
  shop: string,
  accessToken: string,
  path: string
): Promise<{ data: T; nextPageUrl: string | null }> {
  const url = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}${path}`;
  const res = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${text}`);
  }

  // Parsiramo Link header za paginaciju
  const linkHeader = res.headers.get("Link");
  let nextPageUrl: string | null = null;
  if (linkHeader) {
    const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    if (match) nextPageUrl = match[1];
  }

  const data = (await res.json()) as T;
  return { data, nextPageUrl };
}

export async function fetchAllProducts(
  shop: string,
  accessToken: string
): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];

  // Prva stranica — tražimo samo polja koja nam trebaju
  let path = `/products.json?limit=250&fields=id,title,image,images,variants`;

  while (path) {
    const { data, nextPageUrl } = await shopifyFetch<{ products: ShopifyProduct[] }>(
      shop,
      accessToken,
      path
    );

    products.push(...data.products);

    // Ako postoji sljedeća stranica, koristimo puni URL direktno
    if (nextPageUrl) {
      const parsedUrl = new URL(nextPageUrl);
      path = parsedUrl.pathname.replace(`/admin/api/${SHOPIFY_API_VERSION}`, "") + parsedUrl.search;
    } else {
      break;
    }
  }

  return products;
}

"use client";

import { useState } from "react";

type Vendor = { id: number; name: string };

type Variant = {
  id: number;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  currentStock: number | null;
  minimumStock: number | null;
  vendorId: number | null;
  imageUrl: string | null;
  vendorName: string | null;
};

type Status = "critical" | "warning" | "ok";

function getStatus(currentStock: number | null, minimumStock: number | null): Status {
  const stock = currentStock ?? 0;
  const min = minimumStock ?? 10;
  if (stock <= min) return "critical";
  if (stock <= min * 2) return "warning";
  return "ok";
}

export default function VariantsTable({
  initialVariants,
  vendors,
}: {
  initialVariants: Variant[];
  vendors: Vendor[];
}) {
  const [variants, setVariants] = useState(initialVariants);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");

  const filtered = variants.filter((v) => {
    const matchSearch =
      !search ||
      v.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      (v.sku?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchFilter = filter === "all" || getStatus(v.currentStock, v.minimumStock) === filter;

    return matchSearch && matchFilter;
  });

  async function handleVendorChange(variantId: number, vendorId: string) {
    const res = await fetch(`/api/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: vendorId === "" ? null : Number(vendorId) }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    const vendor = vendors.find((v) => v.id === updated.vendorId);
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, vendorId: updated.vendorId, vendorName: vendor?.name ?? null } : v
      )
    );
  }

  async function handleMinStockChange(variantId: number, value: number) {
    const res = await fetch(`/api/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minimumStock: value }),
    });
    if (!res.ok) return;
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, minimumStock: value } : v))
    );
  }

  const counts = {
    critical: variants.filter((v) => getStatus(v.currentStock, v.minimumStock) === "critical").length,
    warning: variants.filter((v) => getStatus(v.currentStock, v.minimumStock) === "warning").length,
    ok: variants.filter((v) => getStatus(v.currentStock, v.minimumStock) === "ok").length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total"
          value={variants.length}
          onClick={() => setFilter("all")}
          active={filter === "all"}
          activeClass="bg-slate-800 text-white border-slate-800"
          defaultClass="border-slate-200 text-slate-700 hover:border-slate-300"
        />
        <StatCard
          label="Critical"
          value={counts.critical}
          onClick={() => setFilter("critical")}
          active={filter === "critical"}
          activeClass="bg-red-500 text-white border-red-500"
          defaultClass="border-red-200 text-red-600 hover:border-red-300"
        />
        <StatCard
          label="Warning"
          value={counts.warning}
          onClick={() => setFilter("warning")}
          active={filter === "warning"}
          activeClass="bg-amber-500 text-white border-amber-500"
          defaultClass="border-amber-200 text-amber-600 hover:border-amber-300"
        />
        <StatCard
          label="OK"
          value={counts.ok}
          onClick={() => setFilter("ok")}
          active={filter === "ok"}
          activeClass="bg-green-500 text-white border-green-500"
          defaultClass="border-green-200 text-green-600 hover:border-green-300"
        />
      </div>

      {/* Search + active filter label */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Search by product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        {filter !== "all" && (
          <span className="text-sm text-slate-500">
            Showing <strong>{filter}</strong> ({filtered.length})
            <button
              onClick={() => setFilter("all")}
              className="ml-2 text-slate-400 hover:text-slate-600 underline text-xs"
            >
              clear
            </button>
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Min</th>
              <th className="px-4 py-3">Vendor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  {filter !== "all"
                    ? `No ${filter} variants`
                    : "No variants found"}
                </td>
              </tr>
            ) : (
              filtered.map((variant) => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  status={getStatus(variant.currentStock, variant.minimumStock)}
                  vendors={vendors}
                  onVendorChange={handleVendorChange}
                  onMinStockChange={handleMinStockChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {filtered.length} of {variants.length} variants
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  onClick,
  active,
  activeClass,
  defaultClass,
}: {
  label: string;
  value: number;
  onClick: () => void;
  active: boolean;
  activeClass: string;
  defaultClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-4 text-left transition-all cursor-pointer select-none ${
        active ? activeClass : `bg-white ${defaultClass}`
      }`}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-xs mt-0.5 ${active ? "opacity-80" : "text-slate-500"}`}>{label}</div>
    </button>
  );
}

function VariantRow({
  variant,
  status,
  vendors,
  onVendorChange,
  onMinStockChange,
}: {
  variant: Variant;
  status: Status;
  vendors: Vendor[];
  onVendorChange: (id: number, vendorId: string) => void;
  onMinStockChange: (id: number, value: number) => void;
}) {
  const [minStock, setMinStock] = useState(String(variant.minimumStock ?? 10));

  const stockBadge: Record<Status, string> = {
    critical: "bg-red-100 text-red-700 font-semibold",
    warning: "bg-amber-100 text-amber-700 font-semibold",
    ok: "bg-green-100 text-green-700",
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        {variant.imageUrl ? (
          <img src={variant.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
        ) : (
          <div className="w-8 h-8 rounded bg-slate-100" />
        )}
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800">{variant.productTitle}</div>
        {variant.variantTitle && (
          <div className="text-xs text-slate-400">{variant.variantTitle}</div>
        )}
      </td>
      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{variant.sku ?? "—"}</td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${stockBadge[status]}`}>
          {variant.currentStock ?? 0}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <input
          type="number"
          min={0}
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          onBlur={() => {
            const val = parseInt(minStock, 10);
            if (!isNaN(val) && val >= 0) onMinStockChange(variant.id, val);
          }}
          className="w-16 text-center rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={variant.vendorId ?? ""}
          onChange={(e) => onVendorChange(variant.id, e.target.value)}
          className="rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
        >
          <option value="">No vendor</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}

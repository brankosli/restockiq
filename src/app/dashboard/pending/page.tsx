"use client";

import { useState, useEffect, useCallback } from "react";

interface PendingItem {
  variantId: number;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  imageUrl: string | null;
  currentStock: number;
  minimumStock: number;
  suggestedQty: number;
}

interface PendingAlert {
  id: number;
  vendorName: string;
  vendorPhone: string | null;
  vendorEmail: string | null;
  vendorChannel: string | null;
  items: string;
  notes: string | null;
  createdAt: string;
}

function WhatsAppPreview({ vendorName, items, notes }: {
  vendorName: string;
  items: PendingItem[];
  notes: string;
}) {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="bg-[#e5ddd5] rounded-xl p-4 flex flex-col gap-2">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">WhatsApp Preview</p>
      {items.map((item) => (
        <div key={item.variantId} className="bg-white rounded-2xl rounded-tl-none shadow-sm overflow-hidden max-w-[200px]">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.productTitle} className="w-full object-cover" style={{ maxHeight: 150 }} />
          ) : (
            <div className="w-full h-20 bg-slate-100 flex items-center justify-center text-slate-300 text-2xl">□</div>
          )}
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-800 leading-tight">
              {item.productTitle}{item.variantTitle ? ` (${item.variantTitle})` : ""}
            </p>
            {item.sku && <p className="text-[10px] text-slate-400">SKU: {item.sku}</p>}
            <p className="text-xs text-slate-600 mt-0.5">Qty: <strong>{item.suggestedQty}</strong></p>
            <p className="text-right text-[10px] text-slate-400 mt-1">{time} ✓✓</p>
          </div>
        </div>
      ))}
      {notes.trim() && (
        <div className="bg-white rounded-2xl rounded-tl-none shadow-sm px-4 py-3 max-w-[200px]">
          <p className="text-xs text-slate-700">📝 {notes}</p>
          <p className="text-right text-[10px] text-slate-400 mt-1">{time} ✓✓</p>
        </div>
      )}
    </div>
  );
}

function EmailPreview({ vendorName, vendorEmail, items, notes }: {
  vendorName: string;
  vendorEmail: string | null;
  items: PendingItem[];
  notes: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide px-4 pt-3 pb-2">Email Preview</p>
      {/* Email header */}
      <div className="bg-slate-50 border-y border-slate-200 px-4 py-3 space-y-1">
        <p className="text-slate-500"><span className="font-medium text-slate-700 w-14 inline-block">From:</span> RestockIQ &lt;noreply@restockiq.app&gt;</p>
        <p className="text-slate-500"><span className="font-medium text-slate-700 w-14 inline-block">To:</span> {vendorName} {vendorEmail ? `<${vendorEmail}>` : ""}</p>
        <p className="text-slate-500"><span className="font-medium text-slate-700 w-14 inline-block">Subject:</span> Restock Request — {items.length} item{items.length !== 1 ? "s" : ""}</p>
      </div>
      {/* Email body */}
      <div className="bg-white px-4 py-4 space-y-4">
        <p className="text-slate-700">Hi <strong>{vendorName}</strong>,</p>
        <p className="text-slate-700">Please send the following items:</p>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.variantId} className="flex items-center gap-3 border border-slate-100 rounded-lg p-2">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.productTitle} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-300 flex-shrink-0">□</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {item.productTitle}{item.variantTitle ? ` — ${item.variantTitle}` : ""}
                </p>
                {item.sku && <p className="text-slate-400">SKU: {item.sku}</p>}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-slate-500">Qty</p>
                <p className="font-bold text-slate-800 text-sm">{item.suggestedQty}</p>
              </div>
            </div>
          ))}
        </div>
        {notes.trim() && (
          <div className="bg-slate-50 rounded-lg px-3 py-2 text-slate-600">
            <span className="font-medium">Note:</span> {notes}
          </div>
        )}
        <p className="text-slate-500 pt-2 border-t border-slate-100">Thank you,<br /><strong>RestockIQ</strong></p>
      </div>
    </div>
  );
}

export default function PendingPage() {
  const [alerts, setAlerts] = useState<PendingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [sending, setSending] = useState<number | null>(null);
  const [dismissing, setDismissing] = useState<number | null>(null);

  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/pending");
    const data = await res.json();
    setAlerts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  async function manualSync() {
    setSyncing(true);
    await fetch("/api/pending/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    await load();
    setSyncing(false);
  }

  useEffect(() => { load(); }, [load]);

  async function updateItems(id: number, items: PendingItem[]) {
    await fetch(`/api/pending/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, items: JSON.stringify(items) } : a)));
  }

  async function updateNotes(id: number, notes: string) {
    await fetch(`/api/pending/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, notes } : a)));
  }

  async function send(id: number) {
    setSending(id);
    await fetch(`/api/pending/${id}/send`, { method: "POST" });
    const remaining = alerts.filter((a) => a.id !== id);
    setAlerts(remaining);
    setActiveTab((t) => Math.min(t, Math.max(remaining.length - 1, 0)));
    setSending(null);
  }

  async function dismiss(id: number) {
    setDismissing(id);
    await fetch(`/api/pending/${id}`, { method: "DELETE" });
    const remaining = alerts.filter((a) => a.id !== id);
    setAlerts(remaining);
    setActiveTab((t) => Math.min(t, Math.max(remaining.length - 1, 0)));
    setDismissing(null);
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading...</div>;

  if (alerts.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 mb-1">Restock Orders</h1>
            <p className="text-sm text-slate-500">Review and send low stock notifications to vendors.</p>
          </div>
          <button
            onClick={manualSync}
            disabled={syncing}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {syncing ? "Scanning..." : "Scan inventory"}
          </button>
        </div>
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">✓</div>
          <p className="text-sm">No pending orders. All vendors are up to date.</p>
        </div>
      </div>
    );
  }

  const alert = alerts[activeTab];
  const items: PendingItem[] = JSON.parse(alert.items);
  const isWhatsApp = (alert.vendorChannel ?? "whatsapp") === "whatsapp";

  return (
    <div className="p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Restock Orders</h1>
          <p className="text-sm text-slate-500">
            Review before sending to vendors. Adjust quantities, remove products, or add notes.
          </p>
        </div>
        <button
          onClick={manualSync}
          disabled={syncing}
          className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          {syncing ? "Scanning..." : "Scan inventory"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {alerts.map((a, i) => {
          const count = JSON.parse(a.items).length;
          return (
            <button
              key={a.id}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors ${
                i === activeTab
                  ? "bg-white border-slate-200 text-slate-800 -mb-px"
                  : "bg-slate-50 border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {a.vendorName}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                i === activeTab ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-6 flex-1">

        {/* Left — editor */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col">
          {/* Actions */}
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {isWhatsApp ? "📱 WhatsApp" : "✉️ Email"} · {alert.vendorPhone ?? alert.vendorEmail}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => dismiss(alert.id)}
                disabled={dismissing === alert.id}
                className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => send(alert.id)}
                disabled={sending === alert.id || items.length === 0}
                className="px-4 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {sending === alert.id ? "Sending..." : `Send to ${alert.vendorName}`}
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="divide-y divide-slate-100 flex-1">
            {items.map((item) => (
              <div key={item.variantId} className="px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">□</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.productTitle}</p>
                  <p className="text-xs text-slate-400">
                    {item.variantTitle && <span>{item.variantTitle} · </span>}
                    <span className="text-red-500 font-medium">Stock: {item.currentStock}</span>
                    <span> / Min: {item.minimumStock}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <label className="text-xs text-slate-400">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={item.suggestedQty}
                    onChange={(e) => {
                      const updated = items.map((i) =>
                        i.variantId === item.variantId ? { ...i, suggestedQty: Number(e.target.value) } : i
                      );
                      updateItems(alert.id, updated);
                    }}
                    className="w-14 px-2 py-1 text-sm text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <button
                  onClick={() => updateItems(alert.id, items.filter((i) => i.variantId !== item.variantId))}
                  className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 text-xl leading-none"
                >×</button>
              </div>
            ))}
            {items.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-400 italic">No products. Dismiss this order.</div>
            )}
          </div>

          {/* Notes */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
            <textarea
              placeholder="Add a note for the vendor (optional)..."
              value={alert.notes ?? ""}
              onChange={(e) => updateNotes(alert.id, e.target.value)}
              rows={2}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Right — preview */}
        <div className="overflow-auto">
          {isWhatsApp ? (
            <WhatsAppPreview
              vendorName={alert.vendorName}
              items={items}
              notes={alert.notes ?? ""}
            />
          ) : (
            <EmailPreview
              vendorName={alert.vendorName}
              vendorEmail={alert.vendorEmail}
              items={items}
              notes={alert.notes ?? ""}
            />
          )}
        </div>

      </div>
    </div>
  );
}

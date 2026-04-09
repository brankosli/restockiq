"use client";

import { useState } from "react";

type Vendor = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  channel: string | null;
  active: boolean | null;
  variantCount: number;
};

const CHANNELS = ["email", "whatsapp", "viber", "sms", "slack"] as const;

const emptyForm = { name: "", email: "", phone: "", channel: "email" };

export default function VendorsClient({
  initialVendors,
  shop,
}: {
  initialVendors: Vendor[];
  shop: string;
}) {
  const [vendors, setVendors] = useState(initialVendors);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(v: Vendor) {
    setEditId(v.id);
    setForm({ name: v.name, email: v.email ?? "", phone: v.phone ?? "", channel: v.channel ?? "email" });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      if (editId) {
        // Update
        const res = await fetch(`/api/vendors/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) return;
        const updated = await res.json();
        setVendors((prev) =>
          prev.map((v) => (v.id === editId ? { ...v, ...updated } : v))
        );
      } else {
        // Create
        const res = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, shop }),
        });
        if (!res.ok) return;
        const created = await res.json();
        setVendors((prev) => [...prev, { ...created, variantCount: 0 }]);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this vendor? Their products will be unassigned.")) return;
    const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setVendors((prev) => prev.filter((v) => v.id !== id));
  }

  async function toggleActive(v: Vendor) {
    const res = await fetch(`/api/vendors/${v.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !v.active }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setVendors((prev) => prev.map((vendor) => (vendor.id === v.id ? { ...vendor, active: updated.active } : vendor)));
  }

  return (
    <div>
      {/* Add vendor button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          + Add vendor
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl border border-slate-200 bg-white p-5 max-w-lg"
        >
          <h2 className="text-sm font-semibold text-slate-700 mb-4">
            {editId ? "Edit vendor" : "New vendor"}
          </h2>
          <div className="space-y-3">
            <Field label="Name *">
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Supplier name"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="supplier@example.com"
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="+38761..."
              />
            </Field>
            <Field label="Notification channel">
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : editId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Vendor list */}
      {vendors.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-sm">
          No vendors yet. Add your first vendor above.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3 text-center">Products</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{v.name}</td>
                  <td className="px-4 py-3 text-slate-500">{v.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 capitalize">
                      {v.channel ?? "email"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{v.variantCount}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(v)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                        v.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {v.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(v)}
                      className="text-xs text-slate-400 hover:text-slate-700 mr-3 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

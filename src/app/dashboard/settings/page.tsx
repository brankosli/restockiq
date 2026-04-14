"use client";

import { useState, useEffect } from "react";

interface Settings {
  companyName?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  logoUrl?: string;
  currency?: string;
  orderNotes?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleChange(field: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500 text-sm">Loading...</div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Company Settings</h1>
      <p className="text-sm text-slate-500 mb-8">
        This information will be used on purchase orders and documents.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company info */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Company Information
          </h2>
          <div className="space-y-4">
            <Field label="Company Name" required>
              <input
                type="text"
                value={settings.companyName ?? ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Acme d.o.o."
                className={inputClass}
              />
            </Field>
            <Field label="Tax ID / VAT Number">
              <input
                type="text"
                value={settings.taxId ?? ""}
                onChange={(e) => handleChange("taxId", e.target.value)}
                placeholder="RS123456789"
                className={inputClass}
              />
            </Field>
            <Field label="Address">
              <input
                type="text"
                value={settings.address ?? ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Knez Mihailova 1"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <input
                  type="text"
                  value={settings.city ?? ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Beograd"
                  className={inputClass}
                />
              </Field>
              <Field label="Country">
                <input
                  type="text"
                  value={settings.country ?? ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="Serbia"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Contact
          </h2>
          <div className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={settings.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="info@company.com"
                className={inputClass}
              />
            </Field>
            <Field label="Phone">
              <input
                type="text"
                value={settings.phone ?? ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+381 11 123 4567"
                className={inputClass}
              />
            </Field>
            <Field label="Website">
              <input
                type="text"
                value={settings.website ?? ""}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://company.com"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Branding */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Branding
          </h2>
          <div className="space-y-4">
            <Field label="Logo URL" hint="Paste a direct image link (PNG or SVG recommended)">
              <input
                type="url"
                value={settings.logoUrl ?? ""}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                placeholder="https://company.com/logo.png"
                className={inputClass}
              />
            </Field>
            {settings.logoUrl && (
              <div className="p-4 border border-slate-200 rounded-lg inline-block bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.logoUrl}
                  alt="Company logo preview"
                  className="h-12 object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
            <Field label="Currency">
              <select
                value={settings.currency ?? "EUR"}
                onChange={(e) => handleChange("currency", e.target.value)}
                className={inputClass}
              >
                <option value="EUR">EUR — Euro</option>
                <option value="USD">USD — US Dollar</option>
                <option value="RSD">RSD — Serbian Dinar</option>
                <option value="BAM">BAM — Bosnia Mark</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CHF">CHF — Swiss Franc</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Purchase orders */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
            Purchase Orders
          </h2>
          <Field label="Default Notes" hint="Appears at the bottom of every purchase order">
            <textarea
              value={settings.orderNotes ?? ""}
              onChange={(e) => handleChange("orderNotes", e.target.value)}
              placeholder="Payment due within 30 days. Thank you for your business."
              rows={3}
              className={inputClass}
            />
          </Field>
        </section>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Settings saved</span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white text-slate-800 placeholder-slate-400";

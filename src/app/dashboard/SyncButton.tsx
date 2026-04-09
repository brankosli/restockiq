"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton({ shop }: { shop: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/sync?shop=${encodeURIComponent(shop)}`);
      const data = await res.json();
      setResult(`Synced ${data.result?.synced ?? 0} variants`);
      router.refresh();
    } catch {
      setResult("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && <span className="text-sm text-slate-500">{result}</span>}
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Syncing..." : "Sync now"}
      </button>
    </div>
  );
}

import { db } from "@/db";
import { alertLogs, vendors, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>;
}) {
  const { shop } = await searchParams;

  let store = null;
  if (shop) {
    const [s] = await db.select().from(stores).where(eq(stores.shopDomain, shop)).limit(1);
    store = s ?? null;
  } else {
    const [s] = await db.select().from(stores).where(eq(stores.active, true)).limit(1);
    store = s ?? null;
  }

  if (!store) {
    return (
      <div className="p-6 text-slate-400">No connected store found.</div>
    );
  }

  const logs = await db
    .select({
      id: alertLogs.id,
      channel: alertLogs.channel,
      status: alertLogs.status,
      payload: alertLogs.payload,
      errorMessage: alertLogs.errorMessage,
      sentAt: alertLogs.sentAt,
      vendorName: vendors.name,
    })
    .from(alertLogs)
    .leftJoin(vendors, eq(alertLogs.vendorId, vendors.id))
    .where(eq(alertLogs.storeId, store.id))
    .orderBy(desc(alertLogs.sentAt))
    .limit(200);

  const counts = {
    sent: logs.filter((l) => l.status === "sent").length,
    failed: logs.filter((l) => l.status === "failed").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Alert Log</h1>
          <p className="text-sm text-slate-400 mt-0.5">{store.shopDomain}</p>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-medium">{counts.sent} sent</span>
          <span className="text-red-500 font-medium">{counts.failed} failed</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 text-sm">
          No alerts sent yet. Alerts are triggered automatically when stock drops below the minimum.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {log.sentAt
                      ? new Date(log.sentAt).toLocaleString("en-GB", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {log.vendorName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 capitalize">
                      {log.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : log.status === "failed"
                          ? "bg-red-100 text-red-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">
                    {log.status === "failed"
                      ? log.errorMessage ?? "Unknown error"
                      : log.payload
                      ? log.payload.split("\n")[2] ?? log.payload.substring(0, 80)
                      : "—"}
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

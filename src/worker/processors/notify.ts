import type { Job } from "bullmq";
import { db } from "@/db";
import { alertLogs } from "@/db/schema";
import { sendNotification } from "@/lib/notifications";
import type { NotifyJobData } from "@/lib/queue";

export async function processNotification(job: Job<NotifyJobData>): Promise<void> {
  const data = job.data;

  console.log(
    `[worker] Processing notification for variant ${data.variantId} → vendor "${data.vendorName}" via ${data.channel}`
  );

  let status: "sent" | "failed" = "sent";
  let errorMessage: string | null = null;
  let payload = "";

  try {
    payload = await sendNotification(data);
  } catch (err) {
    status = "failed";
    errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[worker] Notification failed:`, errorMessage);
  }

  // Loguj rezultat bez obzira na ishod
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.insert(alertLogs).values({
    storeId: data.storeId,
    vendorId: data.vendorId,
    channel: data.channel,
    format: data.format,
    status,
    payload,
    errorMessage,
  } as any);

  if (status === "failed") {
    throw new Error(errorMessage ?? "Notification failed");
  }
}

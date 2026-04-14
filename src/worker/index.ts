import { Worker } from "bullmq";
import { getRedisConnection } from "@/lib/queue";
import { processNotification } from "./processors/notify";

const worker = new Worker("notifications", processNotification, {
  connection: getRedisConnection(),
  concurrency: 5,
});

worker.on("completed", (job) => {
  console.log(`[worker] ✓ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] ✗ Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});

worker.on("error", (err) => {
  console.error("[worker] Worker error:", err);
});

console.log("[worker] Started — listening for notification jobs...");

// Graceful shutdown
async function shutdown() {
  console.log("[worker] Shutting down...");
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

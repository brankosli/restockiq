import { Queue } from "bullmq";
import IORedis from "ioredis";

// Singleton — sprječava višestruke konekcije na hot reload u Next.js dev modu
const g = global as typeof global & {
  _redisConn?: IORedis;
  _notifyQueue?: Queue;
};

export function getRedisConnection(): IORedis {
  if (!g._redisConn) {
    const url = process.env.REDIS_URL ?? "redis://localhost:6379";
    g._redisConn = new IORedis(url, {
      maxRetriesPerRequest: null,
      tls: url.startsWith("rediss://") ? {} : undefined,
    });
  }
  return g._redisConn;
}

export function getNotificationQueue(): Queue {
  if (!g._notifyQueue) {
    g._notifyQueue = new Queue("notifications", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }
  return g._notifyQueue;
}

export interface NotifyJobData {
  variantId: number;
  vendorId: number;
  storeId: number;
  currentStock: number;
  minimumStock: number;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  vendorEmail: string | null;
  vendorPhone: string | null;
  vendorName: string;
  channel: string;
  format: string;
  imageUrl: string | null;
}

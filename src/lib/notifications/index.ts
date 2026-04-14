import type { NotifyJobData } from "@/lib/queue";
import { sendEmailNotification } from "./email";
import { sendWhatsAppNotification, sendSmsNotification } from "./twilio";

export async function sendNotification(data: NotifyJobData): Promise<string> {
  switch (data.channel) {
    case "email":
      return sendEmailNotification(data);
    case "whatsapp":
      return sendWhatsAppNotification(data);
    case "sms":
      return sendSmsNotification(data);
    case "viber":
    case "slack":
      throw new Error(`Channel "${data.channel}" not yet implemented`);
    default:
      throw new Error(`Unknown channel: ${data.channel}`);
  }
}

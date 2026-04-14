import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// POST /api/test/twilio
// Body: { to: "+38761xxxxxxx", channel: "sms" | "whatsapp" }
// Direktan test Twilio integracije — ne koristi queue ni bazu
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    return NextResponse.json(
      { error: "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { to, channel = "sms" } = body as { to?: string; channel?: "sms" | "whatsapp" };

  if (!to) {
    return NextResponse.json(
      { error: "Missing 'to' field. Example: { \"to\": \"+38761xxxxxxx\", \"channel\": \"sms\" }" },
      { status: 400 }
    );
  }

  const client = twilio(sid, token);

  const testMessage = `✅ RestockIQ Twilio test\nKanal: ${channel.toUpperCase()}\nVrijeme: ${new Date().toISOString()}`;

  try {
    if (channel === "whatsapp") {
      const from = process.env.TWILIO_WHATSAPP_FROM;
      if (!from) {
        return NextResponse.json(
          { error: "Missing TWILIO_WHATSAPP_FROM in .env.local" },
          { status: 500 }
        );
      }

      const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

      const msg = await client.messages.create({
        from,
        to: toFormatted,
        body: testMessage,
      });

      return NextResponse.json({
        ok: true,
        channel: "whatsapp",
        messageSid: msg.sid,
        status: msg.status,
        from,
        to: toFormatted,
        body: testMessage,
      });
    } else {
      // SMS
      const from = process.env.TWILIO_SMS_FROM;
      if (!from) {
        return NextResponse.json(
          { error: "Missing TWILIO_SMS_FROM in .env.local" },
          { status: 500 }
        );
      }

      const msg = await client.messages.create({
        from,
        to,
        body: testMessage,
      });

      return NextResponse.json({
        ok: true,
        channel: "sms",
        messageSid: msg.sid,
        status: msg.status,
        from,
        to,
        body: testMessage,
      });
    }
  } catch (err: unknown) {
    const error = err as { message?: string; code?: number; moreInfo?: string };
    return NextResponse.json(
      {
        ok: false,
        error: error.message ?? "Unknown Twilio error",
        twilioCode: error.code,
        moreInfo: error.moreInfo,
      },
      { status: 500 }
    );
  }
}

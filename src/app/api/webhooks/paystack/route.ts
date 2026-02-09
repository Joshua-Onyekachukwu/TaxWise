import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const secret = process.env.PAYSTACK_WEBHOOK_SECRET || "placeholder_secret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    // Verify webhook signature (Enable this when live)
    // if (hash !== req.headers.get("x-paystack-signature")) {
    //   return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    // }

    const event = JSON.parse(body);

    // Handle Events
    switch (event.event) {
      case "charge.success":
        console.log("Payment successful:", event.data);
        // TODO: Update user subscription status in DB
        break;
      case "subscription.create":
        console.log("Subscription created:", event.data);
        break;
      default:
        console.log("Unhandled event:", event.event);
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Error processing webhook" }, { status: 500 });
  }
}

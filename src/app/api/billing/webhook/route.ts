import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    const signature = req.headers.get("x-paystack-signature");
    
    // Read body
    const bodyText = await req.text();

    // Verify signature (commented out for stub)
    /*
    const hash = crypto.createHmac('sha512', secret).update(bodyText).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    */

    const event = JSON.parse(bodyText);

    console.log("Paystack Webhook Received:", event.event);

    // Handle events
    switch (event.event) {
      case "charge.success":
        // Provision access
        break;
      case "subscription.create":
        break;
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}

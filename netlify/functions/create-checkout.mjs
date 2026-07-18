import crypto from "node:crypto";
import { getDb } from "./utils/firebase.mjs";
import { json } from "./utils/verify.mjs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_QUANTITY = 3; // max copies per order (backend guard). Keep in sync with MAX_COPIES in src/config.ts

// POST /api/create-checkout
// Body: { fullName, email, phone, quantity }
// Creates a pending registration + a Bachs checkout session; returns checkout_url.
export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const quantity = Number(data.quantity);

  if (!fullName) return json(400, { error: "Full name is required." });
  if (!EMAIL_RE.test(email)) return json(400, { error: "A valid email is required." });
  if (!phone) return json(400, { error: "Phone number is required." });
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return json(400, { error: `Quantity must be 1–${MAX_QUANTITY}.` });
  }
  if (!process.env.BACHS_PRODUCT_ID) {
    console.error("BACHS_PRODUCT_ID is not configured.");
    return json(500, { error: "Store is not configured yet." });
  }

  const reference = "tmon_" + crypto.randomBytes(9).toString("hex");
  const db = getDb();

  // Pending registration first, so the webhook has a row to complete.
  const pendingRef = db.collection("registrations").doc();
  await pendingRef.set({
    fullName,
    email,
    phone,
    quantity,
    reference,
    paymentStatus: "pending",
    paymentMethod: "Bachs Checkout",
    amount: null,
    currency: null,
    checkoutId: null,
    chargeId: null,
    createdAt: new Date().toISOString(),
  });

  const base = process.env.BACHS_BASE_URL || "https://sandbox-api.bachs.io";
  const appUrl = process.env.APP_BASE_URL || "";

  let res;
  try {
    res = await fetch(`${base}/v1/checkout-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BACHS_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": reference,
      },
      body: JSON.stringify({
        product_cart: [{ product_id: process.env.BACHS_PRODUCT_ID, quantity }],
        customer: { email, name: fullName, phone_number: phone },
        success_url: `${appUrl}/`, // Bachs appends ?checkout_id=
        cancel_url: `${appUrl}/?checkout=cancelled`,
        reference,
        metadata: { registrationId: pendingRef.id, quantity: String(quantity) },
      }),
    });
  } catch (err) {
    console.error("Bachs request failed:", err);
    return json(502, { error: "Could not reach the payment provider." });
  }

  const text = await res.text();
  if (!res.ok) {
    console.error("Bachs checkout error:", res.status, text);
    // TEMP DEBUG: surface Bachs' error AND what Bachs thinks the product costs.
    let product = null;
    try {
      const p = await fetch(`${base}/v1/products/${process.env.BACHS_PRODUCT_ID}`, {
        headers: { Authorization: `Bearer ${process.env.BACHS_SECRET_KEY}` },
      });
      product = { status: p.status, body: (await p.text()).slice(0, 900) };
    } catch (e) {
      product = { fetchError: String(e) };
    }
    return json(502, {
      error: "Failed to create the checkout session.",
      debug: { status: res.status, body: text.slice(0, 400), product },
    });
  }

  let session;
  try {
    session = JSON.parse(text);
  } catch {
    console.error("Bachs returned non-JSON:", text);
    return json(502, { error: "Unexpected response from the payment provider." });
  }

  await pendingRef.update({ checkoutId: session.checkout_id });

  return json(200, {
    checkoutUrl: session.checkout_url,
    checkoutId: session.checkout_id,
  });
};

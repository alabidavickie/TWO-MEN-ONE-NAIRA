import { getDb } from "./utils/firebase.mjs";
import { verifyBachsSignature } from "./utils/verify.mjs";

// POST /api/bachs-webhook
// Bachs' source-of-truth notification. Verifies the HMAC signature, then flips
// the matching registration to its final status. This — not the browser — is
// what marks an order paid.
export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const signature = event.headers["x-bachs-signature"];
  const timestamp = event.headers["x-bachs-timestamp"];
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";

  if (!verifyBachsSignature(rawBody, timestamp, signature, process.env.BACHS_WEBHOOK_SECRET)) {
    console.warn("Webhook signature verification failed.");
    return { statusCode: 401, body: "Invalid signature" };
  }

  let evt;
  try {
    evt = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const db = getDb();

  // Idempotency — Bachs guarantees at-least-once delivery.
  const eventId = evt.id;
  if (eventId) {
    const existing = await db.collection("webhookEvents").doc(eventId).get();
    if (existing.exists) {
      return { statusCode: 200, body: "Already processed" };
    }
  }

  try {
    switch (evt.type) {
      case "collection.succeeded":
        await applyCollection(db, evt, "success");
        break;
      case "collection.failed":
        await applyCollection(db, evt, "failed");
        break;
      case "collection.underpaid":
        await applyCollection(db, evt, "underpaid");
        break;
      default:
        break; // acknowledge events we don't act on
    }
  } catch (err) {
    console.error("Webhook handler failed:", err);
    return { statusCode: 500, body: "Handler error" }; // Bachs retries
  }

  // Mark processed only after success, so a failure can be retried.
  if (eventId) {
    await db.collection("webhookEvents").doc(eventId).set({
      type: evt.type,
      receivedAt: new Date().toISOString(),
    });
  }

  return { statusCode: 200, body: "ok" };
};

async function applyCollection(db, evt, status) {
  const data = evt.data || {};
  const checkoutId = data.checkout_id;
  if (!checkoutId) {
    console.warn("collection event without checkout_id:", evt.id);
    return;
  }

  const snap = await db
    .collection("registrations")
    .where("checkoutId", "==", checkoutId)
    .limit(1)
    .get();

  if (snap.empty) {
    console.warn("No pending registration for checkout:", checkoutId);
    return;
  }

  await snap.docs[0].ref.update({
    paymentStatus: status,
    chargeId: data.charge_id || null,
    amount: data.amount != null ? Number(data.amount) : null,
    amountRaw: data.amount != null ? String(data.amount) : null,
    currency: data.currency || null,
    confirmedAt: new Date().toISOString(),
  });
}

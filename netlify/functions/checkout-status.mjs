import { getDb } from "./utils/firebase.mjs";
import { json } from "./utils/verify.mjs";

// GET /api/checkout-status?checkoutId=chk_...
// Lets the success page confirm payment. checkout_id is an unguessable token
// only the buyer who created the session holds.
export const handler = async (event) => {
  const checkoutId = event.queryStringParameters && event.queryStringParameters.checkoutId;
  if (!checkoutId) {
    return json(400, { error: "checkoutId is required." });
  }

  const db = getDb();
  const snap = await db
    .collection("registrations")
    .where("checkoutId", "==", checkoutId)
    .limit(1)
    .get();

  if (snap.empty) {
    return json(200, { status: "unknown" });
  }

  const doc = snap.docs[0];
  const d = doc.data();
  return json(200, {
    status: d.paymentStatus, // pending | success | failed | underpaid
    id: doc.id,
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    quantity: d.quantity,
    amount: d.amount,
    currency: d.currency,
    paymentReference: d.reference,
    paymentMethod: d.paymentMethod,
  });
};

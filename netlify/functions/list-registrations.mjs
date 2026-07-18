import { getDb } from "./utils/firebase.mjs";
import { json } from "./utils/verify.mjs";

// TEMP DIAGNOSTIC: last few registrations, to confirm the webhook marked payment.
// Remove before launch.
export const handler = async () => {
  try {
    const db = getDb();
    const snap = await db
      .collection("registrations")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();
    const items = snap.docs.map((d) => {
      const r = d.data();
      return {
        id: d.id,
        email: r.email,
        status: r.paymentStatus,
        amount: r.amount,
        currency: r.currency,
        quantity: r.quantity,
        checkoutId: r.checkoutId,
        chargeId: r.chargeId || null,
        createdAt: r.createdAt,
        confirmedAt: r.confirmedAt || null,
      };
    });
    return json(200, { count: items.length, items });
  } catch (e) {
    return json(500, { error: String(e) });
  }
};

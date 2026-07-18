import { json } from "./utils/verify.mjs";

// TEMP DIAGNOSTIC: set a product's fixed USD price. Remove before launch.
// Usage: /api/set-price?id=prod_xxx&amount=40
export const handler = async (event) => {
  const q = event.queryStringParameters || {};
  const id = q.id;
  const amount = q.amount;
  if (!id || !amount) return json(400, { error: "id and amount required" });

  const base = process.env.BACHS_BASE_URL || "https://sandbox-api.bachs.io";
  try {
    const r = await fetch(`${base}/v1/products/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.BACHS_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price: { price_type: "fixed", amount: Number(amount).toFixed(2), currency: "USD" },
      }),
    });
    const text = await r.text();
    return json(r.ok ? 200 : r.status, { ok: r.ok, status: r.status, body: text.slice(0, 700) });
  } catch (e) {
    return json(500, { error: String(e) });
  }
};

import { json } from "./utils/verify.mjs";

// TEMP DIAGNOSTIC: lists your Bachs products (id, price, billing_cycle) so we can
// grab the right product id without hunting in the dashboard. Remove before launch.
export const handler = async () => {
  const base = process.env.BACHS_BASE_URL || "https://sandbox-api.bachs.io";
  try {
    const r = await fetch(`${base}/v1/products`, {
      headers: { Authorization: `Bearer ${process.env.BACHS_SECRET_KEY}` },
    });
    const text = await r.text();
    if (!r.ok) return json(r.status, { error: "list failed", body: text.slice(0, 600) });
    const data = JSON.parse(text);
    const list = data.items || data.data || data.products || [];
    const items = list.map((p) => ({
      id: p.id,
      name: p.name,
      price_type: p.price && p.price.price_type,
      amount: p.price && p.price.amount,
      currency: p.price && p.price.currency,
      billing_cycle: p.billing_cycle,
      status: p.status,
    }));
    return json(200, { count: items.length, items });
  } catch (e) {
    return json(500, { error: String(e) });
  }
};

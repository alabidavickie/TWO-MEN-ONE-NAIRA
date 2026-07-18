import crypto from "node:crypto";

// Verify a Bachs webhook: signature = HMAC-SHA256("{timestamp}.{raw_body}") as hex.
// Reads the RAW body (never a re-serialized JSON) and rejects stale deliveries.
export function verifyBachsSignature(
  rawBody,
  timestampHeader,
  signatureHeader,
  secret,
  toleranceSeconds = 300
) {
  if (!rawBody || !timestampHeader || !signatureHeader || !secret) return false;

  const ts = parseInt(timestampHeader, 10);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestampHeader}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Small JSON response helper for the classic Netlify handler signature.
export function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

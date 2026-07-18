// Standalone test for the Bachs webhook HMAC verification.
// Run: `npm run test:webhook` (no Firebase / no network needed).
import crypto from "node:crypto";
import assert from "node:assert";
import { verifyBachsSignature } from "./utils/verify.mjs";

function sign(secret, timestamp, rawBody) {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

const secret = "whsec_test_123";
const timestamp = String(Math.floor(Date.now() / 1000));
const body = JSON.stringify({
  id: "evt_abc",
  type: "collection.succeeded",
  data: { checkout_id: "chk_1a2b3c", status: "SUCCEEDED", amount: "29.00", currency: "USD" },
});

// 1. Genuine signature verifies.
assert.strictEqual(verifyBachsSignature(body, timestamp, sign(secret, timestamp, body), secret), true, "valid signature should pass");

// 2. Tampered body fails.
const tampered = body.replace("29.00", "0.01");
assert.strictEqual(verifyBachsSignature(tampered, timestamp, sign(secret, timestamp, body), secret), false, "tampered body must fail");

// 3. Wrong secret fails.
assert.strictEqual(verifyBachsSignature(body, timestamp, sign("whsec_wrong", timestamp, body), secret), false, "wrong secret must fail");

// 4. Stale timestamp fails.
const oldTs = String(Math.floor(Date.now() / 1000) - 10000);
assert.strictEqual(verifyBachsSignature(body, oldTs, sign(secret, oldTs, body), secret), false, "stale timestamp must fail");

// 5. Missing pieces fail safely (no throw).
assert.strictEqual(verifyBachsSignature(body, timestamp, "", secret), false, "missing signature must fail");

console.log("All Netlify webhook signature tests passed.");

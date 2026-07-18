import React, { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Phone,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Lock,
} from "lucide-react";
import { PRICE_PER_COPY, formatMoney, API_BASE } from "../config";

interface CheckoutFormProps {
  quantity: number;
}

export default function CheckoutForm({ quantity }: CheckoutFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedTotal = PRICE_PER_COPY * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      setError("Please fill in all your details to continue to payment.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, quantity }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || "");
      }
      const url = payload?.checkoutUrl;
      if (!url) throw new Error("No checkout URL returned.");
      // Hand off to the Bachs hosted checkout page.
      window.location.href = url;
    } catch (err: any) {
      console.error("create-checkout failed:", err);
      // Show a human-readable message (e.g. validation); hide bare codes.
      const msg: string = err?.message || "";
      const friendly = msg.includes(" ")
        ? msg
        : "We couldn't start your payment right now. Please try again in a moment.";
      setError(friendly);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-teal-950/40 via-stone-900 to-stone-900 border-b border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-black text-lg tracking-tighter">
          B
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold tracking-wider text-stone-100 uppercase">
              Bachs Pay
            </span>
            <span className="text-[10px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-mono font-medium border border-teal-500/20">
              SECURE
            </span>
          </div>
          <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
            <Lock className="w-2.5 h-2.5 text-teal-400" /> You'll pay on Bachs' secure hosted page
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <p className="text-xs text-stone-400 leading-relaxed">
          Enter your details to reserve your copy of{" "}
          <strong className="text-stone-200">Two Men One Naira</strong>. We'll send
          you to Bachs to complete payment, then unlock your download once payment
          is confirmed.
        </p>

        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Full Name</label>
            <div className="relative">
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chinua Azikiwe"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600 font-sans"
              />
              <User className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Email Address</label>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. chinua@example.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600 font-sans"
              />
              <Mail className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Phone Number</label>
            <div className="relative">
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 803 123 4567"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600 font-sans"
              />
              <Phone className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 font-mono text-[11px] text-stone-400">
          <div className="flex justify-between">
            <span>Book Copies:</span>
            <span className="text-stone-300 font-medium">
              {quantity} {quantity === 1 ? "copy" : "copies"}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span>Estimated Total:</span>
            <span className="text-stone-100 font-bold">{formatMoney(estimatedTotal)}</span>
          </div>
          <p className="text-[10px] text-stone-500 pt-1 leading-normal">
            Final amount and available payment methods (card, bank transfer, crypto,
            mobile money) are shown on the Bachs checkout page.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-stone-800 disabled:text-stone-600 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Starting secure checkout…</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-stone-500 font-mono text-center flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-teal-500" /> Payments processed securely by Bachs
        </p>
      </form>
    </div>
  );
}

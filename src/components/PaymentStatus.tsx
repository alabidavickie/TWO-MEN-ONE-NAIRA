import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle,
  Loader2,
  BookOpen,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { CheckoutStatus } from "../types";
import { formatMoney, API_BASE } from "../config";

interface PaymentStatusProps {
  checkoutId: string;
  onDownload: () => void;
  onReset: () => void;
}

async function fetchCheckoutStatus(checkoutId: string): Promise<CheckoutStatus> {
  const res = await fetch(
    `${API_BASE}/api/checkout-status?checkoutId=${encodeURIComponent(checkoutId)}`
  );
  if (!res.ok) throw new Error(`Status check failed (${res.status})`);
  return (await res.json()) as CheckoutStatus;
}

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 40; // ~2 minutes

export default function PaymentStatus({ checkoutId, onDownload, onReset }: PaymentStatusProps) {
  const [result, setResult] = useState<CheckoutStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const data = await fetchCheckoutStatus(checkoutId);
        if (!active) return;
        setResult(data);
        const status = data.status;
        // Terminal states — stop polling.
        if (status === "success" || status === "failed" || status === "underpaid") {
          return;
        }
      } catch (err: any) {
        if (!active) return;
        console.warn("getCheckoutStatus error:", err);
        setError(err?.message || "Could not check payment status.");
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        if (active) setTimedOut(true);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [checkoutId]);

  const status = result?.status;
  const isConfirmed = status === "success";
  const isFailed = status === "failed" || status === "underpaid";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* CONFIRMED */}
        {isConfirmed && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-stone-100">Payment Confirmed!</h2>
              <p className="text-xs font-mono text-emerald-400">VERIFIED VIA BACHS • BOOK UNLOCKED</p>
            </div>
            <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Thank you{result?.fullName ? `, ${result.fullName}` : ""}. Your payment
              has been verified and your copy of{" "}
              <span className="italic">Two Men One Naira</span> is ready.
            </p>

            {result?.amount != null && result?.currency && (
              <p className="text-xs font-mono text-stone-400">
                Amount paid: <span className="text-stone-200">{formatMoney(result.amount, result.currency)}</span>
                {result.quantity ? ` • ${result.quantity} ${result.quantity === 1 ? "copy" : "copies"}` : ""}
              </p>
            )}

            <div className="border-t border-stone-800/80 my-4 pt-4">
              <button
                type="button"
                onClick={onDownload}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold py-3.5 px-8 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Download Complete Book PDF &amp; EPUB</span>
              </button>
              {result?.paymentReference && (
                <span className="text-[10px] text-stone-500 font-mono mt-2 block select-all">
                  Ref: {result.paymentReference}
                </span>
              )}
            </div>
          </>
        )}

        {/* FAILED / UNDERPAID */}
        {isFailed && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-stone-100">
                {status === "underpaid" ? "Payment Incomplete" : "Payment Not Completed"}
              </h2>
              <p className="text-xs font-mono text-red-400">
                {status === "underpaid" ? "AMOUNT RECEIVED WAS TOO LOW" : "THE PAYMENT DID NOT GO THROUGH"}
              </p>
            </div>
            <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              We couldn't confirm a completed payment. If you were charged, contact
              support with your reference and we'll sort it out.
            </p>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-mono text-teal-400 hover:text-teal-300 underline decoration-dotted"
            >
              Try again
            </button>
          </>
        )}

        {/* PENDING / WAITING */}
        {!isConfirmed && !isFailed && (
          <>
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400">
              {timedOut ? <AlertCircle className="w-10 h-10" /> : <Loader2 className="w-10 h-10 animate-spin" />}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-bold text-stone-100">
                {timedOut ? "Still Confirming…" : "Confirming Your Payment"}
              </h2>
              <p className="text-xs font-mono text-teal-400">CHECKING WITH BACHS</p>
            </div>
            <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              {timedOut
                ? "This is taking longer than usual. Your payment may still be processing — you'll receive your book by email once it's confirmed. You can safely close this page."
                : "Hang tight while we verify your payment with Bachs. This usually only takes a few seconds."}
            </p>
            {error && (
              <p className="text-[11px] font-mono text-amber-400/80">{error}</p>
            )}
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-mono text-stone-400 hover:text-stone-200 underline decoration-dotted"
            >
              Return to home
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

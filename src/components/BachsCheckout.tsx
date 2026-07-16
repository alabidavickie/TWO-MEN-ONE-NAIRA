import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  CreditCard, 
  Coins, 
  Clock, 
  Copy, 
  Check, 
  Loader2, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Info,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { PaymentMethod } from "../types";

interface BachsCheckoutProps {
  amount: number;
  amountUSD: number;
  quantity: number;
  onSuccess: (paymentReference: string, paymentMethod: string) => void;
  onCancel: () => void;
}

export default function BachsCheckout({ amount, amountUSD, quantity, onSuccess, onCancel }: BachsCheckoutProps) {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("bank");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [showSandboxTip, setShowSandboxTip] = useState<boolean>(true);

  // Generate a random high-fidelity transaction reference
  const [txnReference] = useState<string>(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let ref = "BCH-";
    for (let i = 0; i < 12; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
  });

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Simulated Verification Process
  const triggerSimulatedVerification = (methodUsed: PaymentMethod) => {
    setIsVerifying(true);
    setVerificationError(null);

    // Dynamic 2-second ledger check simulation
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentSuccess(true);
      // Wait another second to execute parent callback
      setTimeout(() => {
        onSuccess(txnReference, methodUsed === "bank" ? "Bank Transfer" : methodUsed === "card" ? "Debit Card" : "USDT (Crypto)");
      }, 1200);
    }, 2000);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSimulatedVerification("card");
  };

  // Stablecoin pricing logic
  const amountInUsdt = amountUSD.toFixed(2);

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Bachs Checkout Container */}
      <div className="md:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Secure Bachs Header */}
        <div className="p-5 bg-gradient-to-r from-teal-950/40 via-stone-900 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-black text-sm tracking-tighter">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-semibold tracking-wider text-stone-100 uppercase">
                  Bachs Pay
                </span>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded font-mono font-medium border border-teal-500/20">
                  SANDBOX
                </span>
              </div>
              <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-2.5 h-2.5 text-teal-400" /> Secure Checkout
              </p>
            </div>
          </div>
          
          {/* Countdown timer */}
          <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700/50 text-stone-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-medium text-amber-300">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Amount & Reference Details */}
        <div className="p-6 bg-stone-950/40 border-b border-stone-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="text-xs text-stone-400 block uppercase tracking-wider font-mono">
              Two Men One Naira Book ({quantity} {quantity === 1 ? "copy" : "copies"})
            </span>
            <span className="text-[10px] text-stone-500 font-mono mt-1 block">
              Ref: {txnReference}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 font-mono">Total Due:</span>
            <div className="text-2xl font-mono font-bold text-stone-100 flex items-baseline gap-1 justify-end">
              <span className="text-[#d4af37]">$</span>
              <span>{amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs text-stone-500 ml-1">USD</span>
            </div>
            <div className="text-xs text-stone-400 font-mono mt-0.5">
              Equivalent: <span className="text-stone-300">₦{amount.toLocaleString()} NGN</span>
            </div>
          </div>
        </div>

        {/* Main interactive area */}
        <div className="p-6">
          
          {paymentSuccess ? (
            /* SUCCESS STATE ANIMATION */
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4 text-teal-400">
                <ShieldCheck className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-stone-100 font-serif">Payment Approved</h3>
              <p className="text-sm text-stone-400 mt-2 max-w-sm">
                Ledger confirmation finalized. You will now be redirected to input your registration details.
              </p>
              <Loader2 className="w-5 h-5 text-teal-400 animate-spin mt-6" />
            </motion.div>
          ) : isVerifying ? (
            /* VERIFYING STATE ANIMATION */
            <div className="py-12 flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-stone-100 font-mono">Verifying Transaction</h3>
              <p className="text-sm text-stone-400 mt-2 max-w-sm">
                Bachs node is scanning the block index and virtual account ledger. Please hold on...
              </p>
              <div className="w-full max-w-xs bg-stone-900 rounded-full h-1.5 mt-6 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-1.5 rounded-full animate-pulse" style={{ width: "70%" }} />
              </div>
            </div>
          ) : (
            /* INTERACTIVE PAYMENT CHANNELS */
            <div>
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-stone-950 rounded-xl mb-6 border border-stone-800">
                <button
                  type="button"
                  id="tab-bank"
                  onClick={() => setActiveMethod("bank")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    activeMethod === "bank"
                      ? "bg-teal-500 text-black shadow-md"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Transfer</span>
                </button>
                <button
                  type="button"
                  id="tab-card"
                  onClick={() => setActiveMethod("card")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    activeMethod === "card"
                      ? "bg-teal-500 text-black shadow-md"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  id="tab-crypto"
                  onClick={() => setActiveMethod("crypto")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    activeMethod === "crypto"
                      ? "bg-teal-500 text-black shadow-md"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  <span>Crypto USDT</span>
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeMethod === "bank" && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3.5">
                      <div className="flex justify-between items-center text-xs text-stone-400">
                        <span>BANK NAME</span>
                        <span className="font-mono font-medium text-stone-200">Titan Trust Bank (Bachs Checkout)</span>
                      </div>
                      <div className="border-t border-stone-900" />
                      <div className="flex justify-between items-center text-xs text-stone-400">
                        <span>ACCOUNT NUMBER</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-base font-bold text-stone-100 tracking-wider">9012445823</span>
                          <button
                            type="button"
                            onClick={() => handleCopy("9012445823", "account")}
                            className="text-teal-400 hover:text-teal-300 p-1 rounded"
                            title="Copy Account Number"
                          >
                            {copiedText === "account" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-stone-900" />
                      <div className="flex justify-between items-center text-xs text-stone-400">
                        <span>ACCOUNT NAME</span>
                        <span className="font-mono text-stone-200 font-medium">Bachs Pay • Abiodun Alabi</span>
                      </div>
                      <div className="border-t border-stone-900" />
                      <div className="flex justify-between items-center text-xs text-stone-400">
                        <span>AMOUNT TO SEND</span>
                        <span className="font-mono text-stone-200 font-bold">₦{amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-stone-950/60 p-3.5 rounded-xl border border-dashed border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <p>
                        Transfer exactly <strong className="text-stone-200">₦{amount.toLocaleString()}</strong> to the account above. The account is dynamic and expires in 10 minutes. Click below once complete.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="btn-verify-bank"
                      onClick={() => triggerSimulatedVerification("bank")}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>I have made this bank transfer</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {activeMethod === "card" && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <form onSubmit={handleCardSubmit} className="space-y-4">
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 gap-2.5">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Card Number</label>
                          <div className="relative">
                            <input
                              required
                              type="text"
                              placeholder="4000 1234 5678 9010"
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600"
                            />
                            <CreditCard className="absolute right-4 top-3.5 w-4 h-4 text-stone-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Expiry Date</label>
                            <input
                              required
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">CVV</label>
                            <input
                              required
                              type="password"
                              placeholder="123"
                              maxLength={3}
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-stone-600"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        id="btn-pay-card"
                        className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                      >
                        <span>Authorize Payment • ₦{amount.toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </motion.div>
                )}

                {activeMethod === "crypto" && (
                  <motion.div
                    key="crypto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-950 p-4 rounded-xl border border-stone-800">
                      {/* Fake polished TRC20 QR Code */}
                      <div className="w-24 h-24 bg-white p-1 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                        <svg className="w-full h-full text-stone-900" viewBox="0 0 100 100">
                          <rect width="100" height="100" fill="white" />
                          <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" fill="currentColor" />
                          <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" fill="currentColor" />
                          <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" fill="currentColor" />
                          {/* Inner matrix simulation */}
                          <path d="M40,10 h5 v5 h-5 z M50,15 h10 v5 h-10 z M60,10 h5 v10 h-5 z" fill="currentColor" />
                          <path d="M40,30 h10 v5 h-10 z M45,40 h15 v5 h-15 z M35,50 h10 v10 h-10 z" fill="currentColor" />
                          <path d="M55,60 h20 v5 h-20 z M70,50 h10 v10 h-10 z M65,70 h15 v5 h-15 z" fill="currentColor" />
                          <path d="M45,80 h25 v5 h-25 z M50,90 h10 v5 h-10 z" fill="currentColor" />
                        </svg>
                      </div>

                      <div className="space-y-2 w-full">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400">NETWORK</span>
                          <span className="font-mono text-emerald-400 font-semibold">TRON (TRC-20)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400">USDT PRICE</span>
                          <span className="font-mono text-stone-100 font-bold">{amountInUsdt} USDT</span>
                        </div>
                        <div className="border-t border-stone-900 my-1" />
                        <div className="space-y-1">
                          <span className="text-[10px] text-stone-400 block font-mono">TRC-20 RECEIVE ADDRESS</span>
                          <div className="flex items-center justify-between bg-stone-900 rounded px-2.5 py-1.5 border border-stone-800">
                            <span className="font-mono text-[11px] text-stone-200 select-all truncate">
                              TY7pG9Mks1s9p9Nn3KAs4Bch8xPL89A2Zq
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy("TY7pG9Mks1s9p9Nn3KAs4Bch8xPL89A2Zq", "crypto")}
                              className="text-teal-400 hover:text-teal-300 p-1 rounded shrink-0 ml-1"
                              title="Copy Crypto Address"
                            >
                              {copiedText === "crypto" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-950/60 p-3.5 rounded-xl border border-dashed border-stone-800 text-xs text-stone-400 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p>
                        Transfer exactly <strong className="text-stone-200">{amountInUsdt} USDT</strong> via network <strong className="text-stone-200">TRON (TRC-20)</strong>. Do not send any other currency or use any other network, or your payment may be lost.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="btn-verify-crypto"
                      onClick={() => triggerSimulatedVerification("crypto")}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>I have sent the USDT payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex flex-wrap gap-4 items-center justify-between text-[11px] text-stone-500 font-mono">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Secure SSL with AES-256
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-200 transition-colors underline decoration-dotted"
          >
            Cancel and Return
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Bachs Integration & Sandbox Information Panel */}
      <div className="md:col-span-5 space-y-4">
        
        {/* Sandbox Tester Controls */}
        <div className="bg-gradient-to-br from-teal-950/20 via-stone-900 to-stone-900 p-5 rounded-2xl border border-teal-500/20 shadow-xl relative overflow-hidden">
          {/* subtle pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl" />
          
          <h4 className="text-stone-100 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            Sandbox Simulator
          </h4>
          <p className="text-xs text-stone-300 mt-2 leading-relaxed">
            This module integrates <span className="text-teal-400 font-mono">Bachs.io</span>, a premium modern gateway supporting Naira (NGN) bank-transfers, cards, and crypto (USDT).
          </p>

          <div className="mt-4 p-3.5 bg-stone-950/80 rounded-xl border border-stone-800 space-y-2">
            <span className="text-[10px] text-stone-400 font-mono block uppercase">Quick Testing Path:</span>
            <p className="text-[11px] text-stone-400 leading-normal">
              You can click any payment tab on the left to simulate standard customer behavior, or force instant approval with our direct bypass button.
            </p>
          </div>

          <button
            type="button"
            id="btn-sandbox-approve"
            onClick={() => triggerSimulatedVerification("bank")}
            className="w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-stone-900 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-950/20"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Simulate Successful Payment</span>
          </button>
        </div>

        {/* Real Product Link Integration */}
        <div className="bg-stone-900 border border-[#d4af37]/20 p-5 rounded-2xl space-y-3 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#d4af37]/5 rounded-full blur-xl" />
          <h4 className="text-stone-100 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#d4af37]" />
            Bachs Sandbox Product Link
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            You have configured your Bachs product link to allow custom/open pricing. When you launch the checkout link below, simply enter the exact amount: <strong className="text-stone-200">${amountUSD.toLocaleString()} USD</strong> <span className="text-stone-500">(equivalent to ₦{amount.toLocaleString()})</span>.
          </p>
          <a
            href="https://sandbox-checkout.bachs.io/pay/pl_0e3cbfb09b89"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#bfa032] text-stone-950 font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-[#d4af37]/10 group"
          >
            <span>Launch Real Bachs Checkout</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <p className="text-[10px] text-stone-500 font-mono text-center truncate bg-stone-950/60 p-2 rounded border border-stone-800">
            sandbox-checkout.bachs.io/pay/pl_0e3cbfb09b89
          </p>
        </div>

        {/* Integration Specs */}
        <div className="bg-stone-900/60 p-5 rounded-2xl border border-stone-800 space-y-3.5 text-xs text-stone-400">
          <h5 className="font-mono text-[10px] uppercase tracking-widest text-stone-300 font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            Bachs.io Integration Specs
          </h5>
          <p className="leading-relaxed">
            In a live environment, the checkout triggers the Bachs hosted invoice API:
          </p>
          <ul className="space-y-2 font-mono text-[11px] bg-stone-950/50 p-3 rounded-lg border border-stone-800/80">
            <li className="flex items-start gap-1.5">
              <span className="text-teal-400 font-bold">•</span>
              <span><strong>POST</strong> /v1/invoice/create</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-teal-400 font-bold">•</span>
              <span><strong>Header</strong> Bearer [SecretKey]</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-teal-400 font-bold">•</span>
              <span><strong>Redirect</strong> bachs.io/pay/[id]</span>
            </li>
          </ul>
          <p className="text-[11px] text-stone-500 leading-normal italic">
            This flow triggers webhook listener updates or checks the transaction reference upon redirection to ensure flawless validation.
          </p>
        </div>

      </div>

    </div>
  );
}

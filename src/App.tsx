import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Lock,
  ArrowLeft,
  Check,
  Star,
  Award,
  ShoppingBag,
  ExternalLink,
  Database,
} from "lucide-react";

import BookCover from "./components/BookCover";
import CheckoutForm from "./components/CheckoutForm";
import PaymentStatus from "./components/PaymentStatus";
import AdminPanel from "./components/AdminPanel";
import { PRICE_PER_COPY, MAX_COPIES, formatMoney } from "./config";

type ActiveView = "landing" | "checkout" | "confirm" | "admin";

export default function App() {
  const [view, setView] = useState<ActiveView>("landing");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [checkoutId, setCheckoutId] = useState<string>("");

  const estimatedTotal = PRICE_PER_COPY * quantity;

  // Route on load + hash/nav changes:
  //  - #admin                       → admin ledger
  //  - ?checkout_id=…                → payment confirmation (return from Bachs)
  //  - ?checkout=cancelled           → buyer cancelled; back to landing
  //  - localStorage pending checkout → fallback confirmation if Bachs didn't
  //                                    append ?checkout_id on the success URL
  useEffect(() => {
    const readPending = (): string => {
      try {
        const raw = localStorage.getItem("tmon_pending_checkout");
        if (!raw) return "";
        const { checkoutId: id, ts } = JSON.parse(raw);
        // Only treat a recent (<30 min) pending checkout as a return.
        if (id && Date.now() - ts < 30 * 60 * 1000) return id;
      } catch {}
      return "";
    };

    const resolveRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get("checkout_id");
      const cancelled = params.get("checkout") === "cancelled";

      if (window.location.hash === "#admin") {
        setView("admin");
        setIsAdmin(true);
        return;
      }
      if (cancelled) {
        try { localStorage.removeItem("tmon_pending_checkout"); } catch {}
        window.history.replaceState({}, "", window.location.pathname);
        setView("landing");
        return;
      }
      const pending = cid || readPending();
      if (pending) {
        try { localStorage.removeItem("tmon_pending_checkout"); } catch {}
        setCheckoutId(pending);
        setView("confirm");
        return;
      }
      setIsAdmin(false);
      setView((prev) => (prev === "admin" ? "landing" : prev));
    };

    resolveRoute();
    window.addEventListener("hashchange", resolveRoute);
    return () => window.removeEventListener("hashchange", resolveRoute);
  }, []);

  const handleAdminToggle = () => {
    if (view === "admin") {
      window.location.hash = "";
      setView("landing");
      setIsAdmin(false);
    } else {
      window.location.hash = "admin";
      setView("admin");
      setIsAdmin(true);
    }
  };

  // Clear the ?checkout_id param and return home.
  const resetToLanding = () => {
    window.history.replaceState({}, "", window.location.pathname);
    setCheckoutId("");
    setView("landing");
  };

  // Download the book PDF (falls back to a text excerpt if not uploaded yet).
  const handleDownloadBook = async () => {
    try {
      const response = await fetch("/Two_Men_One_Naira.pdf", { method: "HEAD" });
      if (response.ok) {
        const link = document.createElement("a");
        link.href = "/Two_Men_One_Naira.pdf";
        link.download = "Two_Men_One_Naira.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    } catch (err) {
      console.warn("Real book PDF not found; falling back to excerpt.");
    }

    const text = `TWO MEN, ONE NAIRA\nBy Abiodun Alabi\n\n=== EXCERPT FROM CHAPTER ONE ===\n\nThe sun rose over the Lagos lagoon like a polished copper coin...\n\nOne man worked for naira. The other made naira work for him. That is the whole book in two sentences, and everything after this is simply the how.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Two_Men_One_Naira_Excerpt.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-teal-500 selection:text-black font-sans">
      {/* HEADER NAVBAR */}
      <header className="border-b border-stone-900 bg-stone-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={resetToLanding}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ffd700] to-[#aa7c11] flex items-center justify-center border border-[#d4af37]/40 shadow shadow-[#d4af37]/10">
              <span className="font-serif font-bold text-black text-sm">₦</span>
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wide text-stone-100 block group-hover:text-teal-400 transition-colors">
                TWO MEN ONE NAIRA
              </span>
              <span className="text-[10px] text-stone-400 font-mono tracking-widest uppercase block">
                Official Book Sales
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {view !== "landing" && view !== "admin" && (
              <button
                type="button"
                onClick={resetToLanding}
                className="hidden md:flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors py-2 px-3 rounded-lg hover:bg-stone-900 border border-stone-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Book details
              </button>
            )}

            <button
              type="button"
              id="btn-admin-panel-toggle"
              onClick={handleAdminToggle}
              className={`flex items-center gap-2 text-xs font-mono py-2.5 px-4 rounded-xl border transition-all ${
                isAdmin
                  ? "bg-teal-500 text-black font-semibold border-teal-400"
                  : "bg-stone-900/40 text-stone-300 border-stone-800 hover:bg-stone-900 hover:text-stone-100"
              }`}
            >
              {isAdmin ? <Lock className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5 text-stone-500" />}
              <span>{isAdmin ? "Exit Sales Ledger" : "Merchant Dashboard"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER */}
      <main className="flex-1 py-8 md:py-12 px-6 max-w-6xl w-full mx-auto">
        {/* Views render directly (no AnimatePresence mode="wait", which could
            stall the swap waiting on an exit animation). Each view fades in on
            mount via its own motion.div. */}
        <>
          {/* VIEW 1: LANDING */}
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
                <div className="lg:col-span-7 space-y-6 md:space-y-8">
                  <div className="space-y-3.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-full text-[10px] font-mono tracking-widest uppercase border border-[#d4af37]/20">
                      <Award className="w-3.5 h-3.5" /> Award-Winning Satirical Thriller
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-100 tracking-tight leading-[1.05]">
                      TWO MEN <br />
                      <span className="italic font-normal text-stone-400">ONE NAIRA</span>
                    </h1>
                    <p className="text-xs font-mono text-stone-400 tracking-wider">
                      BY ABIODUN ALABI • FIRST EDITION DIGITAL HARDCOVER
                    </p>
                  </div>

                  <div className="border-l-2 border-teal-500/30 pl-5">
                    <p className="text-sm md:text-base text-stone-300 leading-relaxed font-sans italic">
                      "In the high-stakes financial jungle of Lagos, two men from opposite worlds find their fortunes locked over a single, historical currency note. What begins as a petty dispute spirals into a gripping psychological showdown on greed, survival, and pride."
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="text-stone-200 text-xs font-mono uppercase tracking-widest">
                      What you get upon registration:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-400 font-sans">
                      {[
                        "High-Quality PDF & EPUB File",
                        "Unlimited Lifetime Reading Access",
                        "Private Community Access Circle",
                        "Exclusive Author's Audio Commentary",
                      ].map((perk) => (
                        <div key={perk} className="flex items-center gap-2 bg-stone-900/40 p-2.5 rounded-lg border border-stone-900">
                          <Check className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-md">
                    <div>
                      <span className="text-xs font-mono text-stone-300 block uppercase tracking-wider">Number of Copies</span>
                      <span className="text-[11px] text-stone-500 mt-0.5 block">Choose between 1 and {MAX_COPIES} copies</span>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-950 p-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-stone-100 w-8 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.min(MAX_COPIES, prev + 1))}
                        disabled={quantity >= MAX_COPIES}
                        className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Buy + Preview */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      type="button"
                      id="btn-buy-book-hero"
                      onClick={() => setView("checkout")}
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-stone-900 font-bold py-4 px-6 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Proceed to Checkout • {formatMoney(estimatedTotal)}</span>
                      <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadBook}
                      className="bg-stone-900 hover:bg-stone-800 text-stone-300 font-medium py-4 px-6 rounded-xl text-sm transition-all border border-stone-800 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-stone-400" />
                      <span>Download Sample Excerpt</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-stone-500 font-mono pt-4 border-t border-stone-900">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-teal-500" /> Secure payment via Bachs
                    </div>
                    <div className="hidden sm:block text-stone-600">|</div>
                    <div className="hidden sm:block">Delivered Instantly After Payment</div>
                  </div>
                </div>

                {/* Book Cover */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    <BookCover />
                  </div>

                  <div className="max-w-xs text-center space-y-1.5 mt-2 bg-stone-900/20 p-4 rounded-xl border border-stone-900">
                    <div className="flex items-center justify-center gap-0.5 text-[#d4af37]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-stone-400 italic">
                      "An absolute rollercoaster of wits and Lagos charm. I read it in one night!"
                    </p>
                    <span className="text-[10px] text-stone-500 font-mono uppercase block">
                      — TUNDE K., LITERARY CHRONICLE
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-stone-900">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-teal-400 tracking-widest block">The Literary Theme</span>
                  <h3 className="text-lg font-serif font-bold text-stone-100">Modern Lagos Wit</h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Abiodun Alabi weaves a satirical narrative capturing the relentless hustle, social stratification, and human connections forged across Lagos' dividing lines.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-teal-400 tracking-widest block">Payment Integration</span>
                  <h3 className="text-lg font-serif font-bold text-stone-100">Secure Bachs Checkout</h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Payments run on Bachs' hosted checkout — cards, bank transfers, crypto (USDT), and mobile money — with your order confirmed by a verified webhook.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-teal-400 tracking-widest block">Instant Registration</span>
                  <h3 className="text-lg font-serif font-bold text-stone-100">Firebase Synchronization</h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Once Bachs confirms payment, your registration is logged securely in Cloud Firestore and your download unlocks automatically.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: CHECKOUT (customer details → Bachs) */}
          {view === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div>
                <button
                  type="button"
                  onClick={resetToLanding}
                  className="inline-flex items-center gap-1 text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors bg-stone-900/40 px-3.5 py-2 border border-stone-800 rounded-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and return to book detail</span>
                </button>
              </div>
              <CheckoutForm quantity={quantity} />
            </motion.div>
          )}

          {/* VIEW 3: CONFIRM (return from Bachs) */}
          {view === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <PaymentStatus
                checkoutId={checkoutId}
                onDownload={handleDownloadBook}
                onReset={resetToLanding}
              />
            </motion.div>
          )}

          {/* VIEW 4: ADMIN */}
          {view === "admin" && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AdminPanel />
            </motion.div>
          )}
        </>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-900 bg-stone-950 py-8 px-6 text-xs text-stone-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p>© {new Date().getFullYear()} Two Men One Naira Book sales. All rights reserved.</p>
            <p className="text-[10px] text-stone-600 mt-0.5">Author Abiodun Alabi. Payments by Bachs • Data on Firebase.</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://docs.bachs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-300 transition-colors flex items-center gap-1"
            >
              Bachs Docs <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span className="text-stone-600">v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

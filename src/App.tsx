import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  ArrowLeft, 
  Check, 
  Star, 
  Award, 
  CheckCircle,
  Share2,
  Bookmark,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Database
} from "lucide-react";

import BookCover from "./components/BookCover";
import BachsCheckout from "./components/BachsCheckout";
import RegistrationForm from "./components/RegistrationForm";
import AdminPanel from "./components/AdminPanel";

type ActiveView = "landing" | "checkout" | "register" | "success" | "admin";

export default function App() {
  const [view, setView] = useState<ActiveView>("landing");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // States to pass between steps
  const [quantity, setQuantity] = useState<number>(1);
  const amountUSD = quantity * 1500; // $1,500 USD per copy
  const amount = amountUSD * 1500; // ₦1,500 equivalent in Naira per USD
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [buyerInfo, setBuyerInfo] = useState<{ fullName: string; email: string; phone: string; id: string } | null>(null);

  // Read URL Hash for Admin view
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#admin") {
        setView("admin");
        setIsAdmin(true);
      } else if (view === "admin") {
        setView("landing");
        setIsAdmin(false);
      }
    };

    // Check initial hash
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [view]);

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

  // Payment completed successfully inside Bachs widget
  const handlePaymentSuccess = (ref: string, method: string) => {
    setPaymentReference(ref);
    setPaymentMethod(method);
    setView("register");
  };

  // User details successfully submitted and saved in Firestore
  const handleRegistrationSuccess = (regData: { fullName: string; email: string; phone: string; id: string }) => {
    setBuyerInfo(regData);
    setView("success");
  };

  // Quick helper to download the book PDF (or fallback to elegant chapter excerpt if not uploaded yet)
  const handleDownloadBook = async () => {
    try {
      // Check if real PDF has been dropped into the public directory
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
      console.warn("Real book PDF file not found in public folder yet. Falling back to digital excerpt.");
    }

    // High fidelity sample chapter fallback
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
          
          {/* Brand Logo */}
          <button 
            type="button"
            onClick={() => {
              window.location.hash = "";
              setView("landing");
            }}
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

          {/* Quick Nav Actions */}
          <div className="flex items-center gap-3">
            {view !== "landing" && view !== "admin" && (
              <button
                type="button"
                onClick={() => setView("landing")}
                className="hidden md:flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors py-2 px-3 rounded-lg hover:bg-stone-900 border border-stone-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Book details
              </button>
            )}

            {/* Admin Dashboard Trigger */}
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
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: LANDING SCREEN */}
          {view === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Hero Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
                
                {/* Book copy details & synopsis */}
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

                  {/* Bullet perks list */}
                  <div className="space-y-2.5">
                    <h4 className="text-stone-200 text-xs font-mono uppercase tracking-widest">
                      What you get upon registration:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-400 font-sans">
                      <div className="flex items-center gap-2 bg-stone-900/40 p-2.5 rounded-lg border border-stone-900">
                        <Check className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>High-Quality PDF & EPUB File</span>
                      </div>
                      <div className="flex items-center gap-2 bg-stone-900/40 p-2.5 rounded-lg border border-stone-900">
                        <Check className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Unlimited Lifetime Reading Access</span>
                      </div>
                      <div className="flex items-center gap-2 bg-stone-900/40 p-2.5 rounded-lg border border-stone-900">
                        <Check className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Private Community Access Circle</span>
                      </div>
                      <div className="flex items-center gap-2 bg-stone-900/40 p-2.5 rounded-lg border border-stone-900">
                        <Check className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Exclusive Author's Audio Commentary</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Selector Stepper */}
                  <div className="bg-stone-900/40 p-4 rounded-xl border border-stone-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-md">
                    <div>
                      <span className="text-xs font-mono text-stone-300 block uppercase tracking-wider">Number of Copies</span>
                      <span className="text-[11px] text-stone-500 mt-0.5 block">Choose between 1 and 10 copies</span>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-950 p-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-stone-100 w-8 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                        disabled={quantity >= 10}
                        className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 disabled:opacity-30 disabled:pointer-events-none text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Hero Buy and Preview Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <button
                      type="button"
                      id="btn-buy-book-hero"
                      onClick={() => setView("checkout")}
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-stone-900 font-bold py-4 px-6 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Proceed to Checkout • ${amountUSD.toLocaleString()} USD (₦{amount.toLocaleString()})</span>
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

                  {/* Trust indicator */}
                  <div className="flex items-center gap-4 text-xs text-stone-500 font-mono pt-4 border-t border-stone-900">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-teal-500" /> Secure payment integration via Bachs
                    </div>
                    <div className="hidden sm:block text-stone-600">|</div>
                    <div className="hidden sm:block">Delivered Instantly via Email</div>
                  </div>

                </div>

                {/* Interactive 3D Book Cover Cover Column */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="relative">
                    {/* Glowing backlight effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    <BookCover />
                  </div>
                  
                  {/* Testimonial slider simulation */}
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

              {/* Book Details and Reviews block */}
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
                  <h3 className="text-lg font-serif font-bold text-stone-100">Polished Bachs Checkout</h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Features dynamic checkout matching the exact Bachs.io platform guidelines. Support for bank transfers, cards, or stablecoins (USDT) for reader convenience.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-teal-400 tracking-widest block">Instant Registration</span>
                  <h3 className="text-lg font-serif font-bold text-stone-100">Firebase Synchronization</h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans">
                    Once payment finishes, users details are verified and logged directly inside Cloud Firestore, giving both the author and buyer immediate tracking transparency.
                  </p>
                </div>
              </div>

            </motion.div>
          )}

          {/* VIEW 2: INTEGRATED BACHS PAYMENT */}
          {view === "checkout" && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Back breadcrumb */}
              <div>
                <button
                  type="button"
                  onClick={() => setView("landing")}
                  className="inline-flex items-center gap-1 text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors bg-stone-900/40 px-3.5 py-2 border border-stone-800 rounded-xl"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and return to book detail</span>
                </button>
              </div>

              {/* Main checkout widget wrapper */}
              <BachsCheckout 
                amount={amount} 
                amountUSD={amountUSD}
                quantity={quantity}
                onSuccess={handlePaymentSuccess} 
                onCancel={() => setView("landing")} 
              />
            </motion.div>
          )}

          {/* VIEW 3: REGISTRATION DETAILS FORM */}
          {view === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <RegistrationForm 
                amount={amount}
                amountUSD={amountUSD}
                quantity={quantity}
                paymentReference={paymentReference}
                paymentMethod={paymentMethod}
                onSuccess={handleRegistrationSuccess}
              />
            </motion.div>
          )}

          {/* VIEW 4: SUCCESS & DOWNLOAD SCREEN */}
          {view === "success" && buyerInfo && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {/* Top Greeting Card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
                {/* Backlight shine */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-serif font-bold text-stone-100">Welcome to the Club!</h2>
                  <p className="text-xs font-mono text-emerald-400">REGISTRATION SUCCESSFUL • BOOK SECURED</p>
                </div>

                <p className="text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
                  Congratulations, <strong className="text-white">{buyerInfo.fullName}</strong>. Your payment reference has been recorded in our ledger, and your copy of <span className="italic">Two Men One Naira</span> is officially verified and registered!
                </p>

                <div className="border-t border-stone-800/80 my-4 pt-4">
                  <button
                    type="button"
                    onClick={handleDownloadBook}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold py-3.5 px-8 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Download Complete Book PDF & EPUB</span>
                  </button>
                  <span className="text-[10px] text-stone-500 font-mono mt-2 block">
                    File format: PDF, EPUB • Size: 4.8MB
                  </span>
                </div>
              </div>

              {/* Reader's Virtual Pass Card */}
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4 font-mono text-[11px] text-stone-400 relative">
                {/* gold frame accent */}
                <div className="absolute inset-3 border border-[#d4af37]/10 rounded pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                  <span className="text-[#d4af37] font-semibold text-[10px] uppercase tracking-wider">
                    Two Men One Naira VIP Pass
                  </span>
                  <span className="text-stone-500 text-[9px]">
                    Ledger ID: #{buyerInfo.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-[9px] text-stone-500 block uppercase">Reader Name</span>
                    <span className="text-stone-200 font-semibold block truncate mt-0.5">{buyerInfo.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-500 block uppercase">Registered Email</span>
                    <span className="text-stone-200 font-semibold block truncate mt-0.5">{buyerInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-500 block uppercase">Phone Contact</span>
                    <span className="text-stone-200 font-semibold block truncate mt-0.5">{buyerInfo.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-stone-500 block uppercase">Verification Reference</span>
                    <span className="text-stone-200 font-semibold block truncate mt-0.5 select-all">{paymentReference}</span>
                  </div>
                </div>

                <div className="border-t border-stone-800/80 pt-3 flex flex-wrap gap-4 items-center justify-between text-[10px] text-stone-500">
                  <span>Authorized by: Abiodun Alabi Publishing</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    // Reset flows to allow another purchase or exploring
                    setView("landing");
                    setBuyerInfo(null);
                    setPaymentReference("");
                    setPaymentMethod("");
                  }}
                  className="text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors underline decoration-dotted"
                >
                  Return to Home Landing Page
                </button>
              </div>

            </motion.div>
          )}

          {/* VIEW 5: ADMIN METRICS LEDGER */}
          {view === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-stone-900 bg-stone-950 py-8 px-6 text-xs text-stone-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p>© {new Date().getFullYear()} Two Men One Naira Book sales. All rights reserved.</p>
            <p className="text-[10px] text-stone-600 mt-0.5">Author Abiodun Alabi. Content powered by secure Express & Firebase engines.</p>
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
            <span className="text-stone-600">Sandbox v1.0.4</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

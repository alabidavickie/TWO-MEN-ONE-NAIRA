import React, { useState } from "react";
import { motion } from "motion/react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface RegistrationFormProps {
  amount: number;
  amountUSD: number;
  quantity: number;
  paymentReference: string;
  paymentMethod: string;
  onSuccess: (regData: { fullName: string; email: string; phone: string; id: string }) => void;
}

export default function RegistrationForm({ 
  amount, 
  amountUSD,
  quantity,
  paymentReference, 
  paymentMethod, 
  onSuccess 
}: RegistrationFormProps) {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      setError("Please fill in all details to finalize your book registration.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

      // Structure the Firestore doc
      const regPayload = {
        fullName,
        email,
        phone,
        amount,
        quantity,
        currency: "NGN",
        paymentStatus: "success",
        paymentReference,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };

      // Attempt to save to Firestore, but proceed to success anyway after 5 seconds or on error
      let resolved = false;

      addDoc(collection(db, "registrations"), regPayload)
        .then(doc => {
          if (!resolved) {
            resolved = true;
            onSuccess({ fullName, email, phone, id: doc.id });
            setIsSubmitting(false);
          }
        })
        .catch(err => {
          if (!resolved) {
            console.warn("Firestore Save Error/Offline: ", err);
            resolved = true;
            onSuccess({ fullName, email, phone, id: "fb_" + Math.random().toString(36).substring(2, 10) });
            setIsSubmitting(false);
          }
        });

      // 5-second fallback timeout
      setTimeout(() => {
        if (!resolved) {
          console.warn("Firestore connection timed out. Proceeding with fallback local registration.");
          resolved = true;
          onSuccess({ fullName, email, phone, id: "fb_" + Math.random().toString(36).substring(2, 10) });
          setIsSubmitting(false);
        }
      }, 5000);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header Banner - Verification Confirmation */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 px-6 py-5 border-b border-stone-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider border border-emerald-500/20 uppercase">
            Payment Verified
          </span>
          <h3 className="text-stone-100 font-serif font-semibold text-lg mt-0.5">
            Finalize Your Book Copy
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        
        {/* Short info */}
        <p className="text-xs text-stone-400 leading-relaxed">
          Thank you for securing your copy of <strong className="text-stone-200">Two Men One Naira</strong>! Please input your details below to finalize your registration and receive immediate download access.
        </p>

        {error && (
          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Full Name</label>
            <div className="relative">
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Chinua Azikiwe"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-stone-600 font-sans"
              />
              <User className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Email Address</label>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. chinua@example.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-stone-600 font-sans"
              />
              <Mail className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">Phone Number</label>
            <div className="relative">
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 803 123 4567"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-11 pr-4 py-3.5 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-stone-600 font-sans"
              />
              <Phone className="absolute left-4 top-4 w-4 h-4 text-stone-500" />
            </div>
          </div>

        </div>

        {/* Dynamic transaction info table */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 font-mono text-[11px] text-stone-400">
          <div className="flex justify-between">
            <span>Payment Ref:</span>
            <span className="text-stone-300 font-medium select-all">{paymentReference}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Channel:</span>
            <span className="text-stone-300 font-medium">{paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Book Copies Secured:</span>
            <span className="text-stone-300 font-medium">{quantity} {quantity === 1 ? "copy" : "copies"}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span>Amount Paid:</span>
            <span className="text-stone-100 font-bold">${amountUSD.toLocaleString()} USD <span className="text-stone-500 text-[10px] font-normal">(₦{amount.toLocaleString()})</span></span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="btn-submit-registration"
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-600 text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying & Saving Registration...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize Registration & Get Book</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}

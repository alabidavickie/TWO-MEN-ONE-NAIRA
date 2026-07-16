import React from "react";
import { motion } from "motion/react";

export default function BookCover() {
  return (
    <div className="book-container flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="book-card relative w-[280px] h-[380px] md:w-[320px] md:h-[430px] rounded-r-lg shadow-2xl flex flex-col justify-between p-8 overflow-hidden select-none"
        style={{
          background: "linear-gradient(135deg, #1e1e1a 0%, #121210 100%)",
          borderLeft: "5px solid #d4af37", // elegant gold spine border
        }}
      >
        {/* Fine gold lines / luxury frame */}
        <div className="absolute inset-4 border border-[#d4af37]/30 rounded pointer-events-none" />
        <div className="absolute inset-5 border border-[#d4af37]/10 rounded pointer-events-none" />

        {/* Header - Author / Subtext */}
        <div className="z-10 text-center mt-4">
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#d4af37] uppercase">
            A Contemporary Nigerian Satire
          </span>
        </div>

        {/* Book Title & Cover Art */}
        <div className="z-10 flex flex-col items-center justify-center my-auto text-center px-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-100 tracking-tight leading-none mb-1">
            TWO MEN
          </h1>
          <div className="flex items-center gap-2 my-4">
            <div className="w-12 h-[1px] bg-[#d4af37]/50" />
            <span className="font-serif italic text-stone-400 text-lg">one</span>
            <div className="w-12 h-[1px] bg-[#d4af37]/50" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-100 tracking-tight leading-none mb-6">
            NAIRA
          </h1>

          {/* Golden One Naira Coin Illustration */}
          <div className="relative w-20 h-20 rounded-full border-2 border-[#d4af37]/80 bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#aa7c11] flex items-center justify-center shadow-lg transform rotate-12 transition-transform hover:rotate-45">
            <div className="absolute inset-1.5 rounded-full border border-stone-900/10 flex items-center justify-center">
              <span className="font-serif text-2xl font-bold text-stone-900/80 drop-shadow">
                ₦1
              </span>
            </div>
            {/* Fine coin notches around outer rim */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#ffd700]/30 animate-spin" style={{ animationDuration: '60s' }} />
          </div>
        </div>

        {/* Footer - Spine Info & Author */}
        <div className="z-10 text-center mb-4">
          <p className="font-serif italic text-stone-300 text-sm">
            by Abiodun Alabi
          </p>
          <p className="font-mono text-[9px] text-[#d4af37]/60 tracking-widest mt-1 uppercase">
            First Edition
          </p>
        </div>

        {/* Highlight sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        
        {/* Hardback Book Spine thickness shadow simulation */}
        <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}

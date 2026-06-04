import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Award, Play } from "lucide-react";

interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

interface BadgeCelebrationModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeCelebrationModal({ badge, onClose }: BadgeCelebrationModalProps) {
  if (!badge) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 50 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 350, damping: 25 } 
          }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          className="bg-white dark:bg-sand-800 rounded-[3rem] p-8 max-w-sm w-full border-4 border-amber-300 shadow-2xl relative text-center space-y-6 overflow-hidden"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {/* Confetti & Sparkles elements */}
          <div className="absolute top-0 inset-x-0 h-full w-full pointer-events-none select-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 -left-12 w-40 h-40 border-2 border-dashed border-amber-200/40 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-16 -right-16 w-48 h-48 border-2 border-dashed border-amber-200/40 rounded-full"
            />
            {/* Sparkles around */}
            <div className="absolute top-8 left-8 text-amber-400 text-xl animate-mood-bounce">✨</div>
            <div className="absolute top-12 right-12 text-amber-500 text-2xl animate-mood-bounce animation-delay-100">🌸</div>
            <div className="absolute bottom-12 left-12 text-sage-400 text-2xl animate-mood-bounce animation-delay-200">🌱</div>
            <div className="absolute bottom-20 right-10 text-lilac-400 text-xl animate-mood-bounce animation-delay-300">🎵</div>
          </div>

          {/* Celebration Header decoration */}
          <div className="relative">
            <p className="text-[10px] font-black tracking-widest uppercase text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-250 inline-block px-4 py-1.5 rounded-full">
              🏆 Lencana Baru Terbuka! 🏆
            </p>
          </div>

          {/* Badge Big Emoji with bounce */}
          <motion.div 
            initial={{ scale: 0.2 }}
            animate={{ 
              scale: [1, 1.25, 1],
              rotate: [0, 10, -10, 0],
              transition: { delay: 0.2, duration: 0.75, type: "spring" }
            }}
            className="w-24 h-24 bg-amber-50 dark:bg-amber-950 border-4 border-amber-200 rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-xl"
          >
            {badge.emoji}
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-sand-800 tracking-tight">
              Selamat! Anda Meraih Lencana
            </h2>
            <h3 className="text-2xl font-black text-amber-600 block leading-tight scale-102">
              "{badge.title}"
            </h3>
            <p className="text-xs text-sand-500 dark:text-sand-400 font-bold px-4 leading-relaxed">
              {badge.description}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full py-4 text-xs font-black text-white bg-amber-500 hover:bg-amber-600 active:scale-95 transition-transform duration-150 rounded-2xl shadow-lg shadow-amber-500/20 cursor-pointer block uppercase tracking-wider relative z-10"
          >
            Hebat, Lanjutkan! 🎉
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

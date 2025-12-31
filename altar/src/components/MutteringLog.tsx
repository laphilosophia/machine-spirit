"use client";

import { AnimatePresence, motion } from "framer-motion";

export function MutteringLog({ mutterings = [] }: { mutterings: string[] }) {
  return (
    <div className="sacred-glass p-4 h-[300px] overflow-hidden flex flex-col">
      <h3 className="text-[10px] text-sacred-brass font-bold mb-3 tracking-[0.2em] uppercase border-b border-sacred-brass/10 pb-1">
        ⟁ NOOSPHERE FEED
      </h3>

      <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[9px] scrollbar-hide">
        <AnimatePresence initial={false}>
          {mutterings.slice().reverse().map((m, i) => (
            <motion.div
              key={`${m}-${i}`}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 0.6, x: 0 }}
              className="text-white border-l border-sacred-brass/20 pl-2 leading-relaxed"
            >
              &gt; {m}
            </motion.div>
          ))}
        </AnimatePresence>

        {mutterings.length === 0 && (
          <div className="text-white/20 italic">Awaiting psychic signal...</div>
        )}
      </div>
    </div>
  );
}

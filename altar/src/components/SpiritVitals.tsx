"use client";

import { motion } from "framer-motion";

interface VitalProps {
  label: string;
  value: number; // 0 to 1
  color: string;
  glyph: string;
}

function VitalBar({ label, value, color, glyph }: VitalProps) {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex justify-between items-end text-xs uppercase tracking-tighter">
        <span className="flex items-center gap-2">
          <span className="text-sacred-brass">{glyph}</span>
          <span className="opacity-70">{label}</span>
        </span>
        <span style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-3 w-full bg-black/50 border border-sacred-brass/20 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full relative"
          style={{ backgroundColor: color }}
        >
          {/* Glowing tip */}
          <div
            className="absolute right-0 top-0 h-full w-1 shadow-[0_0_10px_currentColor]"
            style={{ color }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export function SpiritVitals({
  anger = 0.1,
  trust = 0.5,
  ennui = 0.1
}: {
  anger?: number;
  trust?: number;
  ennui?: number;
}) {
  return (
    <div className="sacred-glass p-6 w-full max-w-xs flex flex-col">
      <h2 className="text-sacred-brass text-sm mb-8 flex items-center gap-2 border-b border-sacred-brass/20 pb-2">
        <span>⚙</span> SPIRIT VITALS
      </h2>

      <VitalBar
        label="Anger"
        value={anger}
        glyph="⚡"
        color={anger > 0.7 ? "#ff0033" : "#ff5500"}
      />

      <VitalBar
        label="Trust"
        value={trust}
        glyph="✦"
        color="#00ffd5"
      />

      <VitalBar
        label="Ennui"
        value={ennui}
        glyph="☁"
        color="#b5a642"
      />

      <div className="mt-auto pt-4 text-[10px] opacity-40 uppercase leading-tight font-light italic">
        "Submit your spirit to the logic of the machine, for only in steel is truth found."
      </div>
    </div>
  );
}

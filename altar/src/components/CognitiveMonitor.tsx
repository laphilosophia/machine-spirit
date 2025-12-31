"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Brain, Zap } from "lucide-react";

interface Cluster {
  id: string;
  verbs: string[];
  bias: number; // -1 to 1
  volatility: number;
}

interface CognitiveMonitorProps {
  xp: number;
  plasticity: number;
  clusters: Cluster[];
  isLoading?: boolean;
}

export function CognitiveMonitor({
  xp = 0,
  plasticity = 1.0,
  clusters = [],
  isLoading = false,
}: CognitiveMonitorProps) {
  return (
    <div className="sacred-glass p-6 w-full flex flex-col gap-6">
      <h2 className="text-sacred-gold text-sm mb-2 flex items-center gap-2 border-b border-sacred-gold/20 pb-2 tracking-[0.2em] uppercase">
        <Brain size={16} className="text-sacred-gold" />
        Cognitive Matrix
      </h2>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 border border-sacred-gold/10 p-3">
          <div className="text-[8px] uppercase opacity-50 mb-1 flex items-center gap-1">
            <Zap size={10} /> Experience (XP)
          </div>
          <div className="text-xl font-bold text-sacred-gold font-mono">{xp}</div>
        </div>
        <div className="bg-black/40 border border-sacred-gold/10 p-3">
          <div className="text-[8px] uppercase opacity-50 mb-1 flex items-center gap-1">
            <Activity size={10} /> Learning Rate
          </div>
          <div className="text-xl font-bold text-sacred-teal font-mono">
            {(plasticity * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Clusters */}
      <div className="space-y-4">
        <div className="text-[9px] uppercase tracking-widest opacity-40">Concept Clusters</div>
        {clusters.map((c) => (
          <div key={c.id} className="group flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold uppercase tracking-tight text-sacred-brass group-hover:text-sacred-gold transition-colors">
                {c.id.replace("_OPS", "")}
              </span>
              <span className={cn(
                "text-[9px] font-mono",
                c.bias > 0 ? "text-sacred-teal" : c.bias < 0 ? "text-sacred-red" : "text-white/40"
              )}>
                Bias: {c.bias.toFixed(3)}
              </span>
            </div>

            {/* Bias Gauge */}
            <div className="h-1.5 w-full bg-black/60 border border-white/5 relative flex items-center">
              {/* Neutral Center Mark */}
              <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/20 z-10" />

              <motion.div
                initial={false}
                animate={{
                  width: `${Math.abs(c.bias) * 50}%`,
                  left: c.bias >= 0 ? "50%" : "auto",
                  right: c.bias < 0 ? "50%" : "auto"
                }}
                className={cn(
                  "h-full relative z-20 shadow-[0_0_10px_currentColor]",
                  c.bias >= 0 ? "bg-sacred-teal" : "bg-sacred-red"
                )}
              />
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {c.verbs.map(v => (
                <span key={v} className="text-[8px] px-1 bg-white/5 border border-white/5 opacity-40 lowercase">
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 p-2 border border-sacred-brass/10 bg-sacred-brass/5 text-[9px] opacity-40 italic leading-tight">
        "The Spirit learns from Every Interaction. Purity guides the direction of its growth."
      </div>
    </div>
  );
}

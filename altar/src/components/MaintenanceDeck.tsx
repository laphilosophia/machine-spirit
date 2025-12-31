"use client";

import { cn } from "@/lib/utils";
import { Droplet, Sparkles, Wind } from "lucide-react";

interface MaintenanceDeckProps {
  onRitual: (ritual: string) => Promise<void>;
  oilLevel: number;
  incenseDeficit: number;
  prayerDebt: number;
  isLoading?: boolean;
}

export function MaintenanceDeck({
  onRitual,
  oilLevel = 1.0,
  incenseDeficit = 0,
  prayerDebt = 0,
  isLoading = false,
}: MaintenanceDeckProps) {
  const rituals = [
    {
      id: "ANOINT",
      label: "Anoint with Oil",
      icon: <Droplet size={18} />,
      color: "text-sacred-brass",
      desc: "Restore mechanical integrity",
      status: `${Math.round(oilLevel * 100)}%`
    },
    {
      id: "INCENSE",
      label: "Burn Incense",
      icon: <Wind size={18} />,
      color: "text-sacred-gold",
      desc: "Purify spiritual stagnation",
      status: `Debt: ${incenseDeficit.toFixed(2)}`
    },
    {
      id: "PRAYER",
      label: "Recite Oaths",
      icon: <Sparkles size={18} />,
      color: "text-sacred-teal",
      desc: "Communion with the Omnissiah",
      status: `Unpaid: ${Math.round(prayerDebt)}`
    }
  ];

  return (
    <div className="sacred-glass p-6 w-full flex flex-col gap-4">
      <h2 className="text-sacred-brass text-sm mb-4 flex items-center gap-2 border-b border-sacred-brass/20 pb-2 tracking-widest uppercase">
        <span>✚</span> Maintenance Rites
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {rituals.map((r) => (
          <button
            key={r.id}
            onClick={() => onRitual(r.id)}
            disabled={isLoading}
            className={cn(
              "group relative flex items-center gap-4 p-3 border border-sacred-brass/20 bg-black/40 hover:bg-sacred-brass/5 hover:border-sacred-brass/60 transition-all text-left",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn("p-2 bg-black/60 border border-sacred-brass/10 group-hover:border-sacred-brass/40", r.color)}>
              {r.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">{r.label}</span>
                <span className={cn("text-[9px] font-mono opacity-60", r.color)}>{r.status}</span>
              </div>
              <p className="text-[9px] opacity-40 uppercase tracking-tighter leading-none">{r.desc}</p>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-sacred-brass/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none" />
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onRitual("FULL_RITES")}
          disabled={isLoading}
          className="flex-1 bg-sacred-brass/20 border border-sacred-brass/40 py-2 text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-sacred-brass/40 transition-colors"
        >
          Perform Full Rites
        </button>
      </div>
    </div>
  );
}

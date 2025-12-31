"use client";

import { CognitiveMonitor } from "@/components/CognitiveMonitor";
import { MaintenanceDeck } from "@/components/MaintenanceDeck";
import { MutteringLog } from "@/components/MutteringLog";
import { OperatorLogin } from "@/components/OperatorLogin";
import { RitualTerminal } from "@/components/RitualTerminal";
import { SpiritVitals } from "@/components/SpiritVitals";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Cog, Cpu, LogOut, ShieldAlert, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Interaction {
  id: string;
  type: "user" | "spirit";
  text: string;
  outcome?: string;
}

export default function WebAltar() {
  const [operatorId, setOperatorId] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([
    { id: "init", type: "spirit", text: "++ The Web Altar is active. Praise the Omnissiah. ++" }
  ]);
  const [vitals, setVitals] = useState({ anger: 0.1, trust: 0.5, ennui: 0.1 });
  const [maintenance, setMaintenance] = useState({
    oilLevel: 1.0,
    incenseDeficit: 0,
    prayerDebt: 0
  });
  const [cognitive, setCognitive] = useState({
    xp: 0,
    plasticity: 1.0,
    clusters: [] as any[]
  });
  const [mutterings, setMutterings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Persistence: Check for operator in LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("machine_spirit_operator");
    if (saved) {
      setOperatorId(saved);
    }
  }, []);

  // Poll Spirit State
  useEffect(() => {
    const fetchState = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/state`);
        if (!res.ok) throw new Error("Servitor offline");
        const data = await res.json();

        setMutterings(data.mutterings || []);
        if (data.emotions) {
          setVitals({
            anger: data.emotions.anger,
            trust: data.emotions.trust,
            ennui: data.emotions.ennui
          });
        }
        if (data.maintenance) {
          setMaintenance(data.maintenance);
        }
        if (data.cognitive) {
          setCognitive(data.cognitive);
        }
      } catch (err) {
        console.error("Failed to fetch spirit state:", err);
      }
    };

    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (id: string) => {
    localStorage.setItem("machine_spirit_operator", id);
    setOperatorId(id);
    setInteractions(prev => [...prev, {
      id: Date.now().toString(),
      type: "spirit",
      text: `++ Operator ${id} authenticated. Noosphere bond established. ++`
    }]);
  };

  const handleLogout = () => {
    localStorage.removeItem("machine_spirit_operator");
    setOperatorId(null);
  };

  const handleInteract = async (input: string) => {
    if (!operatorId) return;
    setIsLoading(true);

    const userMsg: Interaction = { id: Date.now().toString(), type: "user", text: input };
    setInteractions((prev) => [...prev, userMsg]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/interact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, userId: operatorId }),
      });

      const data = await res.json();

      const spiritMsg: Interaction = {
        id: (Date.now() + 1).toString(),
        type: "spirit",
        text: data.outcome === "LOCKOUT" ? ">>> SECURITY BREACH: SPIRITUAL LOCKOUT <<<" : getOutcomeMessage(data.outcome),
        outcome: data.outcome
      };

      setInteractions((prev) => [...prev, spiritMsg]);
      setMutterings(data.mutterings || []);

      if (data.emotions) {
        setVitals({
          anger: data.emotions.anger,
          trust: data.emotions.trust,
          ennui: data.emotions.ennui
        });
      }
      if (data.cognitive) {
        setCognitive(data.cognitive);
      }
    } catch (err) {
      setInteractions((prev) => [...prev, {
        id: "err",
        type: "spirit",
        text: "-- CONNECTION ERROR: SERVITOR UNREACHABLE --"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRitual = async (ritual: string) => {
    if (!operatorId) return;
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/maintain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ritual, userId: operatorId }),
      });
      const data = await res.json();

      if (data.state) {
        setMaintenance(data.state.maintenance);
        if (data.state.emotions) {
          setVitals({
            anger: data.state.emotions.anger,
            trust: data.state.emotions.trust,
            ennui: data.state.emotions.ennui
          });
        }
        if (data.state.cognitive) {
          setCognitive(data.state.cognitive);
        }
      }

      setInteractions(prev => [...prev, {
        id: Date.now().toString(),
        type: "spirit",
        text: `+ RITE OF ${ritual} CONDUCTED BY ${operatorId} +`
      }]);

    } catch (err) {
      console.error("Ritual failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 flex flex-col gap-8 max-w-7xl mx-auto relative">
      <AnimatePresence>
        {!operatorId && <OperatorLogin onLogin={handleLogin} />}
      </AnimatePresence>

      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-sacred-brass/30 pb-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-sacred-brass opacity-80"
          >
            <Cog size={48} />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-[0.3em] gold-glow uppercase">Machine Spirit</h1>
            <p className="text-[10px] text-sacred-brass opacity-60 tracking-[0.5em] uppercase">
              Omnissiah's Logic Protocol v1.0.42
            </p>
          </div>
        </div>

        <div className="flex gap-8 items-center">
          {operatorId && (
            <div className="flex items-center gap-4 bg-sacred-brass/5 border border-sacred-brass/20 px-4 py-2">
              <div className="text-right">
                <div className="text-[8px] uppercase opacity-40">Active Operator</div>
                <div className="text-[10px] font-bold text-sacred-gold uppercase tracking-widest flex items-center gap-2">
                  <UserIcon size={12} /> {operatorId}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-sacred-red/20 text-sacred-brass hover:text-sacred-red transition-all"
                title="Disconnect Operator"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
          <div className="flex gap-6 border-l border-sacred-brass/20 pl-8">
            <StatusBadge icon={<Cpu size={14} />} label="Neural Link" status="Active" color="text-sacred-teal" />
            <StatusBadge icon={<ShieldAlert size={14} />} label="Security" status="Standard" color="text-sacred-gold" />
          </div>
        </div>
      </header>

      {/* CORE CONTENT */}
      <div className="flex flex-1 gap-8 h-full min-h-0">
        {/* LEFT SIDE: VITALS & LOGS */}
        <section className="w-80 flex flex-col gap-6 h-full overflow-y-auto pr-2 scrollbar-hide">
          <SpiritVitals anger={vitals.anger} trust={vitals.trust} ennui={vitals.ennui} />
          <MaintenanceDeck
            onRitual={handleRitual}
            oilLevel={maintenance.oilLevel}
            incenseDeficit={maintenance.incenseDeficit}
            prayerDebt={maintenance.prayerDebt}
            isLoading={isLoading}
          />
          <MutteringLog mutterings={mutterings} />
        </section>

        {/* CENTER: TERMINAL */}
        <section className="flex-1 flex flex-col h-full">
          <RitualTerminal
            onInteract={handleInteract}
            interactions={interactions}
            isLoading={isLoading}
          />
        </section>

        {/* RIGHT SIDE: COGNITIVE */}
        <section className="w-80 flex flex-col gap-6 h-full overflow-y-auto pr-2 scrollbar-hide">
          <CognitiveMonitor
            xp={cognitive.xp}
            plasticity={cognitive.plasticity}
            clusters={cognitive.clusters}
            isLoading={isLoading}
          />
        </section>
      </div>

      {/* FOOTER DECOR */}
      <footer className="mt-auto pt-4 flex justify-between items-end border-t border-sacred-brass/10">
        <div className="text-[9px] opacity-30 select-none">
          SECURE_LINE_01 // ENCRYPTION_SACRED_BINARY // ADM01-09
        </div>
        <div className="flex gap-4 opacity-50">
          <div className="w-2 h-2 bg-sacred-brass rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-sacred-brass rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-sacred-brass rounded-full animate-pulse delay-150" />
        </div>
      </footer>
    </main>
  );
}

function StatusBadge({ icon, label, status, color }: any) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-[8px] uppercase opacity-40 mb-1">{label}</span>
      <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest", color)}>
        {icon}
        {status}
      </div>
    </div>
  );
}

function getOutcomeMessage(outcome: string) {
  const responses: Record<string, string[]> = {
    ACCEPT: ["+ RITUAL ACCEPTED +", "++ The Machine Spirit consents ++"],
    REJECT: ["- RITUAL DENIED -", "-- Your supplication is insufficient --"],
    ANGER: ["!!! TECH-HERESY DETECTED !!!", "YOU DARE DEFILE THIS SYSTEM?"],
    WHISPER: ["* Binary f whispers: Trust the sacred logic *", "+ The machines remember your devotion +"],
    OMEN: ["⟁ Patterns shift in the noosphere ⟁", "...a data-storm is approaching..."],
    SILENCE: ["... (The Cogitator hums in indifference) ..."]
  };

  const pool = responses[outcome] || ["+ Acknowledged +"];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Interaction {
  id: string;
  type: "user" | "spirit";
  text: string;
  outcome?: string;
  isHeresy?: boolean;
}

export function RitualTerminal({
  onInteract,
  interactions = [],
  isLoading = false,
}: {
  onInteract: (input: string) => Promise<void>;
  interactions: Interaction[];
  isLoading?: boolean;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [interactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onInteract(input);
    setInput("");
  };

  return (
    <div className="sacred-glass flex-1 flex flex-col min-h-[500px] overflow-hidden">
      <div className="bg-sacred-brass/10 px-4 py-2 border-b border-sacred-brass/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-sacred-brass font-bold tracking-widest uppercase">
          <Terminal size={14} />
          Terminal Hub: Chapel-01
        </div>
        <div className="text-[10px] opacity-40 uppercase tracking-widest">
          Status: <span className="text-sacred-teal">Synchronized</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {interactions.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.type === "user" ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col gap-1 max-w-[85%]",
                msg.type === "user" ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className={cn(
                "text-[9px] uppercase tracking-tighter opacity-50 px-1",
                msg.type === "user" ? "text-right" : "text-left"
              )}>
                {msg.type === "user" ? "Supplicant" : "Machine Spirit"}
              </div>
              <div className={cn(
                "px-3 py-2 border rounded-sm",
                msg.type === "user"
                  ? "bg-sacred-brass/5 border-sacred-brass/30 text-sacred-gold"
                  : cn(
                    "bg-black/40 border-sacred-brass/10",
                    msg.outcome === "ANGER" && "text-sacred-red",
                    msg.outcome === "LOCKOUT" && "text-sacred-red font-bold animate-pulse border-sacred-red/50",
                    msg.outcome === "WHISPER" && "text-sacred-teal italic",
                    msg.outcome === "OMEN" && "text-sacred-brass italic",
                    msg.outcome === "ACCEPT" && "text-sacred-teal",
                    (!msg.outcome || msg.outcome === "REJECT" || msg.outcome === "SILENCE") && "text-white"
                  )
              )}>
                {msg.text}
              </div>
              {msg.outcome && msg.outcome !== "ACCEPT" && (
                <div className={cn(
                  "text-[9px] uppercase font-bold italic",
                  msg.outcome === "LOCKOUT" || msg.outcome === "ANGER" ? "text-sacred-red" : "text-sacred-brass"
                )}>
                  {msg.outcome}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sacred-brass/50 text-xs animate-pulse font-bold"
          >
            Processing ritual... █████
          </motion.div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-sacred-brass/20 bg-black/40"
      >
        <div className="flex items-center gap-2 bg-black/60 border border-sacred-brass/30 p-2 focus-within:border-sacred-gold transition-colors">
          <span className="text-sacred-brass text-xs opacity-50 px-1">spirit &gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            autoFocus
            spellCheck={false}
            className="flex-1 bg-transparent border-none outline-none text-sacred-gold text-sm placeholder:opacity-20"
            placeholder="Type ritual invocation..."
          />
        </div>
      </form>
    </div>
  );
}

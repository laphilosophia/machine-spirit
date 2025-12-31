"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldCheck, User } from "lucide-react";
import { useState } from "react";

interface OperatorLoginProps {
  onLogin: (id: string) => void;
}

export function OperatorLogin({ onLogin }: OperatorLoginProps) {
  const [id, setId] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;

    setIsAuthenticating(true);
    // Simulate "Noosphere Handshake"
    setTimeout(() => {
      onLogin(id.trim());
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sacred-brass/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sacred-gold/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md sacred-glass p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sacred-gold/40 to-transparent" />

        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-full border border-sacred-brass/30 flex items-center justify-center bg-sacred-brass/5">
            {isAuthenticating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ShieldCheck size={32} className="text-sacred-teal" />
              </motion.div>
            ) : (
              <User size={32} className="text-sacred-brass" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-sacred-gold mb-2">Operator Identity</h2>
            <p className="text-[10px] text-sacred-brass/60 tracking-widest uppercase">Requesting Noosphere Access Authorization</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={isAuthenticating}
                placeholder="Enter Operator ID..."
                className="w-full bg-black/60 border border-sacred-brass/20 p-4 text-sacred-gold font-mono text-sm tracking-wider focus:outline-none focus:border-sacred-gold/60 transition-colors placeholder:text-sacred-brass/20 uppercase"
                autoFocus
              />
              <div className="absolute bottom-0 left-0 h-[1px] bg-sacred-gold/40 w-0 transition-all duration-500 group-focus-within:w-full" />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating || !id.trim()}
              className={cn(
                "w-full py-4 bg-sacred-brass/10 border border-sacred-brass/40 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-sacred-brass/20 transition-all",
                (isAuthenticating || !id.trim()) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isAuthenticating ? "Synchronizing..." : "Initiate Connection"}
            </button>
          </form>

          <div className="text-[8px] opacity-30 flex flex-col gap-1">
            <span>// WARNING: UNAUTHORIZED ACCESS IS TECH-HERESY //</span>
            <span>// OMNISSIAH PRESERVES THOSE WHO SERVE //</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

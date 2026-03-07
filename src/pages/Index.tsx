import PrismaLogo from "@/components/PrismaLogo";
import SystemClock from "@/components/SystemClock";
import PowerBar from "@/components/PowerBar";
import NeuralFeed from "@/components/NeuralFeed";
import DashboardCard from "@/components/DashboardCard";
import { PrismaControlPanel } from "@/components/PrismaControlPanel";
import { SignalHistory } from "@/components/SignalHistory";
import { PrismaVolumeForcePanel } from "@/components/PrismaVolumeForcePanel";
import { useState, useEffect } from "react";
import { Info } from "lucide-react";

const Index = () => {
  const [bullPower, setBullPower] = useState(72);
  const [bearPower, setBearPower] = useState(28);

  useEffect(() => {
    const interval = setInterval(() => {
      setBullPower(Math.floor(50 + Math.random() * 40));
      setBearPower(Math.floor(10 + Math.random() * 40));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PrismaLogo size={44} />
          <div>
            <h1 className="text-gradient-pink glow-pink font-orbitron text-2xl font-bold tracking-wider">
              PRISMA IA
            </h1>
          </div>
        </div>
        <SystemClock />
      </header>

      {/* Info Banner */}
      <div className="mb-6 p-4 rounded-2xl border border-border bg-card">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-orbitron text-xs font-bold mb-1 text-foreground">Como Usar:</h3>
             <ol className="space-y-1 font-orbitron text-[10px] text-muted-foreground">
               <li>1. <strong className="text-foreground">Inicie a Captura de Tela</strong> — Selecione a aba da sua corretora</li>
               <li>2. <strong className="text-foreground">Ative a PRISMA IA</strong> — O sinal é gerado automaticamente entre 58-59s de cada vela de 1 minuto</li>
               <li>3. <strong className="text-foreground">Visualize os Sinais</strong> — Direção, força e volume atualizados em tempo real</li>
             </ol>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Left Column - Control Panel */}
        <div className="space-y-4">
          <PrismaControlPanel />

          <DashboardCard title="Prisma IA Power">
            <div className="space-y-4">
              <PowerBar label="Touros" value={bullPower} type="bull" />
              <PowerBar label="Ursos" value={bearPower} type="bear" />
            </div>
          </DashboardCard>
        </div>

        {/* Center + Right - Signals */}
        <div className="md:col-span-2 space-y-4">
          <PrismaVolumeForcePanel />

          <DashboardCard title="Visão Neural — Feed">
            <NeuralFeed lines={6} />
          </DashboardCard>

          <SignalHistory />
        </div>
      </div>

      {/* Footer */}
       <footer className="mt-8 text-center space-y-2">
         <p className="font-orbitron text-[10px] text-muted-foreground">
           <span className="font-orbitron font-bold text-foreground">PRISMA IA</span> ·{' '}
           <span className="text-accent">Horário de Brasília</span>
         </p>
         <p className="font-orbitron text-[9px] text-muted-foreground/60">
           ⚠️ Para fins educacionais. Trading envolve riscos.
         </p>
         <div className="flex items-center justify-center gap-1.5 mt-2">
           <svg className="w-3.5 h-3.5 text-neon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
           <span className="font-orbitron text-[9px] text-neon-green font-semibold">SSL Secured · Conexão Criptografada</span>
         </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import PrismaLogo from "@/components/PrismaLogo";
import SystemClock from "@/components/SystemClock";
import PowerBar from "@/components/PowerBar";
import NeuralFeed from "@/components/NeuralFeed";
import MarketTickers from "@/components/MarketTickers";
import DashboardCard from "@/components/DashboardCard";

const mockTickers = [
  { pair: "BTC/USDT", price: 67842.5, change: 2.34 },
  { pair: "ETH/USDT", price: 3521.18, change: -0.87 },
  { pair: "SOL/USDT", price: 148.92, change: 5.12 },
  { pair: "BNB/USDT", price: 612.4, change: 1.05 },
];

const Index = () => {
  const [motorActive, setMotorActive] = useState(false);
  const [bullPower, setBullPower] = useState(72);
  const [bearPower, setBearPower] = useState(28);
  const [systemStatus, setSystemStatus] = useState("CALIBRANDO");
  const [accuracy, setAccuracy] = useState(94.7);
  const [operations, setOperations] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBullPower(Math.floor(50 + Math.random() * 40));
      setBearPower(Math.floor(10 + Math.random() * 40));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (motorActive) {
      setSystemStatus("OPERANDO");
      const interval = setInterval(() => {
        setOperations((p) => p + 1);
        setProfit((p) => p + (Math.random() * 50 - 10));
        setAccuracy(92 + Math.random() * 6);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setSystemStatus("CALIBRANDO");
    }
  }, [motorActive]);

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
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Sistema de Visão Neural
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${
              motorActive
                ? "border-neon-green/30 text-neon-green"
                : "border-neon-gold/30 text-neon-gold"
            }`}
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse-glow" />
            Status: {systemStatus}
          </div>
          <SystemClock />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-4">
          <DashboardCard title="Prisma IA Power">
            <div className="space-y-4">
              <PowerBar label="Touros" value={bullPower} type="bull" />
              <PowerBar label="Ursos" value={bearPower} type="bear" />
            </div>
          </DashboardCard>

          <DashboardCard title="Mercado">
            <MarketTickers tickers={mockTickers} />
          </DashboardCard>
        </div>

        {/* Center Column */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <DashboardCard title="Motor Neural" className="w-full text-center">
            <div className="flex flex-col items-center gap-6 py-4">
              <PrismaLogo size={80} />
              <button
                onClick={() => setMotorActive(!motorActive)}
                className={`rounded-full px-10 py-3.5 font-orbitron text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all duration-300 ${
                  motorActive
                    ? "bg-neon-green glow-green"
                    : "bg-primary glow-purple"
                }`}
              >
                {motorActive ? "MOTOR ATIVO" : "ATIVAR MOTOR"}
              </button>
              {motorActive && (
                <p className="animate-pulse-glow font-mono text-[10px] uppercase tracking-widest text-neon-green">
                  Processando sinais em tempo real...
                </p>
              )}
            </div>
          </DashboardCard>

          <DashboardCard title="Visão Neural — Feed" className="w-full">
            <NeuralFeed lines={6} />
          </DashboardCard>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <DashboardCard title="Performance">
            <div className="grid grid-cols-2 gap-3">
              <StatBlock label="Precisão" value={`${accuracy.toFixed(1)}%`} color="text-neon-green" />
              <StatBlock label="Operações" value={String(operations)} color="text-foreground" />
              <StatBlock
                label="Lucro"
                value={`${profit >= 0 ? "+" : ""}$${profit.toFixed(2)}`}
                color={profit >= 0 ? "text-neon-green" : "text-neon-red"}
              />
              <StatBlock label="Motor" value={motorActive ? "ON" : "OFF"} color={motorActive ? "text-neon-green" : "text-muted-foreground"} />
            </div>
          </DashboardCard>

          <DashboardCard title="Parâmetros do Modelo">
            <div className="space-y-2">
              <ParamRow label="Modelo" value="LSTM v4.2" />
              <ParamRow label="Camadas" value="128 × 3" />
              <ParamRow label="Dropout" value="0.25" />
              <ParamRow label="Épocas" value="1,200" />
              <ParamRow label="Loss" value="0.0031" />
              <ParamRow label="Otimizador" value="Adam" />
            </div>
          </DashboardCard>

          <DashboardCard title="Sinais Ativos">
            <div className="space-y-2">
              <SignalRow pair="BTC/USDT" direction="LONG" confidence={92} />
              <SignalRow pair="ETH/USDT" direction="SHORT" confidence={78} />
              <SignalRow pair="SOL/USDT" direction="LONG" confidence={85} />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

const StatBlock = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`mt-1 font-mono text-lg font-bold ${color}`}>{value}</p>
  </div>
);

const ParamRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
    <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
    <span className="font-mono text-[11px] text-foreground">{value}</span>
  </div>
);

const SignalRow = ({ pair, direction, confidence }: { pair: string; direction: string; confidence: number }) => (
  <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
    <span className="font-mono text-xs text-foreground">{pair}</span>
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
        direction === "LONG"
          ? "bg-neon-green/10 text-neon-green"
          : "bg-neon-red/10 text-neon-red"
      }`}
    >
      {direction}
    </span>
    <span className="font-mono text-[11px] text-muted-foreground">{confidence}%</span>
  </div>
);

export default Index;

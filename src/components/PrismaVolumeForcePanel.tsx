import { useState, useEffect } from 'react';
import { automationService } from '@/services/automation.service';
import type { TradingAnalysis } from '@/services/tradingAnalysis.service';
import { formatTime } from '@/lib/utils';
import { ArrowUp, ArrowDown, Activity, Minus, Zap } from 'lucide-react';

export function PrismaVolumeForcePanel() {
  const [analysis, setAnalysis] = useState<TradingAnalysis | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const a = automationService.getLastAnalysis();
      if (a) setAnalysis(a);
    }, 1000);

    automationService.onAnalysis((result) => {
      setAnalysis(result);
    });

    return () => clearInterval(interval);
  }, []);

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-accent" />
          <h3 className="font-orbitron text-sm font-bold tracking-wider text-foreground">Sinais em Tempo Real</h3>
        </div>
        <div className="text-center py-16">
          <div className="relative inline-block">
            <Zap className="w-20 h-20 mx-auto text-accent/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse-glow" />
            </div>
          </div>
          <p className="mt-6 text-muted-foreground font-mono text-xs">
            Inicie a captura e ative a PRISMA IA para visualizar sinais
          </p>
          <p className="mt-2 text-muted-foreground/60 font-mono text-[10px]">
            Sinais são gerados na abertura de cada vela de 1 minuto
          </p>
        </div>
      </div>
    );
  }

  const buyWidth = analysis.forca_compradora;
  const sellWidth = analysis.forca_vendedora;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          <h3 className="font-orbitron text-sm font-bold tracking-wider text-foreground">Volume & Força</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatTime(analysis.timestamp)}
          </span>
          {analysis.ativo && (
            <span className="font-orbitron text-xs font-bold text-accent px-2 py-0.5 rounded-lg bg-accent/10">
              {analysis.ativo}
            </span>
          )}
        </div>
      </div>

      {/* Direction + Intensity */}
      <div className={`p-6 rounded-2xl text-center transition-all duration-500 ${
        analysis.direcao === 'COMPRA' ? 'bg-neon-green/10 border border-neon-green/30' :
        analysis.direcao === 'VENDA' ? 'bg-neon-red/10 border border-neon-red/30' :
        'bg-secondary border border-border'
      }`}>
        <div className="flex items-center justify-center gap-3">
          {analysis.direcao === 'COMPRA' ? (
            <ArrowUp className="w-12 h-12 text-neon-green" />
          ) : analysis.direcao === 'VENDA' ? (
            <ArrowDown className="w-12 h-12 text-neon-red" />
          ) : (
            <Minus className="w-12 h-12 text-muted-foreground" />
          )}
          <div>
            <p className={`font-orbitron text-3xl font-black tracking-tight ${
              analysis.direcao === 'COMPRA' ? 'text-neon-green' :
              analysis.direcao === 'VENDA' ? 'text-neon-red' :
              'text-foreground'
            }`}>{analysis.direcao}</p>
            <p className="font-mono text-xs text-muted-foreground">{analysis.intensidade}</p>
          </div>
        </div>
        {analysis.preco && (
          <p className="mt-3 font-mono text-xl text-foreground font-bold">{analysis.preco}</p>
        )}
      </div>

      {/* Force Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-neon-green font-semibold">Compradores</span>
          <span className="font-mono text-xs text-neon-green font-bold">{analysis.forca_compradora}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-neon-green rounded-full transition-all duration-700"
            style={{ width: `${buyWidth}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-neon-red font-semibold">Vendedores</span>
          <span className="font-mono text-xs text-neon-red font-bold">{analysis.forca_vendedora}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-neon-red rounded-full transition-all duration-700"
            style={{ width: `${sellWidth}%` }}
          />
        </div>
      </div>

      {/* Arrows section */}
      {analysis.setas && analysis.setas.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Setas de Força</p>
          <div className="flex flex-wrap gap-2">
            {analysis.setas.map((seta, i) => (
              <div
                key={i}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
                  seta.direcao === 'cima'
                    ? 'bg-neon-green/10 text-neon-green'
                    : 'bg-neon-red/10 text-neon-red'
                }`}
              >
                {seta.direcao === 'cima' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{seta.valor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volume Bars */}
      {analysis.volume_bars && analysis.volume_bars.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Barras de Volume</p>
          <div className="flex items-end gap-1 h-20">
            {analysis.volume_bars.map((bar, i) => {
              const height = bar.tamanho === 'grande' ? '100%' : bar.tamanho === 'medio' ? '60%' : '30%';
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-lg transition-all duration-500 ${
                    bar.tipo === 'compra' ? 'bg-neon-green' : 'bg-neon-red'
                  }`}
                  style={{ height }}
                  title={`${bar.tipo}: ${bar.valor}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis.resumo && (
        <div className="p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">{analysis.resumo}</p>
        </div>
      )}
    </div>
  );
}

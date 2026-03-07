import { useState, useEffect } from 'react';
import { automationService } from '@/services/automation.service';
import type { TradingAnalysis } from '@/services/tradingAnalysis.service';
import { formatTime } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import PrismaLogo from '@/components/PrismaLogo';

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
          <PrismaLogo size={20} />
          <h3 className="font-orbitron text-sm font-bold tracking-wider text-foreground">Sinais em Tempo Real</h3>
        </div>
        <div className="text-center py-16">
          <PrismaLogo size={64} />
          <p className="mt-6 text-muted-foreground font-orbitron text-xs">
            Inicie a captura e ative a PRISMA IA para visualizar sinais
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
          <PrismaLogo size={20} />
          <h3 className="font-orbitron text-sm font-bold tracking-wider text-foreground">Sinais em Tempo Real</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-orbitron text-[10px] text-muted-foreground">
            {formatTime(analysis.timestamp)}
          </span>
          {analysis.ativo && (
            <span className="font-orbitron text-xs font-bold text-accent px-2 py-0.5 rounded-full bg-accent/10">
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
            <p className="font-orbitron text-xs text-muted-foreground">{analysis.intensidade}</p>
          </div>
        </div>
        {analysis.preco && (
          <p className="mt-3 font-orbitron text-xl text-foreground font-bold">{analysis.preco}</p>
        )}
      </div>

      {/* Force Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-orbitron text-xs text-neon-green font-semibold">Compradores</span>
          <span className="font-orbitron text-xs text-neon-green font-bold">{analysis.forca_compradora}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-neon-green rounded-full transition-all duration-700"
            style={{ width: `${buyWidth}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-orbitron text-xs text-neon-red font-semibold">Vendedores</span>
          <span className="font-orbitron text-xs text-neon-red font-bold">{analysis.forca_vendedora}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-neon-red rounded-full transition-all duration-700"
            style={{ width: `${sellWidth}%` }}
          />
        </div>
      </div>

      {/* Indicators - Williams %R + Momentum */}
      {analysis.indicadores && (
        <div className="space-y-3">
          <p className="font-orbitron text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Indicadores</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50 border border-border">
              <p className="font-orbitron text-[10px] text-muted-foreground mb-1">Williams %R (7)</p>
              <div className="flex items-center gap-2">
                {analysis.indicadores.williams_r_direcao === 'cima' ? (
                  <ArrowUp className="w-4 h-4 text-neon-green" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-neon-red" />
                )}
                <span className={`font-orbitron text-sm font-bold ${
                  analysis.indicadores.williams_r_direcao === 'cima' ? 'text-neon-green' : 'text-neon-red'
                }`}>{analysis.indicadores.williams_r_valor}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border">
              <p className="font-orbitron text-[10px] text-muted-foreground mb-1">Momentum (5)</p>
              <div className="flex items-center gap-2">
                {analysis.indicadores.momentum_direcao === 'cima' ? (
                  <ArrowUp className="w-4 h-4 text-neon-green" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-neon-red" />
                )}
                <span className={`font-orbitron text-sm font-bold ${
                  analysis.indicadores.momentum_direcao === 'cima' ? 'text-neon-green' : 'text-neon-red'
                }`}>{analysis.indicadores.momentum_valor}</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center justify-center gap-2 p-2 rounded-xl ${
            analysis.indicadores.ambos_alinhados ? 'bg-neon-green/10 border border-neon-green/20' : 'bg-secondary border border-border'
          }`}>
            <span className={`font-orbitron text-[10px] font-bold ${
              analysis.indicadores.ambos_alinhados ? 'text-neon-green' : 'text-muted-foreground'
            }`}>
              {analysis.indicadores.ambos_alinhados ? '✓ Indicadores Alinhados' : '✗ Indicadores Divergentes'}
            </span>
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis.resumo && (
        <div className="p-3 rounded-2xl bg-secondary/50 border border-border">
          <p className="font-orbitron text-[11px] text-muted-foreground leading-relaxed">{analysis.resumo}</p>
        </div>
      )}
    </div>
  );
}

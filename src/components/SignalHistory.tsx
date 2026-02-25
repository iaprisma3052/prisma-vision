import { useState, useEffect } from 'react';
import { automationService } from '@/services/automation.service';
import type { TradingAnalysis } from '@/services/tradingAnalysis.service';
import { formatTime } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, History } from 'lucide-react';
import PrismaLogo from '@/components/PrismaLogo';

interface HistoryEntry {
  timestamp: Date;
  ativo: string;
  direcao: string;
  intensidade: string;
  preco?: string;
}

export function SignalHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    automationService.onAnalysis((result: TradingAnalysis) => {
      setHistory(prev => [{
        timestamp: result.timestamp,
        ativo: result.ativo || '---',
        direcao: result.direcao,
        intensidade: result.intensidade,
        preco: result.preco,
      }, ...prev].slice(0, 50));
    });
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl border border-border bg-card p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-accent" />
          <span className="font-orbitron text-sm font-bold text-foreground">Histórico de Sinais</span>
        </div>
        <span className="font-orbitron text-[10px] text-muted-foreground">{history.length} sinais</span>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-accent" />
          <h3 className="font-orbitron text-sm font-bold text-foreground">Histórico de Sinais</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="font-orbitron text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Minimizar
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <PrismaLogo size={32} />
          <p className="mt-3 font-orbitron text-xs text-muted-foreground">Nenhum sinal gerado ainda</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {history.map((entry, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                entry.direcao === 'COMPRA' ? 'border-neon-green/20 bg-neon-green/5' :
                entry.direcao === 'VENDA' ? 'border-neon-red/20 bg-neon-red/5' :
                'border-border bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {entry.direcao === 'COMPRA' ? (
                  <ArrowUp className="w-4 h-4 text-neon-green" />
                ) : entry.direcao === 'VENDA' ? (
                  <ArrowDown className="w-4 h-4 text-neon-red" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <span className={`font-orbitron text-xs font-bold ${
                    entry.direcao === 'COMPRA' ? 'text-neon-green' :
                    entry.direcao === 'VENDA' ? 'text-neon-red' :
                    'text-foreground'
                  }`}>{entry.direcao}</span>
                  <span className="font-orbitron text-[10px] text-muted-foreground ml-2">{entry.intensidade}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-orbitron text-xs font-bold text-accent">{entry.ativo}</p>
                <p className="font-orbitron text-[10px] text-muted-foreground">{formatTime(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

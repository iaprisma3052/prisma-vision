import { useState, useEffect } from 'react';
import { automationService } from '@/services/automation.service';
import type { TradingAnalysis } from '@/services/tradingAnalysis.service';
import { formatTime } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, History, CheckCircle, XCircle } from 'lucide-react';
import PrismaLogo from '@/components/PrismaLogo';

interface HistoryEntry {
  id: string;
  timestamp: Date;
  ativo: string;
  direcao: string;
  intensidade: string;
  preco?: string | null;
  resultado?: 'win' | 'loss' | null;
}

export function SignalHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    automationService.onAnalysis((result: TradingAnalysis) => {
      setHistory(prev => [{
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: result.timestamp,
        ativo: result.ativo || '---',
        direcao: result.direcao,
        intensidade: result.intensidade,
        preco: result.preco,
        resultado: null,
      }, ...prev].slice(0, 50));
    });
  }, []);

  const markResult = (id: string, resultado: 'win' | 'loss') => {
    setHistory(prev => prev.map(entry =>
      entry.id === id ? { ...entry, resultado } : entry
    ));
  };

  const stats = {
    total: history.length,
    wins: history.filter(h => h.resultado === 'win').length,
    losses: history.filter(h => h.resultado === 'loss').length,
  };
  const winRate = stats.wins + stats.losses > 0
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
    : 0;

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
        <div className="flex items-center gap-3">
          {stats.wins + stats.losses > 0 && (
            <span className={`font-orbitron text-[10px] font-bold ${winRate >= 50 ? 'text-neon-green' : 'text-neon-red'}`}>
              {winRate}% Win
            </span>
          )}
          <span className="font-orbitron text-[10px] text-muted-foreground">{history.length} sinais</span>
        </div>
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

      {/* Stats */}
      {stats.wins + stats.losses > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-neon-green/10 border border-neon-green/20 text-center">
            <p className="font-orbitron text-lg font-bold text-neon-green">{stats.wins}</p>
            <p className="font-orbitron text-[9px] text-neon-green/70">WIN</p>
          </div>
          <div className="p-2 rounded-xl bg-neon-red/10 border border-neon-red/20 text-center">
            <p className="font-orbitron text-lg font-bold text-neon-red">{stats.losses}</p>
            <p className="font-orbitron text-[9px] text-neon-red/70">LOSS</p>
          </div>
          <div className={`p-2 rounded-xl border text-center ${winRate >= 50 ? 'bg-neon-green/5 border-neon-green/20' : 'bg-neon-red/5 border-neon-red/20'}`}>
            <p className={`font-orbitron text-lg font-bold ${winRate >= 50 ? 'text-neon-green' : 'text-neon-red'}`}>{winRate}%</p>
            <p className="font-orbitron text-[9px] text-muted-foreground">TAXA</p>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-8">
          <PrismaLogo size={32} />
          <p className="mt-3 font-orbitron text-xs text-muted-foreground">Nenhum sinal gerado ainda</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-xl border transition-all ${
                entry.resultado === 'win' ? 'border-neon-green/30 bg-neon-green/5' :
                entry.resultado === 'loss' ? 'border-neon-red/30 bg-neon-red/5' :
                entry.direcao === 'COMPRA' ? 'border-neon-green/20 bg-neon-green/5' :
                entry.direcao === 'VENDA' ? 'border-neon-red/20 bg-neon-red/5' :
                'border-border bg-secondary/30'
              }`}
            >
              <div className="flex items-center justify-between">
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
                  {entry.preco && <p className="font-orbitron text-[10px] text-foreground">{entry.preco}</p>}
                  <p className="font-orbitron text-[10px] text-muted-foreground">{formatTime(entry.timestamp)}</p>
                </div>
              </div>

              {/* WIN/LOSS Buttons */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                {entry.resultado ? (
                  <span className={`font-orbitron text-[10px] font-bold flex items-center gap-1 ${
                    entry.resultado === 'win' ? 'text-neon-green' : 'text-neon-red'
                  }`}>
                    {entry.resultado === 'win' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {entry.resultado === 'win' ? 'WIN' : 'LOSS'}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => markResult(entry.id, 'win')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green font-orbitron text-[10px] font-bold hover:bg-neon-green/20 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" /> WIN
                    </button>
                    <button
                      onClick={() => markResult(entry.id, 'loss')}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-neon-red/10 border border-neon-red/30 text-neon-red font-orbitron text-[10px] font-bold hover:bg-neon-red/20 transition-colors"
                    >
                      <XCircle className="w-3 h-3" /> LOSS
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

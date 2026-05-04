import { supabase } from "@/integrations/supabase/client";

export interface VolumeBar {
  tipo: 'compra' | 'venda';
  valor: number;
  tamanho: 'grande' | 'medio' | 'pequeno';
}

export interface ForceArrow {
  direcao: 'cima' | 'baixo';
  valor: number;
}

export interface IndicadoresDetectados {
  williams_r_valor: number;
  williams_r_direcao: 'cima' | 'baixo';
  momentum_valor: number;
  momentum_direcao: 'cima' | 'baixo';
  ambos_alinhados: boolean;
  tendencia_atual: 'ALTA' | 'BAIXA' | 'LATERAL';
  rsi?: number;
  macd?: 'ALTA' | 'BAIXA' | 'NEUTRO';
  bb?: 'SUPERIOR' | 'MEIO' | 'INFERIOR';
  ema20?: 'ACIMA' | 'ABAIXO' | 'CRUZANDO';
  stochastic?: number;
  adx?: number;
  atr?: number;
}

export interface TradingAnalysis {
  id?: string;
  ativo: string;
  preco: string | null;
  forca_compradora: number;
  forca_vendedora: number;
  direcao: 'COMPRA' | 'VENDA' | 'NEUTRO';
  intensidade: 'FORTE' | 'MODERADA' | 'FRACA';
  confianca?: number;
  volume_bars: VolumeBar[];
  setas: ForceArrow[];
  indicadores?: IndicadoresDetectados;
  padroes_detectados?: string[];
  condicao_ativo?: 'SAUDAVEL' | 'VOLATIL' | 'LATERAL' | 'FUROS';
  alerta_trocar_ativo?: boolean;
  motivo_alerta?: string;
  resumo: string;
  resultado?: 'win' | 'loss' | null;
  timestamp: Date;
}

const STORAGE_KEY = 'prisma_signal_history_v2';

class TradingAnalysisService {
  private lastAnalysis: TradingAnalysis | null = null;
  private analysisHistory: TradingAnalysis[] = [];
  private callbacks: Array<(result: TradingAnalysis) => void> = [];
  private historyChangeCallbacks: Array<(h: TradingAnalysis[]) => void> = [];
  private analyzing = false;

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.analysisHistory = parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) }));
      }
    } catch {}
  }

  private saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.analysisHistory.slice(0, 100)));
    } catch {}
    this.historyChangeCallbacks.forEach(cb => cb(this.getHistory()));
  }

  onAnalysis(callback: (result: TradingAnalysis) => void) {
    this.callbacks.push(callback);
  }

  onHistoryChange(callback: (h: TradingAnalysis[]) => void) {
    this.historyChangeCallbacks.push(callback);
    callback(this.getHistory());
  }

  isAnalyzing(): boolean {
    return this.analyzing;
  }

  private getHistoricoResumo() {
    // resumo compacto p/ enviar à IA: por ativo, resultados recentes
    const byAsset: Record<string, { wins: number; losses: number; total: number; recentes: string[] }> = {};
    for (const h of this.analysisHistory.slice(0, 30)) {
      const a = h.ativo || '---';
      if (!byAsset[a]) byAsset[a] = { wins: 0, losses: 0, total: 0, recentes: [] };
      byAsset[a].total++;
      if (h.resultado === 'win') byAsset[a].wins++;
      if (h.resultado === 'loss') byAsset[a].losses++;
      if (byAsset[a].recentes.length < 5) {
        byAsset[a].recentes.push(`${h.direcao}:${h.resultado || '?'}`);
      }
    }
    return byAsset;
  }

  async analyze(imageBase64: string): Promise<TradingAnalysis> {
    this.analyzing = true;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-trading', {
        body: { imageBase64, historico: this.getHistoricoResumo() }
      });

      if (error) throw new Error(error.message || 'Erro na análise');
      if (data?.error) throw new Error(data.error);

      const analysis: TradingAnalysis = {
        ...data.data,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        resultado: null,
        timestamp: new Date(),
      };

      this.lastAnalysis = analysis;
      this.analysisHistory.unshift(analysis);
      if (this.analysisHistory.length > 100) this.analysisHistory.pop();
      this.saveHistory();

      this.callbacks.forEach(cb => cb(analysis));

      return analysis;
    } catch (error: any) {
      console.error('Erro na análise de trading:', error);
      throw error;
    } finally {
      this.analyzing = false;
    }
  }

  markResult(id: string, resultado: 'win' | 'loss') {
    const item = this.analysisHistory.find(h => h.id === id);
    if (item) {
      item.resultado = resultado;
      this.saveHistory();
    }
  }

  getAccuracyByAsset(ativo: string): { wins: number; losses: number; rate: number } {
    const items = this.analysisHistory.filter(h => h.ativo === ativo && (h.resultado === 'win' || h.resultado === 'loss'));
    const wins = items.filter(h => h.resultado === 'win').length;
    const losses = items.length - wins;
    const rate = items.length > 0 ? Math.round((wins / items.length) * 100) : 0;
    return { wins, losses, rate };
  }

  getLastAnalysis(): TradingAnalysis | null {
    return this.lastAnalysis;
  }

  getHistory(): TradingAnalysis[] {
    return [...this.analysisHistory];
  }

  clearHistory() {
    this.analysisHistory = [];
    this.lastAnalysis = null;
    this.saveHistory();
  }
}

export const tradingAnalysisService = new TradingAnalysisService();

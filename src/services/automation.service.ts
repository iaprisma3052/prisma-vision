import { screenCaptureService } from './screenCapture.service';
import { tradingAnalysisService, type TradingAnalysis } from './tradingAnalysis.service';
import { speechService } from './speech.service';

export interface AutomationConfig {
  enabled: boolean;
  intervalSeconds: number;
  voiceEnabled: boolean;
}

class AutomationService {
  private config: AutomationConfig = {
    enabled: false,
    intervalSeconds: 15,
    voiceEnabled: true,
  };

  private candleCheckId: ReturnType<typeof setInterval> | null = null;
  private onAnalysisCallback: ((result: TradingAnalysis) => void) | null = null;
  private lastCandleMinute: number = -1;

  configure(config: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AutomationConfig {
    return { ...this.config };
  }

  onAnalysis(callback: (result: TradingAnalysis) => void) {
    this.onAnalysisCallback = callback;
    tradingAnalysisService.onAnalysis(callback);
  }

  async start(): Promise<void> {
    if (this.config.enabled) {
      console.log('⚠️ Automação já está em execução');
      return;
    }

    if (!screenCaptureService.isCapturing()) {
      throw new Error('Captura de tela não foi iniciada. Inicie a captura primeiro.');
    }

    this.config.enabled = true;
    this.lastCandleMinute = -1;
    console.log('🤖 PRISMA IA ativada - Sinais entre 58-59s da vela de 1m (Horário de Brasília)');

    this.candleCheckId = setInterval(() => {
      this.checkCandleOpening();
    }, 500);

    if (this.config.voiceEnabled) {
      speechService.speakQuick('PRISMA IA ativada. Análise será feita entre 58 e 59 segundos de cada vela.');
    }
  }

  private checkCandleOpening() {
    if (!this.config.enabled) return;

    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const currentMinute = brasiliaTime.getMinutes();
    const currentSecond = brasiliaTime.getSeconds();

    if (currentSecond >= 58 && currentSecond <= 59 && currentMinute !== this.lastCandleMinute) {
      this.lastCandleMinute = currentMinute;
      console.log(`🕯️ Análise pré-vela (${currentSecond}s): ${brasiliaTime.toLocaleTimeString('pt-BR')}`);
      this.performAnalysis();
    }
  }

  private async performAnalysis() {
    if (tradingAnalysisService.isAnalyzing()) return;

    try {
      const frame = screenCaptureService.captureFrame();
      const analysis = await tradingAnalysisService.analyze(frame);

      if (this.config.voiceEnabled && analysis.intensidade === 'FORTE') {
        speechService.playAlert();
        speechService.speakQuick(
          `Sinal ${analysis.direcao === 'COMPRA' ? 'de compra' : 'de venda'} forte detectado. ${analysis.resumo}`
        );
      } else if (this.config.voiceEnabled && analysis.direcao !== 'NEUTRO') {
        speechService.speakQuick(
          `Sinal ${analysis.direcao === 'COMPRA' ? 'de compra' : 'de venda'} ${analysis.intensidade.toLowerCase()}.`
        );
      }

      console.log('✅ Análise na abertura da vela:', {
        direcao: analysis.direcao,
        intensidade: analysis.intensidade,
        forca_compradora: analysis.forca_compradora,
        forca_vendedora: analysis.forca_vendedora,
      });
    } catch (error: any) {
      console.error('❌ Falha na análise:', error);
    }
  }

  stop() {
    if (this.candleCheckId) {
      clearInterval(this.candleCheckId);
      this.candleCheckId = null;
    }

    this.config.enabled = false;
    this.lastCandleMinute = -1;
    console.log('🛑 PRISMA IA desativada');
    if (this.config.voiceEnabled) {
      speechService.speakQuick('PRISMA IA desativada');
    }
  }

  isRunning(): boolean {
    return this.config.enabled;
  }

  getLastAnalysis(): TradingAnalysis | null {
    return tradingAnalysisService.getLastAnalysis();
  }

  getHistory(): TradingAnalysis[] {
    return tradingAnalysisService.getHistory();
  }

  async analyzeNow(): Promise<TradingAnalysis> {
    const frame = screenCaptureService.captureFrame();
    return tradingAnalysisService.analyze(frame);
  }
}

export const automationService = new AutomationService();

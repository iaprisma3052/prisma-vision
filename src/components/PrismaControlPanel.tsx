import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { screenCaptureService } from '@/services/screenCapture.service';
import { automationService } from '@/services/automation.service';
import { speechService } from '@/services/speech.service';
import { getSecondsUntilNextCandle, formatTime } from '@/lib/utils';
import { Play, Square, Camera, Settings, Mic, MicOff, Clock, Zap } from 'lucide-react';

export function PrismaControlPanel() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [brasiliaTime, setBrasiliaTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getSecondsUntilNextCandle());
      setBrasiliaTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartCapture = async () => {
    try {
      await screenCaptureService.startCapture();
      setIsCapturing(true);
      setError('');
    } catch (err: any) {
      setError(`Erro na captura: ${err.message}`);
    }
  };

  const handleStopCapture = () => {
    screenCaptureService.stopCapture();
    setIsCapturing(false);
    if (isRunning) {
      handleStopAutomation();
    }
  };

  const handleStartAutomation = async () => {
    if (!isCapturing) {
      setError('Inicie a captura de tela primeiro');
      return;
    }

    try {
      automationService.configure({
        voiceEnabled: voiceEnabled,
        intervalSeconds: 15,
      });

      await automationService.start();
      setIsRunning(true);
      setError('');
    } catch (err: any) {
      setError(`Erro ao iniciar: ${err.message}`);
    }
  };

  const handleStopAutomation = () => {
    automationService.stop();
    setIsRunning(false);
  };

  const handleManualAnalysis = async () => {
    if (!isCapturing) {
      setError('Inicie a captura de tela primeiro');
      return;
    }

    try {
      await automationService.analyzeNow();
      setError('');
    } catch (err: any) {
      setError(`Erro na análise: ${err.message}`);
    }
  };

  useEffect(() => {
    speechService.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-accent" />
        <h3 className="font-orbitron text-sm font-bold tracking-wider text-foreground">Painel de Controle</h3>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">Configure e controle os sinais de trading</p>

      {/* Brasilia Time */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <span className="font-mono text-xs text-foreground">Brasília</span>
        </div>
        <span className="font-mono text-xs font-bold text-accent">{brasiliaTime}</span>
      </div>

      {/* Countdown */}
      {isRunning && (
        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">Próxima vela em</span>
            <span className="font-mono text-lg font-bold text-accent">{countdown}s</span>
          </div>
          <div className="mt-2 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-1000"
              style={{ width: `${((60 - countdown) / 60) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Voice */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {voiceEnabled ? <Mic className="w-4 h-4 text-accent" /> : <MicOff className="w-4 h-4 text-muted-foreground" />}
          <Label htmlFor="voice" className="font-mono text-xs">Alertas de Voz</Label>
        </div>
        <Switch
          id="voice"
          checked={voiceEnabled}
          onCheckedChange={setVoiceEnabled}
        />
      </div>

      {/* Capture Controls */}
      <div className="space-y-2">
        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Captura de Tela</Label>
        <div className="flex gap-2">
          <Button
            onClick={handleStartCapture}
            disabled={isCapturing}
            className={`flex-1 rounded-xl font-orbitron text-xs ${isCapturing ? '' : 'bg-primary glow-purple'}`}
            variant={isCapturing ? "secondary" : "default"}
          >
            <Camera className="w-4 h-4 mr-1" />
            {isCapturing ? 'Capturando...' : 'Iniciar Captura'}
          </Button>
          {isCapturing && (
            <Button
              onClick={handleStopCapture}
              variant="destructive"
              className="flex-1 rounded-xl font-orbitron text-xs"
            >
              <Square className="w-4 h-4 mr-1" />
              Parar
            </Button>
          )}
        </div>
      </div>

      {/* Automation Controls */}
      <div className="space-y-2">
        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Sinal no Fechamento da Vela (58-59s)</Label>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStartAutomation}
              disabled={!isCapturing}
              className="flex-1 rounded-xl font-orbitron text-xs bg-neon-green text-background hover:bg-neon-green/90 glow-green"
            >
              <Play className="w-4 h-4 mr-1" />
              Ativar PRISMA IA
            </Button>
          ) : (
            <Button
              onClick={handleStopAutomation}
              variant="destructive"
              className="flex-1 rounded-xl font-orbitron text-xs"
            >
              <Square className="w-4 h-4 mr-1" />
              Desativar
            </Button>
          )}
          <Button
            onClick={handleManualAnalysis}
            disabled={!isCapturing}
            variant="outline"
            className="rounded-xl font-mono text-xs"
          >
            <Zap className="w-4 h-4 mr-1" />
            Analisar Agora
          </Button>
        </div>
      </div>

      {/* Status */}
      {isRunning && (
        <div className="p-3 rounded-xl border border-neon-green/30 bg-neon-green/5">
          <p className="text-neon-green font-mono text-xs">
            🤖 PRISMA IA ativa — Sinal gerado entre 58-59s de cada vela de 1 minuto
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5">
          <p className="text-destructive font-mono text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}

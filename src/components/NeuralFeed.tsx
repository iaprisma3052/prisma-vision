import { useState, useEffect } from "react";

interface NeuralFeedProps {
  lines?: number;
}

const prefixes = [
  "NEURAL",
  "ANÁLISE",
  "SCAN",
  "DADOS",
  "MERCADO",
  "SINAL",
  "PADRÃO",
  "REDE",
  "TENSOR",
  "FLUXO",
];

const messages = [
  "Processando vetores de momentum...",
  "Análise de volume concluída",
  "Padrão de reversão detectado em BTC/USDT",
  "Calibrando modelo de redes neurais...",
  "Sincronizando dados de ordem de livro...",
  "Verificando confluência de sinais...",
  "Escaneando divergência RSI em 47 pares...",
  "Processando dados de sentimento social...",
  "Atualizando pesos do modelo LSTM...",
  "Calculando correlação entre ativos...",
  "Verificando nível de suporte em $67,450...",
  "Modelo de previsão recalibrado",
  "Analisando fluxo institucional...",
  "Mapeando zonas de liquidez...",
];

const NeuralFeed = ({ lines = 6 }: NeuralFeedProps) => {
  const [feed, setFeed] = useState<string[]>([]);

  useEffect(() => {
    // Initial lines
    const initial = Array.from({ length: lines }, () => generateLine());
    setFeed(initial);

    const interval = setInterval(() => {
      setFeed((prev) => [...prev.slice(1), generateLine()]);
    }, 2500);

    return () => clearInterval(interval);
  }, [lines]);

  function generateLine() {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `[${time}] ${prefix} :: ${msg}`;
  }

  return (
    <div className="space-y-1 overflow-hidden">
      {feed.map((line, i) => (
        <p
          key={`${i}-${line}`}
          className={`font-mono text-[11px] leading-relaxed transition-opacity duration-500 ${
            i === feed.length - 1
              ? "text-neon-green opacity-100"
              : "text-muted-foreground opacity-60"
          }`}
        >
          {line}
        </p>
      ))}
    </div>
  );
};

export default NeuralFeed;

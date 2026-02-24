import { useState, useEffect } from "react";

interface MarketTickerProps {
  pair: string;
  price: number;
  change: number;
}

const MarketTicker = ({ pair, price, change }: MarketTickerProps) => {
  const isPositive = change >= 0;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-2">
      <span className="font-mono text-xs font-medium text-foreground">{pair}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-foreground">
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span
          className={`font-mono text-xs font-semibold ${
            isPositive ? "text-neon-green" : "text-neon-red"
          }`}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

interface MarketTickersProps {
  tickers: MarketTickerProps[];
}

const MarketTickers = ({ tickers }: MarketTickersProps) => {
  return (
    <div className="space-y-1.5">
      {tickers.map((t) => (
        <MarketTicker key={t.pair} {...t} />
      ))}
    </div>
  );
};

export default MarketTickers;

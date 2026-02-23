import { useState, useEffect } from "react";

const SystemClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <span className="font-mono text-lg tracking-widest text-foreground">
      {formatted}
    </span>
  );
};

export default SystemClock;

interface PowerBarProps {
  label: string;
  value: number;
  type: "bull" | "bear";
  segments?: number;
}

const PowerBar = ({ label, value, type, segments = 20 }: PowerBarProps) => {
  const filledSegments = Math.round((value / 100) * segments);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-orbitron text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </span>
        <span
          className={`font-orbitron text-sm font-bold ${
            type === "bull" ? "text-neon-green" : "text-neon-red"
          }`}
        >
          {value}%
        </span>
      </div>
      <div className="flex gap-[2px]">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-3 flex-1 rounded-full transition-all duration-300 ${
              i < filledSegments
                ? type === "bull"
                  ? "bg-neon-green shadow-[0_0_6px_hsl(160_100%_50%/0.4)]"
                  : "bg-neon-red shadow-[0_0_6px_hsl(4_100%_59%/0.4)]"
                : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PowerBar;

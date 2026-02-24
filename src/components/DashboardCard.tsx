import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const DashboardCard = ({ title, children, className = "" }: DashboardCardProps) => {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-4 ${className}`}
    >
      <h3 className="mb-3 font-orbitron text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default DashboardCard;

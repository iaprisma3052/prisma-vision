import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const DashboardCard = ({ title, children, className = "" }: DashboardCardProps) => {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 ${className}`}
    >
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default DashboardCard;

"use client";

import { ReactNode } from "react";
import { AnimatedCounter } from "@/components/motion";

export interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  description?: string;
  color?: "gold" | "rose-gold" | "charcoal" | "emerald" | string;
  trend?: string | number;
}

export function StatCard({ title, value, icon: Icon, description, color }: StatCardProps) {
  const textColor =
    color === "rose-gold"
      ? "text-rose-gold"
      : color === "emerald"
      ? "text-emerald-700"
      : color === "gold"
      ? "text-gold-deep"
      : "text-charcoal";

  return (
    <div className="bg-white border border-border-gray rounded-xl p-4 shadow-soft hover:shadow-card transition-all duration-300">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">{title}</p>
        {Icon && <Icon size={18} className={`${textColor} opacity-80`} />}
      </div>

      <div className={`text-2xl font-bold font-serif mt-2 ${textColor}`}>
        {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
      </div>

      {description && <p className="text-xs text-charcoal/55 mt-1">{description}</p>}
    </div>
  );
}

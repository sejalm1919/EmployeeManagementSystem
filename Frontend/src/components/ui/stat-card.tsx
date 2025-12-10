import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './glass-card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  gradient = false,
}) => {
  return (
    <GlassCard hover className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          {trend && (
            <p
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-success' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${
            gradient ? 'gradient-accent' : 'bg-primary/10'
          }`}
        >
          <Icon className={gradient ? 'text-white' : 'text-primary'} size={24} />
        </div>
      </div>
    </GlassCard>
  );
};

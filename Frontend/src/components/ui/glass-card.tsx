import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  hover = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'glass-card smooth-transition',
        hover && 'hover:shadow-strong hover:scale-[1.02]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

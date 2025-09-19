import React from 'react';
import { cn } from '../../utils/cn';

export interface ActionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  subtitle?: string;
  gradientFrom: string;
  gradientTo: string;
  icon?: React.ReactNode;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  icon,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        'w-full text-left rounded-xl p-6 h-auto transition-all duration-200',
        'shadow-md hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2',
        `bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white`,
        className,
      )}
      {...props}
    >
      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-base mb-1">{title}</h4>
      {subtitle ? (
        <p className="text-white/80 text-sm opacity-90">{subtitle}</p>
      ) : null}
      {children}
    </button>
  );
};

export default ActionCard;

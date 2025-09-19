import React from 'react';
import { cn } from '../../utils/cn';

export interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  className,
}) => {
  return (
    <div className={cn(
      'bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5',
      'transition-shadow duration-150 hover:shadow-md',
      className,
    )}>
      <div className="flex items-start">
        {icon ? (
          <div className="mr-3 mt-1 flex-shrink-0">{icon}</div>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-600 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 leading-none">{value}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-gray-500 truncate">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;

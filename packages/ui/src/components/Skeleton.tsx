import React from 'react';
import { cn } from '../utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
  );
};

interface AnalyticsCardSkeletonProps {
  className?: string;
}

export const AnalyticsCardSkeleton: React.FC<AnalyticsCardSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4", className)}>
      <div className="flex items-center">
        <div className="w-6 h-6 bg-gray-200 rounded-lg mr-3 animate-pulse" />
        <div className="flex-1">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
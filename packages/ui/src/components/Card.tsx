import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4", className)}>
      {children}
    </div>
  );
};

export default Card;
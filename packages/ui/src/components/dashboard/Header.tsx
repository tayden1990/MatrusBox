import React from 'react';
import { Button } from '../Button';
import { cn } from '../../utils/cn';

export interface HeaderProps {
  userEmail: string;
  userName: string;
  hasUnread: boolean;
  onToggleNotifications: () => void;
  onLogout: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userEmail,
  userName,
  hasUnread,
  onToggleNotifications,
  onLogout,
  className,
}) => {
  return (
    <header className={cn('bg-white border-b border-gray-200 shadow-sm', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg" aria-label="Matrus Logo">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Matrus</h1>
              <p className="text-sm text-gray-500">AI Learning Platform</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="md"
              aria-label="Show notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onToggleNotifications}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" aria-label="Unread notifications"></span>
              )}
            </Button>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">Welcome, {userName}!</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline"
              size="md"
              className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

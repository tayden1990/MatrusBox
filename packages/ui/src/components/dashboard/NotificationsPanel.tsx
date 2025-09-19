import React from 'react';
import { Card } from '../Card';
import { Button } from '../Button';

export interface NotificationItem {
  id: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface NotificationsPanelProps {
  open: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ open, notifications, onClose }) => {
  if (!open) return null;
  return (
    <div className="absolute right-4 top-20 z-50 w-80 max-w-full">
      <Card className="p-0 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="font-semibold text-gray-900">Notifications</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClose} 
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
            aria-label="Close notifications"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-500 text-sm">No notifications yet</p>
              <p className="text-gray-400 text-xs mt-1">You'll see updates here when they arrive</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-medium">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsPanel;

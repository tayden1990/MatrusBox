'use client';

import React from 'react';
import { 
  Button, 
  Card, 
  LoadingSpinner, 
  AnalyticsCard, 
  ActionCard, 
  Header,
  NotificationsPanel,
  AnalyticsCardSkeleton 
} from '@matrus/ui';

export default function TestComponentsPage() {
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  const testNotifications = [
    { id: '1', message: 'Test notification 1', createdAt: new Date().toISOString(), read: false },
    { id: '2', message: 'Test notification 2', createdAt: new Date().toISOString(), read: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Component Test Page</h1>
      
      {/* Test Header */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Header Component</h2>
        <Header
          userEmail="test@example.com"
          userName="Test User"
          hasUnread={true}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          onLogout={() => console.log('Logout clicked')}
        />
      </section>

      {/* Test Notifications Panel */}
      {showNotifications && (
        <section className="mb-8 relative">
          <h2 className="text-xl font-semibold mb-4">Notifications Panel</h2>
          <NotificationsPanel
            open={showNotifications}
            notifications={testNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </section>
      )}

      {/* Test Analytics Cards */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Analytics Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Test Metric 1"
            value={42}
            subtitle="Some subtitle"
            icon={<div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">📊</div>}
          />
          <AnalyticsCard
            title="Test Metric 2"
            value="123 days"
            icon={<div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">⏰</div>}
          />
          <AnalyticsCardSkeleton />
          <AnalyticsCardSkeleton />
        </div>
      </section>

      {/* Test Action Cards */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Action Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            onClick={() => console.log('Create cards clicked')}
            title="Create Cards"
            subtitle="Add new flashcards"
            gradientFrom="from-blue-500"
            gradientTo="to-blue-600"
            icon={<span>➕</span>}
          />
          <ActionCard
            onClick={() => console.log('Study clicked')}
            title="Study Session"
            subtitle="Start learning now"
            gradientFrom="from-green-500"
            gradientTo="to-green-600"
            icon={<span>📚</span>}
          />
        </div>
      </section>

      {/* Test Basic Components */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Components</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
          
          <Card className="p-4">
            <h3 className="font-semibold">Test Card</h3>
            <p>This is a test card with some content.</p>
          </Card>
          
          <LoadingSpinner size="md" />
        </div>
      </section>
    </div>
  );
}
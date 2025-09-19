'use client';

import React from 'react';

// Test with basic imports first
export default function SimpleTestPage() {
  const [importError, setImportError] = React.useState<string | null>(null);
  const [components, setComponents] = React.useState<any>(null);

  React.useEffect(() => {
    async function testImports() {
      try {
        const uiModule = await import('@matrus/ui');
        console.log('Available UI components:', Object.keys(uiModule));
        setComponents(uiModule);
      } catch (error) {
        console.error('Import error:', error);
        setImportError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
    testImports();
  }, []);

  if (importError) {
    return (
      <div className="p-8">
        <h1 className="text-red-600 text-2xl font-bold">Import Error</h1>
        <pre className="bg-red-50 p-4 mt-4 text-red-800">{importError}</pre>
      </div>
    );
  }

  if (!components) {
    return (
      <div className="p-8">
        <h1>Loading components...</h1>
      </div>
    );
  }

  const { Button, Card, Header, AnalyticsCard, ActionCard } = components;

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Simple Component Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Components:</h2>
        <pre className="bg-gray-100 p-4 text-sm">
          {Object.keys(components).join(', ')}
        </pre>
      </div>

      {Button && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Button Test</h2>
          <Button onClick={() => alert('Button works!')}>
            Test Button
          </Button>
        </div>
      )}

      {Card && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Card Test</h2>
          <Card className="p-4 max-w-md">
            <h3 className="font-semibold">Test Card</h3>
            <p>This is a test card content.</p>
          </Card>
        </div>
      )}

      {AnalyticsCard && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">AnalyticsCard Test</h2>
          <div className="max-w-xs">
            <AnalyticsCard
              title="Test Metric"
              value={42}
              subtitle="Test subtitle"
            />
          </div>
        </div>
      )}

      {ActionCard && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">ActionCard Test</h2>
          <div className="max-w-xs">
            <ActionCard
              onClick={() => alert('Action card clicked!')}
              title="Test Action"
              subtitle="Click me"
              gradientFrom="from-blue-500"
              gradientTo="to-blue-600"
              icon={<span>🔥</span>}
            />
          </div>
        </div>
      )}

      {Header && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Header Test</h2>
          <Header
            userEmail="test@example.com"
            userName="Test User"
            hasUnread={false}
            onToggleNotifications={() => console.log('Toggle notifications')}
            onLogout={() => console.log('Logout')}
          />
        </div>
      )}
    </div>
  );
}
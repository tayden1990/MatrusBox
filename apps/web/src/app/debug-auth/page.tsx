'use client';

import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    // Check localStorage for auth tokens
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');

    setAuthState({
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      accessTokenLength: accessToken ? accessToken.length : 0,
      userInfo: user ? JSON.parse(user) : null,
      accessTokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : 'None'
    });
  }, []);

  const testCreateCard = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          front: 'Debug Test Card',
          back: 'Testing from debug page',
          explanation: 'Auth debug test',
          difficulty: 3
        })
      });

      const data = await response.json();
      
      setTestResult({
        status: response.status,
        success: response.ok,
        data: data,
        headers: {
          authorization: token ? `Bearer ${token.substring(0, 20)}...` : 'No token'
        }
      });
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const loginTest = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Refresh auth state
        window.location.reload();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-4">Authentication State</h2>
        <pre className="text-sm">
          {JSON.stringify(authState, null, 2)}
        </pre>
      </div>

      <div className="space-x-4 mb-6">
        <button 
          onClick={loginTest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login Test User
        </button>
        <button 
          onClick={testCreateCard}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Create Card
        </button>
      </div>

      {testResult && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Test Result</h2>
          <pre className="text-sm">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';

export default function FallbackDashboard() {
  const [user, setUser] = useState({ email: 'test@matrus.com', firstName: 'Test' });
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Basic HTML Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              M
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                Matrus
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                AI Learning Platform
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}>
              🔔
            </button>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                Welcome, {user.firstName || user.email.split('@')[0]}!
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {user.email}
              </p>
            </div>
            <button style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 1rem' }}>
        
        {/* Welcome Section */}
        <section style={{
          background: 'linear-gradient(to right, #eff6ff, #eef2ff)',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Welcome back, {user.firstName || user.email.split('@')[0]}! 👋
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
            Ready to continue your learning journey?
          </p>
        </section>

        {/* Analytics Section */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Your Progress
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  ✅
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                    Cards Mastered
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    42
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  📚
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                    Study Sessions
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    15
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  👥
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                    Total Users
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    1,234
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#fed7aa',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  ⏰
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                    Retention
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                    7 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>
            Quick Actions
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <button style={{
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.2s',
              fontSize: '16px'
            }}>
              <div style={{ marginBottom: '12px', fontSize: '24px' }}>➕</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Create Cards</h4>
              <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>Add new flashcards</p>
            </button>

            <button style={{
              background: 'linear-gradient(to right, #10b981, #059669)',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.2s',
              fontSize: '16px'
            }}>
              <div style={{ marginBottom: '12px', fontSize: '24px' }}>📚</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Study Session</h4>
              <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>Start learning now</p>
            </button>

            <button style={{
              background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.2s',
              fontSize: '16px'
            }}>
              <div style={{ marginBottom: '12px', fontSize: '24px' }}>🤖</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>AI Generate</h4>
              <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>Create with AI</p>
            </button>

            <button style={{
              background: 'linear-gradient(to right, #f59e0b, #d97706)',
              color: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'transform 0.2s',
              fontSize: '16px'
            }}>
              <div style={{ marginBottom: '12px', fontSize: '24px' }}>📊</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>Analytics</h4>
              <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>View progress</p>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
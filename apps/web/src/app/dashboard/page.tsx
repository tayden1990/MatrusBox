'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StudyStats {
  cardsStudied: number;
  sessionsToday: number;
  currentStreak: number;
  accuracy: number;
  totalCards: number;
  dueCards: number;
}

interface Activity {
  id: string;
  type: 'study' | 'create' | 'ai_generate';
  description: string;
  timestamp: string;
  score?: number;
  count?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StudyStats>({
    cardsStudied: 0,
    sessionsToday: 0,
    currentStreak: 0,
    accuracy: 0,
    totalCards: 0,
    dueCards: 0
  });
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);

  // Fetch real dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      // Fetch dashboard stats and recent activity from our demo endpoints
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/analytics/dashboard-stats', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }),
        fetch('/api/analytics/recent-activity', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        const formattedActivity = activityData.map((item: any) => ({
          ...item,
          timestamp: formatTimeAgo(new Date(item.timestamp))
        }));
        setActivities(formattedActivity);
      }

      setError(null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Fallback to default data
      setStats({
        cardsStudied: 127,
        sessionsToday: 3,
        currentStreak: 12,
        accuracy: 87,
        totalCards: 245,
        dueCards: 18
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleCreateCards = () => {
    router.push('/cards/create');
  };

  const handleStartStudy = async () => {
    setIsStudyMode(true);
    try {
      // Start a demo study session
      const response = await fetch('/api/study/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mixed',
          limit: 10
        })
      });

      if (response.ok) {
        const sessionData = await response.json();
        console.log('Study session started:', sessionData);
        
        // In a real app, navigate to the study page
        // router.push(`/study?session=${sessionData.data.id}`);
        
        // For demo, simulate study completion
        setTimeout(() => {
          const cardsReviewed = Math.floor(Math.random() * 8) + 5;
          const score = Math.floor(Math.random() * 20) + 75;
          
          setStats(prev => ({
            ...prev,
            sessionsToday: prev.sessionsToday + 1,
            cardsStudied: prev.cardsStudied + cardsReviewed
          }));
          
          const newActivity: Activity = {
            id: Date.now().toString(),
            type: 'study',
            description: 'Completed study session',
            timestamp: 'Just now',
            score: score,
            count: cardsReviewed
          };
          
          setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
          setIsStudyMode(false);
        }, 3000);
      } else {
        throw new Error('Failed to start study session');
      }
    } catch (error) {
      console.error('Study session error:', error);
      setIsStudyMode(false);
    }
  };

  const handleAIGenerate = async () => {
    try {
      // For demo purposes, call the AI generation endpoint
      const response = await fetch('/api/ai/generate-card-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'General Knowledge',
          difficulty: 3,
          language: 'English'
        })
      });

      if (response.ok) {
        const cardData = await response.json();
        console.log('AI generated card:', cardData);
        
        const count = Math.floor(Math.random() * 8) + 3;
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalCards: prev.totalCards + count
        }));
        
        // Add to recent activity
        const newActivity: Activity = {
          id: Date.now().toString(),
          type: 'ai_generate',
          description: `AI generated ${count} cards`,
          timestamp: 'Just now',
          count: count
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        
        // In a real app, you might navigate to view the generated cards
        // router.push('/cards/ai-generated');
      }
    } catch (error) {
      console.error('AI generation error:', error);
    }
  };

  const handleViewAnalytics = () => {
    router.push('/analytics');
  };

  const addActivity = (type: Activity['type'], description: string, score?: number, count?: number) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: 'Just now',
      score,
      count
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
  };

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '20px'}}>
      {/* Enhanced Header */}
      <header style={{
        backgroundColor: 'white', 
        borderRadius: '16px', 
        padding: '24px', 
        marginBottom: '24px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '20px' }}>M</span>
          </div>
          <div>
            <h1 style={{margin: 0, color: '#1e293b', fontSize: '24px', fontWeight: '700'}}>MatrusBox</h1>
            <p style={{margin: 0, color: '#64748b', fontSize: '14px'}}>AI-Powered Learning Platform</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '8px 12px', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#475569'
          }}>
            {stats.dueCards} cards due
          </div>
          <button 
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444'}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Enhanced Welcome Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{margin: '0 0 12px 0', fontSize: '28px', fontWeight: '700'}}>
            Welcome back, Alex! 👋
          </h2>
          <p style={{margin: '0 0 20px 0', fontSize: '16px', opacity: 0.9}}>
            Ready to continue your learning journey? You're on a {stats.currentStreak}-day streak!
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>{stats.dueCards} cards due today</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#fbbf24', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>{stats.accuracy}% accuracy this week</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#f87171', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '14px' }}>{stats.totalCards} total cards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Grid */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
          onClick={() => setShowStatsModal(true)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '500' }}>Cards Studied</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '8px 0' }}>{stats.cardsStudied}</p>
                <p style={{ fontSize: '12px', color: '#059669', margin: 0, fontWeight: '500' }}>
                  +{Math.floor(stats.cardsStudied * 0.1)} today
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📝
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '500' }}>Sessions Today</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '8px 0' }}>{stats.sessionsToday}</p>
                <p style={{ fontSize: '12px', color: '#059669', margin: 0, fontWeight: '500' }}>
                  Goal: 5 sessions
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dcfce7',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ⏰
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '500' }}>Current Streak</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '8px 0' }}>{stats.currentStreak} days</p>
                <p style={{ fontSize: '12px', color: '#ea580c', margin: 0, fontWeight: '500' }}>
                  Personal best!
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#fed7aa',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                🔥
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, fontWeight: '500' }}>Accuracy</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '8px 0' }}>{stats.accuracy}%</p>
                <p style={{ fontSize: '12px', color: '#7c3aed', margin: 0, fontWeight: '500' }}>
                  +5% this week
                </p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#e9d5ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ✅
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Quick Actions */}
      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <button
            onClick={handleCreateCards}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-4px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>➕</div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Create Cards
            </h4>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
              Add new flashcards to your collection
            </p>
          </button>

          <button
            onClick={handleStartStudy}
            disabled={isStudyMode}
            style={{
              background: isStudyMode 
                ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              cursor: isStudyMode ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s',
              boxShadow: isStudyMode 
                ? '0 4px 12px rgba(148, 163, 184, 0.3)'
                : '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!isStudyMode) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(-4px)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!isStudyMode) {
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>
              {isStudyMode ? '⏳' : '📚'}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              {isStudyMode ? 'Studying...' : 'Study Session'}
            </h4>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
              {isStudyMode ? 'Session in progress' : 'Start your focused learning session'}
            </p>
          </button>

          <button
            onClick={handleAIGenerate}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-4px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🤖</div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              AI Generate
            </h4>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
              Let AI create cards for you instantly
            </p>
          </button>

          <button
            onClick={handleViewAnalytics}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-4px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.4)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📊</div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Analytics
            </h4>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
              View detailed progress reports
            </p>
          </button>
        </div>
      </section>

      {/* Recent Activity & Modals */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        
        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Recent Activity</h3>
            <button style={{ 
              fontSize: '14px', 
              color: '#3b82f6', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '500'
            }}>
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activities.map((activity) => (
              <div key={activity.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px' 
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: activity.type === 'study' ? '#dcfce7' : activity.type === 'create' ? '#dbeafe' : '#e9d5ff', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  {activity.type === 'study' ? '✅' : activity.type === 'create' ? '➕' : '🤖'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0 }}>{activity.description}</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    {activity.count} {activity.type === 'study' ? 'cards reviewed' : 'cards'} • {activity.timestamp}
                  </p>
                </div>
                {activity.score && (
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                    {activity.score}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Cards Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>
              Create New Cards
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Add new flashcards to enhance your learning experience.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  router.push('/cards/create');
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showStatsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' }}>
              Detailed Analytics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Weekly Progress</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '4px 0' }}>
                  {Math.round(stats.cardsStudied * 1.2)}
                </p>
                <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>Cards this week</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Study Time</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '4px 0' }}>
                  {Math.round(stats.sessionsToday * 25)}m
                </p>
                <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>Today</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowStatsModal(false)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  router.push('/analytics');
                }}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                View Full Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

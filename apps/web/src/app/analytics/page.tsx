'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProgressData {
  totalCards: number;
  cardsLearned: number;
  cardsInProgress: number;
  successRate: number;
  timeSpent: number;
  streakDays: number;
  weeklyProgress: Array<{
    date: string;
    cardsStudied: number;
    successRate: number;
  }>;
}

interface ActivityData {
  dailyActivity: Array<{
    date: string;
    sessionsCount: number;
    timeSpent: number;
    cardsStudied: number;
  }>;
  averageSessionTime: number;
  mostActiveHour: number;
  totalSessions: number;
}

interface GlobalStats {
  totalUsers: number;
  totalCards: number;
  totalSessions: number;
  averageRetention: number;
}

interface RetentionData {
  currentStreak: number;
  longestStreak: number;
  studyFrequency: number;
  retentionRate: number;
  weeklyConsistency: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('progress');
  
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, you'd get the user ID from auth context
      const userId = 'current-user-id';

      const [progressRes, activityRes, globalRes, retentionRes] = await Promise.all([
        fetch(`/api/analytics/progress?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'demo-token'}`
          }
        }),
        fetch(`/api/analytics/activity?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'demo-token'}`
          }
        }),
        fetch('/api/analytics/global-stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'demo-token'}`
          }
        }),
        fetch(`/api/analytics/retention?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'demo-token'}`
          }
        })
      ]);

      if (!progressRes.ok || !activityRes.ok || !globalRes.ok || !retentionRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [progress, activity, global, retention] = await Promise.all([
        progressRes.json(),
        activityRes.json(),
        globalRes.json(),
        retentionRes.json()
      ]);

      setProgressData(progress.data);
      setActivityData(activity.data);
      setGlobalStats(global.data);
      setRetentionData(retention.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data. Please try again later.');
      
      // Set all data to null/empty to show proper empty states
      setProgressData(null);
      setActivityData(null);
      setGlobalStats(null);
      setRetentionData(null);
    } finally {
      setLoading(false);
    }
  };

  // Add defensive programming - ensure data exists before rendering
  const safeProgressData = {
    totalCards: progressData?.totalCards || 0,
    cardsLearned: progressData?.cardsLearned || 0,
    cardsInProgress: progressData?.cardsInProgress || 0,
    successRate: progressData?.successRate || 0,
    timeSpent: progressData?.timeSpent || 0,
    streakDays: progressData?.streakDays || 0,
    weeklyProgress: progressData?.weeklyProgress || []
  };

  const safeActivityData = {
    dailyActivity: activityData?.dailyActivity || [],
    averageSessionTime: activityData?.averageSessionTime || 0,
    mostActiveHour: activityData?.mostActiveHour || 0,
    totalSessions: activityData?.totalSessions || 0
  };

  const safeGlobalStats = {
    totalUsers: globalStats?.totalUsers || 0,
    totalCards: globalStats?.totalCards || 0,
    totalSessions: globalStats?.totalSessions || 0,
    averageRetention: globalStats?.averageRetention || 0
  };

  const safeRetentionData = {
    currentStreak: retentionData?.currentStreak || 0,
    longestStreak: retentionData?.longestStreak || 0,
    studyFrequency: retentionData?.studyFrequency || 0,
    retentionRate: retentionData?.retentionRate || 0,
    weeklyConsistency: retentionData?.weeklyConsistency || 0
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center' as const
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ margin: 0, color: '#666' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{
            margin: 0,
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            📊 Analytics Dashboard
          </h1>
          <p style={{
            margin: '0.5rem 0 0',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem'
          }}>
            Track your learning progress and performance
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.9)',
          color: '#856404',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center' as const
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap' as const
      }}>
        {[
          { id: 'progress', label: '📈 Progress', icon: '📈' },
          { id: 'activity', label: '⚡ Activity', icon: '⚡' },
          { id: 'retention', label: '🔥 Retention', icon: '🔥' },
          { id: 'global', label: '🌍 Global Stats', icon: '🌍' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === tab.id ? '#667eea' : 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        {activeTab === 'progress' && progressData && (
          <div>
            <h2 style={{ margin: '0 0 2rem', color: '#333', fontSize: '1.8rem' }}>
              📈 Learning Progress
            </h2>
            
            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeProgressData.totalCards}</div>
                <div style={{ opacity: 0.9 }}>Total Cards</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeProgressData.cardsLearned}</div>
                <div style={{ opacity: 0.9 }}>Cards Learned</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                color: '#333',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeProgressData.cardsInProgress}</div>
                <div style={{ opacity: 0.8 }}>In Progress</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                color: '#333',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeProgressData.successRate}%</div>
                <div style={{ opacity: 0.8 }}>Success Rate</div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ margin: '0 0 1rem', color: '#333' }}>📊 Weekly Progress</h3>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                height: '200px',
                gap: '0.5rem'
              }}>
                {safeProgressData.weeklyProgress.map((day, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      background: 'linear-gradient(to top, #667eea, #764ba2)',
                      width: '100%',
                      height: `${(day.cardsStudied / 25) * 150}px`,
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '0.5rem',
                      minHeight: '10px'
                    }}></div>
                    <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' as const }}>
                      <div style={{ fontWeight: 'bold' }}>{day.cardsStudied}</div>
                      <div>{formatDate(day.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px'
              }}>
                <h4 style={{ margin: '0 0 1rem', color: '#333' }}>⏱️ Time Invested</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                  {formatTime(safeProgressData.timeSpent)}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Total study time</div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                padding: '1.5rem',
                borderRadius: '12px'
              }}>
                <h4 style={{ margin: '0 0 1rem', color: '#333' }}>🔥 Current Streak</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                  {safeProgressData.streakDays} days
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Keep it going!</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 style={{ margin: '0 0 2rem', color: '#333', fontSize: '1.8rem' }}>
              ⚡ Activity Overview
            </h2>
            
            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeActivityData.totalSessions}</div>
                <div style={{ opacity: 0.9 }}>Total Sessions</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeActivityData.averageSessionTime}m</div>
                <div style={{ opacity: 0.9 }}>Avg Session</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                color: '#333',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🕰️</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeActivityData.mostActiveHour}:00</div>
                <div style={{ opacity: 0.8 }}>Peak Hour</div>
              </div>
            </div>

            {/* Daily Activity Chart */}
            <div style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '12px'
            }}>
              <h3 style={{ margin: '0 0 1rem', color: '#333' }}>📈 Daily Activity</h3>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'end',
                height: '200px',
                gap: '0.5rem'
              }}>
                {safeActivityData.dailyActivity.map((day, index) => (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      background: 'linear-gradient(to top, #11998e, #38ef7d)',
                      width: '100%',
                      height: `${(day.timeSpent / 75) * 150}px`,
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '0.5rem',
                      minHeight: '10px'
                    }}></div>
                    <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center' as const }}>
                      <div style={{ fontWeight: 'bold' }}>{day.timeSpent}m</div>
                      <div>{formatDate(day.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retention' && (
          <div>
            <h2 style={{ margin: '0 0 2rem', color: '#333', fontSize: '1.8rem' }}>
              🔥 Retention & Consistency
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔥</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{safeRetentionData.currentStreak}</div>
                <div style={{ opacity: 0.9, fontSize: '1.1rem' }}>Current Streak</div>
                <div style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Longest: {safeRetentionData.longestStreak} days
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{safeRetentionData.retentionRate}%</div>
                <div style={{ opacity: 0.9, fontSize: '1.1rem' }}>Retention Rate</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                color: '#333',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{safeRetentionData.studyFrequency}</div>
                <div style={{ opacity: 0.8, fontSize: '1.1rem' }}>Days/Week</div>
                <div style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Study Frequency
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                color: '#333',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{safeRetentionData.weeklyConsistency}%</div>
                <div style={{ opacity: 0.8, fontSize: '1.1rem' }}>Consistency</div>
                <div style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Weekly Average
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'global' && (
          <div>
            <h2 style={{ margin: '0 0 2rem', color: '#333', fontSize: '1.8rem' }}>
              🌍 Global Platform Statistics
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {safeGlobalStats.totalUsers.toLocaleString()}
                </div>
                <div style={{ opacity: 0.9, fontSize: '1.1rem' }}>Active Users</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {safeGlobalStats.totalCards.toLocaleString()}
                </div>
                <div style={{ opacity: 0.9, fontSize: '1.1rem' }}>Total Cards</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
                color: '#333',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                  {safeGlobalStats.totalSessions.toLocaleString()}
                </div>
                <div style={{ opacity: 0.8, fontSize: '1.1rem' }}>Study Sessions</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
                color: '#333',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center' as const
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{safeGlobalStats.averageRetention}%</div>
                <div style={{ opacity: 0.8, fontSize: '1.1rem' }}>Avg Retention</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
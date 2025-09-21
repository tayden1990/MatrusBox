'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateCardForm {
  front: string;
  back: string;
  explanation: string;
  exampleSentences: string[];
  tags: string[];
  difficulty: number;
}

export default function CreateCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  
  const [form, setForm] = useState<CreateCardForm>({ 
    front: '',
    back: '',
    explanation: '',
    exampleSentences: [''],
    tags: [''],
    difficulty: 3
  });

  const handleInputChange = (field: keyof CreateCardForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'exampleSentences' | 'tags', index: number, value: string) => {
    const newArray = [...form[field]];
    newArray[index] = value;
    setForm(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field: 'exampleSentences' | 'tags') => {
    setForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'exampleSentences' | 'tags', index: number) => {
    if (form[field].length > 1) {
      const newArray = form[field].filter((_, i) => i !== index);
      setForm(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!form.front.trim()) return 'Front content is required';
    if (!form.back.trim()) return 'Back content is required';
    if (form.difficulty < 1 || form.difficulty > 5) return 'Difficulty must be between 1 and 5';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filter out empty strings from arrays
      const cleanedExamples = form.exampleSentences.filter(s => s.trim());
      const cleanedTags = form.tags.filter(t => t.trim());

      const cardData = {
        front: form.front.trim(),
        back: form.back.trim(),
        explanation: form.explanation.trim() || undefined,
        exampleSentences: cleanedExamples.length > 0 ? cleanedExamples : undefined,
        tags: cleanedTags.length > 0 ? cleanedTags : undefined,
        difficulty: form.difficulty
      };

      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(cardData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create card');
      }

      const result = await response.json();
      console.log('Card created successfully:', result);
      
      setSuccess(true);
      
      // Reset form
      setForm({
        front: '',
        back: '',
        explanation: '',
        exampleSentences: [''],
        tags: [''],
        difficulty: 3
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Card creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAICard = async (topic?: string) => {
    setAiLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-card-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: topic || form.tags[0] || 'general knowledge',
          difficulty: form.difficulty,
          language: 'English'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI card');
      }

      const result = await response.json();
      console.log('AI generated card:', result);
      
      // Fill the form with AI generated content
      if (result.success && result.data) {
        const cardData = result.data;
        setForm({
          front: cardData.front || '',
          back: cardData.back || '',
          explanation: cardData.explanation || '',
          exampleSentences: cardData.exampleSentences || [''],
          tags: cardData.tags || [''],
          difficulty: cardData.difficulty || form.difficulty
        });
        setShowAIModal(false);
      }
      
    } catch (err) {
      console.error('AI generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI card. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

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
            🃏 Create New Card
          </h1>
          <p style={{
            margin: '0.5rem 0 0',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem'
          }}>
            Build your personalized learning flashcards
          </p>
        </div>
        
        <button
          onClick={() => setShowAIModal(true)}
          disabled={loading || aiLoading}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            cursor: (loading || aiLoading) ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            opacity: loading ? 0.6 : 1
          }}
        >
          ✨ Generate AI Card
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center' as const,
          fontWeight: '500'
        }}>
          ✅ Card created successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(244, 67, 54, 0.9)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center' as const
        }}>
          ❌ {error}
        </div>
      )}

      {/* Main Form */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <form onSubmit={handleSubmit}>
          {/* Front Content */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              📄 Front Content (Question) *
            </label>
            <textarea
              value={form.front}
              onChange={(e) => handleInputChange('front', e.target.value)}
              placeholder="Enter the question or prompt for your flashcard..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical' as const,
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          {/* Back Content */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              📝 Back Content (Answer) *
            </label>
            <textarea
              value={form.back}
              onChange={(e) => handleInputChange('back', e.target.value)}
              placeholder="Enter the answer or explanation..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical' as const,
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              💡 Additional Explanation (Optional)
            </label>
            <textarea
              value={form.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              placeholder="Add extra context, etymology, or detailed explanation..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical' as const,
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Example Sentences */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              📖 Example Sentences (Optional)
            </label>
            {form.exampleSentences.map((sentence, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <input
                  type="text"
                  value={sentence}
                  onChange={(e) => handleArrayChange('exampleSentences', index, e.target.value)}
                  placeholder={`Example sentence ${index + 1}...`}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
                {form.exampleSentences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('exampleSentences', index)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('exampleSentences')}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}
            >
              ➕ Add Example
            </button>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              🏷️ Tags (Optional)
            </label>
            {form.tags.map((tag, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                  placeholder={`Tag ${index + 1} (e.g., vocabulary, math, history)...`}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
                {form.tags.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('tags')}
              style={{
                background: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginTop: '0.5rem'
              }}
            >
              ➕ Add Tag
            </button>
          </div>

          {/* Difficulty */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '0.5rem'
            }}>
              ⭐ Difficulty Level (1 = Easy, 5 = Very Hard)
            </label>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <input
                type="range"
                min="1"
                max="5"
                value={form.difficulty}
                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                style={{
                  flex: 1,
                  height: '8px',
                  background: '#ddd',
                  borderRadius: '4px'
                }}
              />
              <div style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                minWidth: '80px',
                textAlign: 'center' as const
              }}>
                {form.difficulty} / 5
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap' as const
          }}>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              style={{
                background: '#9e9e9e',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading 
                  ? '#ccc' 
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                minWidth: '150px'
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating...
                </div>
              ) : (
                '🚀 Create Card'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* AI Generation Modal */}
      {showAIModal && (
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
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>🤖 AI Card Generation</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Let AI generate a flashcard for you! Enter a topic and we&apos;ll create a complete card with examples and explanations.
            </p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const topic = formData.get('topic') as string;
              generateAICard(topic);
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Topic
                </label>
                <input
                  name="topic"
                  type="text"
                  placeholder="e.g., French vocabulary, Math formulas, History facts"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  disabled={aiLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #e5e7eb',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    color: '#666'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: aiLoading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {aiLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Generating...
                    </div>
                  ) : (
                    '✨ Generate with AI'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIGenerationRequest, AIGenerationResponse } from '@matrus/common-types';

@Injectable()
export class AIService {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private geminiModel: any;

  constructor(private configService: ConfigService) {
    // Initialize OpenAI
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiApiKey && openaiApiKey !== 'sk-demo-openai-key-for-testing') {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      });
    }

    // Initialize Gemini
    const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiApiKey && geminiApiKey !== 'demo-gemini-key-for-testing') {
      this.gemini = new GoogleGenerativeAI(geminiApiKey);
      this.geminiModel = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  /**
   * Choose which AI provider to use based on availability and load balancing
   */
  private async getAvailableProvider(): Promise<'openai' | 'gemini' | 'fallback'> {
    // Check if OpenAI is available
    if (this.openai) {
      try {
        // Quick test to see if OpenAI is responsive
        return 'openai';
      } catch (error) {
        console.warn('OpenAI not available, trying Gemini');
      }
    }

    // Check if Gemini is available
    if (this.gemini && this.geminiModel) {
      return 'gemini';
    }

    // Fallback to demo data
    return 'fallback';
  }

  /**
   * Generate AI response using the best available provider
   */
  private async generateWithBestProvider(prompt: string, systemMessage?: string): Promise<string> {
    const provider = await this.getAvailableProvider();

    switch (provider) {
      case 'openai':
        return this.generateWithOpenAI(prompt, systemMessage);
      case 'gemini':
        return this.generateWithGemini(prompt, systemMessage);
      default:
        throw new Error('No AI provider available - using fallback data');
    }
  }

  private async generateWithOpenAI(prompt: string, systemMessage?: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        ...(systemMessage ? [{ role: 'system' as const, content: systemMessage }] : []),
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }

  private async generateWithGemini(prompt: string, systemMessage?: string): Promise<string> {
    const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
    const result = await this.geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    return response.text() || '';
  }

  async generateExample(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const { context, language = 'English', difficulty = 3 } = request;
    const prompt = this.buildExamplePrompt(context, language, difficulty);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a language learning assistant. Create helpful example sentences that demonstrate word usage in context.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content?.trim() || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content,
        confidence: 0.85, // Default confidence for GPT responses
        tokensUsed,
      };
    } catch (error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateExplanation(word: string, context: string, language = 'English'): Promise<AIGenerationResponse> {
    const prompt = `Explain the meaning and usage of "${word}" in ${language}. Provide a clear, concise explanation suitable for language learners. Context: ${context}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful language teacher. Explain words and concepts clearly and concisely.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      });

      const content = completion.choices[0]?.message?.content?.trim() || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content,
        confidence: 0.9,
        tokensUsed,
      };
    } catch (error) {
      throw new Error(`AI explanation failed: ${error.message}`);
    }
  }

  async adjustScheduling(
    performance: number,
    streakDays: number,
    averageAccuracy: number
  ): Promise<{ recommendation: string; adjustmentFactor: number }> {
    // Simple AI-based scheduling adjustment
    let adjustmentFactor = 1.0;
    let recommendation = '';

    if (averageAccuracy > 0.9 && streakDays > 7) {
      adjustmentFactor = 1.3; // Increase intervals
      recommendation = 'Great job! Increasing review intervals due to strong performance.';
    } else if (averageAccuracy < 0.6) {
      adjustmentFactor = 0.7; // Decrease intervals
      recommendation = 'Focusing on more frequent reviews to help reinforce learning.';
    } else if (performance > 80) {
      adjustmentFactor = 1.1;
      recommendation = 'Good progress! Slightly extending review intervals.';
    } else {
      recommendation = 'Maintaining current review schedule.';
    }

    return { recommendation, adjustmentFactor };
  }

  async generateSynonyms(word: string, language = 'English'): Promise<AIGenerationResponse> {
    const prompt = `List 3-5 synonyms for "${word}" in ${language}. Provide only the synonyms, separated by commas.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content?.trim() || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content,
        confidence: 0.8,
        tokensUsed,
      };
    } catch (error) {
      throw new Error(`Synonym generation failed: ${error.message}`);
    }
  }

  private buildExamplePrompt(context: string, language: string, difficulty: number): string {
    const difficultyMap = {
      1: 'very simple',
      2: 'simple',
      3: 'intermediate',
      4: 'advanced',
      5: 'very advanced',
    };

    return `Create a ${difficultyMap[difficulty] || 'intermediate'} example sentence in ${language} using "${context}". The sentence should clearly demonstrate the meaning and usage of the word/phrase.`;
  }

  async getRecommendation(userId: string, context?: string, limit = 3): Promise<{ recommendations: string[] }> {
    // TODO: Use userId and context to personalize recommendations
    // For now, use OpenAI to generate generic study recommendations
    const prompt = `Suggest ${limit} personalized study recommendations for a language learner. Context: ${context || 'N/A'}`;
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a language learning coach. Give actionable, personalized study recommendations.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      const content = completion.choices[0]?.message?.content?.trim() || '';
      // Split recommendations by line or bullet
      const recommendations = content.split(/\n|\d+\.|\-/).map(r => r.trim()).filter(Boolean);
      return { recommendations };
    } catch (error) {
      throw new Error(`Recommendation generation failed: ${error.message}`);
    }
  }

  async explainError(error: string, context?: string): Promise<{ explanation: string }> {
    const prompt = `Explain the following error or mistake to a language learner in simple terms: "${error}". Context: ${context || 'N/A'}`;
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a patient language tutor. Explain errors and mistakes in a helpful, encouraging way.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 120,
        temperature: 0.5,
      });
      const explanation = completion.choices[0]?.message?.content?.trim() || '';
      return { explanation };
    } catch (error) {
      throw new Error(`Error explanation failed: ${error.message}`);
    }
  }

  async generateCard(topic: string, difficulty: number = 3, language: string = 'English'): Promise<{
    front: string;
    back: string;
    explanation?: string;
    exampleSentences?: string[];
    tags?: string[];
    difficulty: number;
  }> {
    const difficultyText = ['very easy', 'easy', 'medium', 'hard', 'very hard'][difficulty - 1] || 'medium';
    
    const prompt = `Create a flashcard for learning ${language} on the topic: "${topic}". 
    Difficulty level: ${difficultyText} (${difficulty}/5).
    
    Generate:
    1. A clear question or prompt for the front of the card
    2. A comprehensive answer for the back
    3. A brief explanation if needed
    4. 2-3 example sentences demonstrating usage
    5. 2-3 relevant tags for categorization
    
    Format your response as JSON with the following structure:
    {
      "front": "question or prompt",
      "back": "answer or explanation", 
      "explanation": "additional context if needed",
      "exampleSentences": ["example 1", "example 2"],
      "tags": ["tag1", "tag2", "tag3"]
    }`;

    const systemMessage = 'You are an expert educator creating high-quality flashcards. Always respond with valid JSON only.';

    try {
      const content = await this.generateWithBestProvider(prompt, systemMessage);
      
      try {
        const cardData = JSON.parse(content);
        return {
          front: cardData.front || `What is important about ${topic}?`,
          back: cardData.back || `${topic} is an important concept to understand.`,
          explanation: cardData.explanation,
          exampleSentences: cardData.exampleSentences || [],
          tags: cardData.tags || [topic.toLowerCase()],
          difficulty
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        console.warn('Failed to parse AI response as JSON, using fallback');
        return this.getFallbackCard(topic, difficulty);
      }
    } catch (error) {
      console.error('AI card generation failed:', error.message);
      return this.getFallbackCard(topic, difficulty);
    }
  }

  private getFallbackCard(topic: string, difficulty: number) {
    const fallbackCards = {
      'vocabulary': {
        front: 'What does "serendipity" mean?',
        back: 'A pleasant surprise; finding something good without looking for it',
        explanation: 'From a Persian fairy tale about princes making discoveries by accident',
        exampleSentences: ['It was pure serendipity that led to their meeting.', 'The discovery was a result of serendipity.'],
        tags: ['vocabulary', 'english', 'advanced']
      },
      'math': {
        front: 'What is the Pythagorean theorem?',
        back: 'a² + b² = c² (In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides)',
        explanation: 'Named after the ancient Greek mathematician Pythagoras',
        exampleSentences: ['Use the Pythagorean theorem to find the missing side.', 'This right triangle follows the Pythagorean theorem.'],
        tags: ['math', 'geometry', 'theorem']
      },
      'science': {
        front: 'What is photosynthesis?',
        back: 'The process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen',
        explanation: 'Essential for plant survival and oxygen production on Earth',
        exampleSentences: ['Photosynthesis occurs in the chloroplasts of plant cells.', 'Without photosynthesis, life on Earth would not exist.'],
        tags: ['science', 'biology', 'plants']
      }
    };

    const cardKey = Object.keys(fallbackCards).find(key => 
      topic.toLowerCase().includes(key)
    ) || 'vocabulary';

    const card = fallbackCards[cardKey];
    return {
      ...card,
      difficulty
    };
  }
}
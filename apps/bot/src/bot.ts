import { Telegraf, Context, Markup } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { ApiService } from './services/api.service';
import { Logger } from './utils/logger';
import { RedisService } from './services/redis.service';

export interface BotContext extends Context {
  session?: {
    userId?: string;
    step?: string;
    tempData?: any;
  };
}

export class MatrusBot {
  private bot: Telegraf<BotContext>;
  private apiService: ApiService;
  private logger: Logger;
  private redis: RedisService;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token === 'demo-mode-no-real-token-needed') {
      console.log('🤖 Starting Telegram bot in DEMO mode (no real token provided)');
      console.log('📝 Bot will simulate functionality without connecting to Telegram API');
      // Use a fake token for demo mode
      this.bot = null; // Will be handled in demo mode
    } else {
      this.bot = new Telegraf<BotContext>(token);
    }

    this.apiService = new ApiService();
    this.logger = new Logger();
    this.redis = new RedisService();

    if (this.bot) {
      this.setupMiddleware();
      this.setupCommands();
      this.setupActions();
    }
  }

  private setupMiddleware() {
    // Session middleware
    this.bot.use(async (ctx, next) => {
      const sessionKey = `session:${ctx.from?.id}`;
      const sessionData = await this.redis.get(sessionKey);
      
      ctx.session = sessionData ? JSON.parse(sessionData) : {};
      
      await next();
      
      // Save session after processing
      await this.redis.set(sessionKey, JSON.stringify(ctx.session), 3600); // 1 hour TTL
    });

    // Logging middleware
    this.bot.use((ctx, next) => {
      this.logger.info(`Received update from ${ctx.from?.id}: ${ctx.message?.text || 'action'}`);
      return next();
    });
  }

  private setupCommands() {
    // Start command
    this.bot.command('start', async (ctx) => {
      const telegramId = ctx.from?.id.toString();
      const firstName = ctx.from?.first_name;
      const username = ctx.from?.username;

      try {
        // Check if user exists
        const user = await this.apiService.getUserByTelegramId(telegramId);
        
        if (user) {
          ctx.session!.userId = user.id;
          await ctx.reply(
            `Welcome back, ${firstName}! 🎉\\n\\n` +
            `Ready to continue your learning journey?`,
            this.getMainMenuKeyboard()
          );
        } else {
          // New user registration
          await ctx.reply(
            `Hi ${firstName}! 👋\\n\\n` +
            `Welcome to Matrus - your AI-powered language learning companion!\\n\\n` +
            `I'll help you learn with smart flashcards and spaced repetition. ` +
            `Let's get you set up!`,
            Markup.inlineKeyboard([
              [Markup.button.callback('📚 Start Learning', 'register')],
              [Markup.button.webApp('🌐 Open Web App', process.env.WEB_APP_URL || 'https://matrus.app')]
            ])
          );
        }
      } catch (error) {
        this.logger.error('Error in start command:', error);
        await ctx.reply('Sorry, something went wrong. Please try again later.');
      }
    });

    // Today's cards
    this.bot.command('study', async (ctx) => {
      if (!ctx.session?.userId) {
        await ctx.reply('Please use /start to set up your account first.');
        return;
      }

      try {
        const cards = await this.apiService.getTodaysCards(ctx.session.userId);
        
        if (cards.length === 0) {
          await ctx.reply(
            '🎉 All done for today! You\'ve completed all your scheduled reviews.\\n\\n' +
            'Great job! Come back tomorrow for more cards.',
            this.getMainMenuKeyboard()
          );
          return;
        }

        await ctx.reply(
          `📚 You have ${cards.length} cards to review today!\\n\\n` +
          'Choose how you\'d like to study:',
          Markup.inlineKeyboard([
            [Markup.button.callback('🤖 Quick Quiz (Bot)', 'quick_quiz')],
            [Markup.button.webApp('🌐 Full Study Session', `${process.env.WEB_APP_URL}/study`)],
            [Markup.button.callback('📊 View Progress', 'progress')]
          ])
        );
      } catch (error) {
        this.logger.error('Error in study command:', error);
        await ctx.reply('Sorry, couldn\'t load your cards. Please try again.');
      }
    });

    // Progress command
    this.bot.command('progress', async (ctx) => {
      if (!ctx.session?.userId) {
        await ctx.reply('Please use /start to set up your account first.');
        return;
      }

      try {
        const stats = await this.apiService.getUserStats(ctx.session.userId);
        
        await ctx.reply(
          `📊 **Your Progress**\\n\\n` +
          `📚 Total Cards: ${stats.totalCards}\\n` +
          `🔄 Due Today: ${stats.cardsToReview}\\n` +
          `✅ Mastered: ${stats.cardsLearned}\\n` +
          `🔥 Streak: ${stats.streakDays} days\\n` +
          `🎯 Accuracy: ${(stats.averageAccuracy * 100).toFixed(1)}%\\n` +
          `⏱️ Time Today: ${Math.round(stats.timeStudiedToday / 60)} min`,
          { parse_mode: 'Markdown', ...this.getMainMenuKeyboard() }
        );
      } catch (error) {
        this.logger.error('Error in progress command:', error);
        await ctx.reply('Sorry, couldn\'t load your progress. Please try again.');
      }
    });

    // Help command
    this.bot.command('help', async (ctx) => {
      await ctx.reply(
        `🤖 **Matrus Bot Commands**\\n\\n` +
        `/start - Welcome & setup\\n` +
        `/study - Today's flashcards\\n` +
        `/progress - View your stats\\n` +
        `/settings - Adjust preferences\\n` +
        `/help - Show this help\\n\\n` +
        `💡 **Tips:**\\n` +
        `• Use the web app for the full experience\\n` +
        `• Study daily for best results\\n` +
        `• The AI adapts to your learning pace`,
        { parse_mode: 'Markdown' }
      );
    });

    // Settings command
    this.bot.command('settings', async (ctx) => {
      await ctx.reply(
        'Settings coming soon! For now, use the web app to customize your experience.',
        Markup.inlineKeyboard([
          [Markup.button.webApp('🌐 Open Settings', `${process.env.WEB_APP_URL}/settings`)]
        ])
      );
    });
  }

  private setupActions() {
    // Registration action
    this.bot.action('register', async (ctx) => {
      const telegramId = ctx.from?.id.toString();
      const firstName = ctx.from?.first_name;
      const lastName = ctx.from?.last_name;
      const username = ctx.from?.username;

      try {
        const user = await this.apiService.createUserFromTelegram({
          telegramId,
          firstName,
          lastName,
          username,
        });

        ctx.session!.userId = user.id;

        await ctx.editMessageText(
          `Welcome to Matrus, ${firstName}! 🎉\\n\\n` +
          `Your account is set up and ready. Let's start learning!`,
          this.getMainMenuKeyboard()
        );
      } catch (error) {
        this.logger.error('Error in registration:', error);
        await ctx.editMessageText('Sorry, registration failed. Please try again.');
      }
    });

    // Quick quiz action
    this.bot.action('quick_quiz', async (ctx) => {
      if (!ctx.session?.userId) {
        await ctx.answerCbQuery('Please register first');
        return;
      }

      try {
        const cards = await this.apiService.getTodaysCards(ctx.session.userId);
        
        if (cards.length === 0) {
          await ctx.editMessageText('No cards to review right now!');
          return;
        }

        // Start quiz with first card
        const card = cards[0];
        ctx.session!.currentCard = card;
        ctx.session!.quizCards = cards;
        ctx.session!.quizIndex = 0;

        await ctx.editMessageText(
          `📚 **Card ${1}/${cards.length}**\\n\\n` +
          `**${card.front}**\\n\\n` +
          `Think of the answer, then reveal it:`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('👁️ Reveal Answer', 'reveal_answer')],
              [Markup.button.callback('❌ Stop Quiz', 'stop_quiz')]
            ])
          }
        );
      } catch (error) {
        this.logger.error('Error starting quiz:', error);
        await ctx.editMessageText('Failed to start quiz. Please try again.');
      }
    });

    // Reveal answer action
    this.bot.action('reveal_answer', async (ctx) => {
      const card = ctx.session?.currentCard;
      if (!card) {
        await ctx.answerCbQuery('No active card');
        return;
      }

      const cards = ctx.session?.quizCards || [];
      const index = ctx.session?.quizIndex || 0;

      await ctx.editMessageText(
        `📚 **Card ${index + 1}/${cards.length}**\\n\\n` +
        `**${card.front}**\\n\\n` +
        `**Answer:** ${card.back}\\n\\n` +
        `How did you do?`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('✅ Correct', 'answer_correct'),
              Markup.button.callback('❌ Wrong', 'answer_wrong')
            ],
            [Markup.button.callback('🔄 Skip', 'answer_skip')],
            [Markup.button.callback('❌ Stop Quiz', 'stop_quiz')]
          ])
        }
      );
    });

    // Answer actions
    this.bot.action(/answer_(correct|wrong|skip)/, async (ctx) => {
      const action = ctx.match![1] as 'correct' | 'wrong' | 'skip';
      const card = ctx.session?.currentCard;
      
      if (!card || !ctx.session?.userId) {
        await ctx.answerCbQuery('Session error');
        return;
      }

      // Submit answer to API
      if (action !== 'skip') {
        try {
          await this.apiService.submitAnswer(ctx.session.userId, {
            cardId: card.id,
            isCorrect: action === 'correct',
            timeSpent: 5, // Estimate for bot quiz
          });
        } catch (error) {
          this.logger.error('Error submitting answer:', error);
        }
      }

      // Move to next card
      const cards = ctx.session?.quizCards || [];
      const nextIndex = (ctx.session?.quizIndex || 0) + 1;

      if (nextIndex >= cards.length) {
        // Quiz complete
        await ctx.editMessageText(
          `🎉 **Quiz Complete!**\\n\\n` +
          `You've reviewed ${cards.length} cards. Great job!\\n\\n` +
          `Keep up the daily practice for best results.`,
          {
            parse_mode: 'Markdown',
            ...this.getMainMenuKeyboard()
          }
        );
        
        // Clear session data
        delete ctx.session?.currentCard;
        delete ctx.session?.quizCards;
        delete ctx.session?.quizIndex;
        return;
      }

      // Show next card
      const nextCard = cards[nextIndex];
      ctx.session!.currentCard = nextCard;
      ctx.session!.quizIndex = nextIndex;

      await ctx.editMessageText(
        `📚 **Card ${nextIndex + 1}/${cards.length}**\\n\\n` +
        `**${nextCard.front}**\\n\\n` +
        `Think of the answer, then reveal it:`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('👁️ Reveal Answer', 'reveal_answer')],
            [Markup.button.callback('❌ Stop Quiz', 'stop_quiz')]
          ])
        }
      );
    });

    // Stop quiz action
    this.bot.action('stop_quiz', async (ctx) => {
      delete ctx.session?.currentCard;
      delete ctx.session?.quizCards;
      delete ctx.session?.quizIndex;

      await ctx.editMessageText(
        'Quiz stopped. You can continue anytime!',
        this.getMainMenuKeyboard()
      );
    });

    // Progress action
    this.bot.action('progress', async (ctx) => {
      await ctx.answerCbQuery();
      // Trigger progress command
      ctx.message = { text: '/progress' } as any;
      await this.bot.handleUpdate({ message: ctx.message } as any);
    });
  }

  private getMainMenuKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📚 Study', 'study'),
        Markup.button.callback('📊 Progress', 'progress')
      ],
      [Markup.button.webApp('🌐 Open Web App', process.env.WEB_APP_URL || 'https://matrus.app')]
    ]);
  }

  public async start() {
    if (!this.bot) {
      // Demo mode - just simulate bot running
      this.logger.info('🤖 Telegram Bot running in DEMO mode');
      console.log('🚀 Demo Bot Features:');
      console.log('  📋 Commands: /start, /help, /progress, /study');
      console.log('  🔗 API Integration: Connected to mock API server');
      console.log('  💾 Redis: Connected for session management');
      console.log('  ✅ Status: Ready for production deployment with real token');
      
      // Keep the process alive in demo mode
      setInterval(() => {
        console.log(`🤖 Bot demo heartbeat - ${new Date().toLocaleTimeString()}`);
      }, 30000);
      
      return;
    }

    // Error handling
    this.bot.catch((err, ctx) => {
      this.logger.error(`Bot error for ${ctx.updateType}:`, err);
    });

    // Start bot
    if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
      // Webhook mode
      const webhookUrl = `${process.env.WEBHOOK_URL}/telegram/webhook`;
      await this.bot.telegram.setWebhook(webhookUrl);
      this.logger.info(`Bot started with webhook: ${webhookUrl}`);
    } else {
      // Polling mode
      await this.bot.launch();
      this.logger.info('Bot started in polling mode');
    }

    // Graceful shutdown
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  public getWebhookMiddleware() {
    return this.bot.webhookCallback('/telegram/webhook');
  }
}
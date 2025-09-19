// Study page entry: handles session start, card display, answer submission, and session end

"use client";
import React, { useState, useEffect, useCallback } from "react";
import StudyCard from "./StudyCard";
import AnswerButtons from "./AnswerButtons";
import {
  startSession,
  fetchNextCard,
  submitAnswer,
  endSession,
} from "./studyApi";
import toast from "react-hot-toast";
import { Button } from '@matrus/ui';
import { LoadingSpinner } from '@matrus/ui';

interface StudyCardData {
  id: string;
  front: string;
  back: string;
  explanation?: string;
  exampleSentences?: string[];
  tags?: string[];
  leitnerCard?: any;
}

interface StudyStats {
  totalCards: number;
  cardsToReview: number;
  cardsLearned: number;
  streakDays: number;
  averageAccuracy: number;
  timeStudiedToday: number;
}

const StudyPage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [card, setCard] = useState<StudyCardData | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [answering, setAnswering] = useState(false);

  // Start session on mount
  useEffect(() => {
    handleStartSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartSession = useCallback(async () => {
    setLoading(true);
    setSessionEnded(false);
    setStats(null);
    setShowBack(false);
    try {
      const res = await startSession();
      setSessionId(res.data.id);
      await loadNextCard(res.data.id);
    } catch (e: any) {
      toast.error(e.message || "Failed to start session");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNextCard = useCallback(async (sid: string) => {
    setLoading(true);
    setShowBack(false);
    try {
      const res = await fetchNextCard(sid);
      if (!res.data) {
        // No more cards, end session
        await handleEndSession(sid);
        return;
      }
      setCard(res.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch card");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFlip = () => setShowBack((b) => !b);

  const handleAnswer = async (result: "correct" | "incorrect" | "skip") => {
    if (!sessionId || !card) return;
    setAnswering(true);
    try {
      await submitAnswer(sessionId, card.id, result);
      await loadNextCard(sessionId);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit answer");
    } finally {
      setAnswering(false);
    }
  };

  const handleEndSession = async (sid?: string) => {
    setLoading(true);
    try {
      const res = await endSession(sid || sessionId!);
      setStats(res.data?.stats || null);
      setSessionEnded(true);
      setCard(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to end session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-12">
        <h1 className="text-2xl font-bold mb-4 text-center">Study Session</h1>
        {loading && (
          <div className="text-center text-blue-500 py-8" role="status" aria-live="polite">
            <LoadingSpinner size="md" />
            <div className="mt-2">Loading...</div>
          </div>
        )}
        {!loading && sessionEnded && stats && (
          <div className="text-center" role="region" aria-label="Session Complete">
            <h2 className="text-xl font-semibold mb-2">Session Complete!</h2>
            <div className="mb-2">Cards Learned: <b>{stats.cardsLearned}</b></div>
            <div className="mb-2">Accuracy: <b>{Math.round(stats.averageAccuracy * 100)}%</b></div>
            <div className="mb-2">Streak: <b>{stats.streakDays} days</b></div>
            <div className="mb-2">Time Studied: <b>{Math.round(stats.timeStudiedToday / 60)} min</b></div>
            <Button
              className="mt-4"
              onClick={handleStartSession}
              aria-label="Start New Session"
            >
              Start New Session
            </Button>
          </div>
        )}
        {!loading && !sessionEnded && card && (
          <>
            <StudyCard
              front={card.front}
              back={card.back}
              showBack={showBack}
              onFlip={handleFlip}
            />
            <AnswerButtons onAnswer={handleAnswer} disabled={answering} />
            <Button
              className="mt-4 text-xs underline"
              onClick={() => handleEndSession()}
              disabled={loading}
              variant="ghost"
              size="sm"
              aria-label="End Session"
            >
              End Session
            </Button>
          </>
        )}
        {!loading && !sessionEnded && !card && (
          <div className="text-center text-gray-500 py-8">No cards to study.</div>
        )}
      </div>
    </main>
  );
};

export default StudyPage;

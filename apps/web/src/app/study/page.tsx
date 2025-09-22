// Study page entry: handles session start, card display, answer submission, and session end

"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import StudyCard from "./StudyCard";
import AnswerButtons from "./AnswerButtons";
import { startSession, fetchNextCard, submitAnswer, endSession } from "./studyApi";
import { Button, LoadingSpinner, Modal } from "@matrus/ui";
import toast from "react-hot-toast";

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

type ShortcutAction = 'skip' | 'incorrect' | 'correct';
type ShortcutConfig = {
  key1: ShortcutAction;
  key2: ShortcutAction;
  key3: ShortcutAction;
  enableASD?: boolean;
  enableArrows?: boolean;
};

const StudyPage = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [card, setCard] = useState<StudyCardData | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [answering, setAnswering] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [shortcuts, setShortcuts] = useState<ShortcutConfig>({ key1: 'skip', key2: 'incorrect', key3: 'correct', enableASD: false, enableArrows: false });

  // Load persisted shortcuts (from localStorage, then attempt server sync)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('studyShortcuts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.key1 && parsed.key2 && parsed.key3) {
          setShortcuts({ enableASD: false, enableArrows: false, ...parsed });
        }
      }
    } catch {}
    // Try to fetch from server and override if available
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/user/preferences', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          const serverCfg = data?.studyShortcuts;
          if (serverCfg && serverCfg.key1 && serverCfg.key2 && serverCfg.key3) {
            setShortcuts((prev) => ({ ...prev, ...serverCfg }));
          }
        }
      } catch {}
    })();
  }, []);

  // Persist shortcuts locally and attempt to sync to server (best effort)
  useEffect(() => {
    try {
      localStorage.setItem('studyShortcuts', JSON.stringify(shortcuts));
    } catch {}
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studyShortcuts: shortcuts }),
        });
        if (!res.ok) throw new Error('Sync failed');
        // mark last synced
        try { localStorage.setItem('studyShortcutsLastSynced', String(Date.now())); } catch {}
      } catch {}
    })();
  }, [shortcuts]);

  // Refs used to avoid circular deps between callbacks
  const loadNextCardRef = useRef<(sid: string) => Promise<void>>();
  const handleEndSessionRef = useRef<(sid?: string) => Promise<void>>();

  const handleStartSession = useCallback(async () => {
    setLoading(true);
    setSessionEnded(false);
    setStats(null);
    setShowBack(false);
    try {
      const res = await startSession();
      setSessionId(res.data.id);
      if (typeof res?.data?.cardsRemaining === 'number') {
        setRemaining(res.data.cardsRemaining);
      } else if (typeof res?.data?.totalCards === 'number') {
        setRemaining(res.data.totalCards);
      } else {
        setRemaining(null);
      }
      await loadNextCardRef.current?.(res.data.id);
    } catch (e: any) {
      toast.error(e?.message || "Failed to start session");
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
        // No more cards; end the session
        await handleEndSessionRef.current?.(sid);
        return;
      }
      setCard(res.data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to fetch card");
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep refs in sync with latest callbacks
  useEffect(() => {
    loadNextCardRef.current = loadNextCard;
  }, [loadNextCard]);

  const handleEndSession = useCallback(async (sid?: string) => {
    // Confirm if user tries to end with remaining cards
    if (!sessionEnded && typeof remaining === 'number' && remaining > 0) {
      const proceed = window.confirm(`You still have ${remaining} card(s) remaining. End session anyway?`);
      if (!proceed) return;
    }
    const effectiveId = sid || sessionId;
    if (!effectiveId) return;
    setLoading(true);
    try {
      const res = await endSession(effectiveId);
      setStats(res.data?.stats || null);
      setSessionEnded(true);
      setCard(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to end session");
    } finally {
      setLoading(false);
    }
  }, [sessionId, remaining, sessionEnded]);

  useEffect(() => {
    handleEndSessionRef.current = handleEndSession;
  }, [handleEndSession]);

  const handleFlip = useCallback(() => setShowBack((b) => !b), []);

  const handleAnswer = useCallback(
    async (result: "correct" | "incorrect" | "skip") => {
      if (!sessionId || !card) return;
      setAnswering(true);
      try {
        await submitAnswer(sessionId, card.id, result);
        // Decrement remaining if we track it
        setRemaining((r) => (typeof r === 'number' && r > 0 ? r - 1 : r));
        await loadNextCardRef.current?.(sessionId);
      } catch (e: any) {
        toast.error(e?.message || "Failed to submit answer");
      } finally {
        setAnswering(false);
      }
    },
    [sessionId, card]
  );

  // Keyboard shortcuts: Space to flip, 1/2/3 for skip/incorrect/correct
  useEffect(() => {
    const isEditableTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      const editableTags = ['input', 'textarea', 'select'];
      return editableTags.includes(tag) || el.isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (sessionEnded || loading || answering || !card) return;
      if (isEditableTarget(e.target)) return;

      // Space to flip card
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
        return;
      }

      // Numeric shortcuts (configurable)
      if (e.key === '1') {
        e.preventDefault();
        handleAnswer(shortcuts.key1);
      } else if (e.key === '2') {
        e.preventDefault();
        handleAnswer(shortcuts.key2);
      } else if (e.key === '3') {
        e.preventDefault();
        handleAnswer(shortcuts.key3);
      }

      // A/S/D alternate keys
      if (shortcuts.enableASD) {
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          handleAnswer(shortcuts.key1);
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleAnswer(shortcuts.key2);
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          handleAnswer(shortcuts.key3);
        }
      }

      // Arrow keys alternate
      if (shortcuts.enableArrows) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleAnswer(shortcuts.key1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleAnswer(shortcuts.key2);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleAnswer(shortcuts.key3);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sessionEnded, loading, answering, card, handleFlip, handleAnswer, shortcuts]);

  // Start session on mount
  useEffect(() => {
    handleStartSession();
  }, [handleStartSession]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg mt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-center flex-1">Study Session</h1>
          {(() => {
            try {
              const last = typeof window !== 'undefined' ? localStorage.getItem('studyShortcutsLastSynced') : null;
              if (last) {
                return <span className="text-xs text-green-600 mr-2" title="Preferences synced to cloud">☁️ Synced</span>;
              }
            } catch {}
            return null;
          })()}
          <button
            className="ml-2 text-gray-400 hover:text-gray-600"
            aria-label="Open shortcuts help"
            title="Keyboard shortcuts & settings"
            onClick={() => setShowHelp(true)}
          >
            ?
          </button>
        </div>

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
            <Button className="mt-4" onClick={handleStartSession} aria-label="Start New Session">
              Start New Session
            </Button>
          </div>
        )}

        {!loading && !sessionEnded && card && (
          <>
            <StudyCard front={card.front} back={card.back} showBack={showBack} onFlip={handleFlip} />
            {typeof remaining === 'number' && (
              <div className="text-center text-sm text-gray-500 mt-2">
                Remaining: {remaining}
              </div>
            )}
            <AnswerButtons onAnswer={handleAnswer} disabled={answering} />
            <div className="text-center text-xs text-gray-400 mt-1">
              Shortcuts: Space = Flip, 1 = {shortcuts.key1}, 2 = {shortcuts.key2}, 3 = {shortcuts.key3}
              {shortcuts.enableASD && <span> • A/S/D mirror 1/2/3</span>}
              {shortcuts.enableArrows && <span> • Arrows ⟵/↓/⟶ mirror 1/2/3</span>}
            </div>
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
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Keyboard Shortcuts & Settings">
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <div className="font-semibold mb-1">Available actions</div>
            <div>skip • incorrect • correct</div>
          </div>
          <div>
            <div className="font-semibold mb-1">Keys</div>
            <div>Space: Flip the current card</div>
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="key1">Key &quot;1&quot; action</label>
              <select
                id="key1"
                className="w-full border border-gray-300 rounded-md px-2 py-1"
                value={shortcuts.key1}
                onChange={(e) => setShortcuts((s) => ({ ...s, key1: e.target.value as ShortcutAction }))}
              >
                <option value="skip">skip</option>
                <option value="incorrect">incorrect</option>
                <option value="correct">correct</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="key2">Key &quot;2&quot; action</label>
              <select
                id="key2"
                className="w-full border border-gray-300 rounded-md px-2 py-1"
                value={shortcuts.key2}
                onChange={(e) => setShortcuts((s) => ({ ...s, key2: e.target.value as ShortcutAction }))}
              >
                <option value="skip">skip</option>
                <option value="incorrect">incorrect</option>
                <option value="correct">correct</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1" htmlFor="key3">Key &quot;3&quot; action</label>
              <select
                id="key3"
                className="w-full border border-gray-300 rounded-md px-2 py-1"
                value={shortcuts.key3}
                onChange={(e) => setShortcuts((s) => ({ ...s, key3: e.target.value as ShortcutAction }))}
              >
                <option value="skip">skip</option>
                <option value="incorrect">incorrect</option>
                <option value="correct">correct</option>
              </select>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!shortcuts.enableASD}
                onChange={(e) => setShortcuts((s) => ({ ...s, enableASD: e.target.checked }))}
              />
              Enable A/S/D mirror keys
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!shortcuts.enableArrows}
                onChange={(e) => setShortcuts((s) => ({ ...s, enableArrows: e.target.checked }))}
              />
              Enable Arrow keys (←/↓/→)
            </label>
          </div>
          <div className="text-xs text-gray-500">
            Tip: Shortcuts are disabled while typing in inputs or while the app is loading/submitting.
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setShortcuts({ key1: 'skip', key2: 'incorrect', key3: 'correct' })}>Reset</Button>
          <Button variant="primary" size="sm" onClick={() => setShowHelp(false)}>Close</Button>
        </div>
      </Modal>
    </main>
  );
};

export default StudyPage;

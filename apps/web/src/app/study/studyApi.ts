// Utility for API calls to study endpoints
export async function startSession() {
  const res = await fetch("/api/study/start", { method: "POST" });
  if (!res.ok) throw new Error("Failed to start session");
  return res.json();
}

export async function fetchNextCard(sessionId: string) {
  const res = await fetch(`/api/study/next?sessionId=${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch next card");
  return res.json();
}

export async function submitAnswer(sessionId: string, cardId: string, result: string) {
  const res = await fetch(`/api/study/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, cardId, result }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
}

export async function endSession(sessionId: string) {
  const res = await fetch(`/api/study/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
  if (!res.ok) throw new Error("Failed to end session");
  return res.json();
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuiz, submitQuiz } from "../api";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleStable(arr, seed) {
  const out = arr.slice();
  const rnd = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function formatClock(totalSeconds) {
  const s = Math.max(0, totalSeconds | 0);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function TakeQuizPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(() => ({}));
  const [attemptSeed, setAttemptSeed] = useState(0);
  const [totalLeft, setTotalLeft] = useState(null);
  const [questionLeft, setQuestionLeft] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const startedAtRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const q = await getQuiz(id);
        if (!alive) return;
        const seed = Math.floor(Math.random() * 2 ** 31);
        const shouldShuffle = q?.settings?.shuffleQuestions !== false; // default on
        const questions = shouldShuffle ? shuffleStable(q.questions || [], seed) : (q.questions || []);
        setAttemptSeed(seed);
        setQuiz({ ...q, questions });
        setIdx(0);
        setAnswers({});
        startedAtRef.current = Date.now();
        setError("");
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load quiz");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const total = quiz?.questions?.length || 0;
  const q = quiz?.questions?.[idx] || null;

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progressPct = total ? Math.round(((idx + 1) / total) * 100) : 0;

  const timerMode = quiz?.settings?.timer?.mode ?? "off";
  const totalSeconds = quiz?.settings?.timer?.totalSeconds ?? null;
  const perQuestionSeconds = quiz?.settings?.timer?.perQuestionSeconds ?? null;

  // Initialize timers when quiz loads
  useEffect(() => {
    if (!quiz) return;
    if (timerMode === "total" && Number.isInteger(totalSeconds) && totalSeconds > 0) {
      setTotalLeft(totalSeconds);
    } else {
      setTotalLeft(null);
    }
  }, [quiz, timerMode, totalSeconds]);

  // Reset per-question timer on question change
  useEffect(() => {
    if (!quiz) return;
    if (timerMode === "perQuestion" && Number.isInteger(perQuestionSeconds) && perQuestionSeconds > 0) {
      setQuestionLeft(perQuestionSeconds);
    } else {
      setQuestionLeft(null);
    }
  }, [quiz, idx, timerMode, perQuestionSeconds]);

  // Tick timers
  useEffect(() => {
    if (!quiz) return;
    if (timerMode === "off") return;
    const handle = setInterval(() => {
      if (timerMode === "total") {
        setTotalLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
      } else if (timerMode === "perQuestion") {
        setQuestionLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)));
      }
    }, 1000);
    return () => clearInterval(handle);
  }, [quiz, timerMode]);

  // Auto-advance / auto-submit when time expires
  useEffect(() => {
    if (!quiz || submitting) return;
    if (timerMode === "total" && totalLeft === 0) {
      onSubmit({ timerExpired: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerMode, totalLeft, quiz, submitting]);

  useEffect(() => {
    if (!quiz || submitting) return;
    if (timerMode === "perQuestion" && questionLeft === 0) {
      if (idx < total - 1) go(1);
      else onSubmit({ timerExpired: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerMode, questionLeft, quiz, submitting, idx, total]);

  function setSelected(questionId, selectedIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  }

  async function onSubmit(opts = {}) {
    if (!quiz) return;
    if (!playerName.trim()) {
      setError("Please enter your name before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const finishedAt = Date.now();
      const startedAt = startedAtRef.current ?? finishedAt;
      const timeTakenSeconds = Math.max(0, Math.round((finishedAt - startedAt) / 1000));
      const payload = {
        playerName: playerName.trim(),
        answers: quiz.questions.map((qq) => ({
          questionId: qq.id,
          selectedIndex: answers[qq.id] ?? -1,
        })),
        meta: {
          timerMode,
          totalSeconds,
          perQuestionSeconds,
          attemptSeed,
          startedAt,
          finishedAt,
          timeTakenSeconds,
          timerExpired: Boolean(opts.timerExpired),
        },
      };
      const result = await submitQuiz(quiz.id, payload);
      const resultId = result?.resultId ?? null;
      sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({ quiz, result, playerName, resultId }));
      // Prefer the shareable URL when available
      if (resultId) nav(`/results/${resultId}`);
      else nav(`/quizzes/${quiz.id}/results`);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  function go(delta) {
    setIdx((prev) => clamp(prev + delta, 0, Math.max(0, total - 1)));
  }

  if (loading) return <div className="card muted">Loading…</div>;
  if (error && !quiz) return <div className="card errorBox">{error}</div>;
  if (!quiz) return <div className="card muted">Quiz not found.</div>;

  return (
    <section className="card">
      <div className="quizHeader">
        <div>
          <div className="kicker">{quiz.title}</div>
          <h1>
            Question {idx + 1} of {total}
          </h1>
        </div>
        <div className="pillRow">
          {timerMode === "total" && totalLeft != null ? (
            <div className="pill subtle">⏱ {formatClock(totalLeft)}</div>
          ) : null}
          {timerMode === "perQuestion" && questionLeft != null ? (
            <div className="pill subtle">⏳ {formatClock(questionLeft)}</div>
          ) : null}
          <div className="pill">
            {answeredCount}/{total} answered
          </div>
        </div>
      </div>

      <div className="progressRow">
        <div className="progressTrack" aria-hidden="true">
          <div className="progressFill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="muted">{progressPct}%</div>
      </div>

      {error ? <div className="errorBox">{error}</div> : null}

      {q ? (
        <div className="questionBlock">
          <div className="questionText">{q.question}</div>
          <div className="options">
            {q.options.map((opt, optIdx) => {
              const checked = (answers[q.id] ?? -1) === optIdx;
              return (
                <label className={`optionRow ${checked ? "selected" : ""}`} key={optIdx}>
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    checked={checked}
                    onChange={() => setSelected(q.id, optIdx)}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="takeFooterRow">
        <button className="btn secondary takePrevBtn" onClick={() => go(-1)} disabled={idx === 0 || submitting}>
          ← Previous
        </button>

        <div className="nameBox">
          <label className="muted" htmlFor="playerName">
            Player name
          </label>
          <input
            id="playerName"
            className="input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="e.g. John"
            disabled={submitting}
          />
        </div>

        {idx < total - 1 ? (
          <button className="btn takeNextBtn" onClick={() => go(1)} disabled={submitting}>
            Next →
          </button>
        ) : (
          <button className="btn primary takeNextBtn" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </button>
        )}
      </div>
    </section>
  );
}



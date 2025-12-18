import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResult } from "../api";

function loadCached(id) {
  try {
    const raw = sessionStorage.getItem(`quiz_result_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ResultsPage() {
  const { id, resultId } = useParams();
  const cached = useMemo(() => (id ? loadCached(id) : null), [id]);
  const [shareMsg, setShareMsg] = useState("");
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(Boolean(resultId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resultId) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getResult(resultId);
        if (!alive) return;
        setRemote(data);
        setError("");
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load shared results");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [resultId]);

  const quiz = remote?.quiz ?? cached?.quiz ?? null;
  const result = remote?.result ?? cached?.result ?? null;
  const playerName = remote?.result?.playerName ?? cached?.playerName ?? "";
  const effectiveQuizId = quiz?.id ?? id ?? remote?.result?.quizId ?? null;
  const effectiveResultId = remote?.result?.id ?? cached?.resultId ?? result?.resultId ?? resultId ?? null;

  if (loading) {
    return (
      <section className="card">
        <h1>Results</h1>
        <div className="muted">Loading…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <h1>Results</h1>
        <div className="errorBox">{error}</div>
        <div className="spacer" />
        <Link className="btn" to="/">
          All Quizzes
        </Link>
      </section>
    );
  }

  if (!result || !quiz) {
    return (
      <section className="card">
        <h1>Results</h1>
        <div className="muted">No results found for this quiz in this browser session.</div>
        <div className="spacer" />
        <Link className="btn" to={effectiveQuizId ? `/quizzes/${effectiveQuizId}` : "/"}>
          Take Quiz
        </Link>
      </section>
    );
  }

  const timeTaken = result?.meta?.timeTakenSeconds ?? null;

  async function onShare() {
    const text = `I scored ${result.score}/${result.totalQuestions} (${result.percentage}%) on "${quiz.title}"${
      playerName ? ` as ${playerName}` : ""
    }.`;
    const url = effectiveResultId ? `${window.location.origin}/results/${effectiveResultId}` : window.location.href;
    const shareData = { title: "Quiz Results", text, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMsg("Shared!");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareMsg("Copied to clipboard!");
      } else {
        setShareMsg("Sharing not supported in this browser.");
      }
    } catch {
      setShareMsg("Share cancelled.");
    } finally {
      window.setTimeout(() => setShareMsg(""), 2000);
    }
  }

  return (
    <section className="card">
      <div className="resultsHeader">
        <div>
          <div className="kicker">🎉 Quiz Complete</div>
          <h1>{quiz.title}</h1>
          <div className="muted">Player: {playerName}</div>
          <div className="pillRow" style={{ marginTop: 8 }}>
            <div className="pill subtle">{quiz.category ?? "General"}</div>
            {timeTaken != null ? <div className="pill subtle">⏱ {timeTaken}s</div> : null}
          </div>
        </div>
        <div className="scoreBox">
          <div className="scoreTop">Your Score</div>
          <div className="scoreValue">
            {result.score}/{result.totalQuestions}
          </div>
          <div className="muted">{result.percentage}%</div>
        </div>
      </div>

      <h2 className="sectionTitle">Review Answers</h2>
      <div className="reviewList">
        {result.results.map((r, i) => {
          const q = quiz.questions.find((qq) => qq.id === r.questionId);
          const selectedText =
            r.selectedIndex >= 0 && q?.options?.[r.selectedIndex] ? q.options[r.selectedIndex] : "—";
          const correctText = q?.options?.[r.correctIndex] ?? "—";
          return (
            <div className={`reviewItem ${r.isCorrect ? "ok" : "bad"}`} key={r.questionId}>
              <div className="reviewQ">
                <span className="reviewMark">{r.isCorrect ? "✓" : "✗"}</span>
                <span>
                  Q{i + 1}: {r.question}
                </span>
              </div>
              <div className="reviewA">
                <div>
                  <span className="muted">Your answer:</span> {selectedText}
                </div>
                {!r.isCorrect ? (
                  <div>
                    <span className="muted">Correct:</span> {correctText}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="footerRow">
        <Link className="btn secondary" to={effectiveQuizId ? `/quizzes/${effectiveQuizId}/leaderboard` : "/"}>
          View Leaderboard
        </Link>
        <button className="btn secondary" type="button" onClick={onShare}>
          Share Results
        </button>
        <Link className="btn" to="/">
          Take Another Quiz
        </Link>
      </div>
      {shareMsg ? <div className="muted" style={{ marginTop: 10 }}>{shareMsg}</div> : null}
    </section>
  );
}



import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listQuizzes } from "../api";

export function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await listQuizzes();
        if (!alive) return;
        setQuizzes(data);
        setError("");
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load quizzes");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(quizzes.map((q) => q.category ?? "General"))).sort()];
  const filtered = category === "All" ? quizzes : quizzes.filter((q) => (q.category ?? "General") === category);

  return (
    <section className="card">
      <div className="cardHeader">
        <h1>Available Quizzes</h1>
        <div className="muted">Pick one to start</div>
      </div>

      <div className="filterRow">
        <div className="muted">Category</div>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option value={c} key={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="errorBox">{error}</div> : null}

      <div className="quizGrid">
        {filtered.map((q) => (
          <div className="quizTile" key={q.id}>
            <div className="quizTileTop">
              <div className="quizTitle">{q.title}</div>
              <div className="muted">{q.description}</div>
            </div>
            <div className="quizTileBottom">
              <div className="pillRow">
                <div className="pill">{q.questionCount} questions</div>
                <div className="pill subtle">{q.category ?? "General"}</div>
              </div>
              <Link className="btn" to={`/quizzes/${q.id}`}>
                Start Quiz
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && quizzes.length === 0 ? (
        <div className="muted">No quizzes yet. Create one via POST /api/quizzes.</div>
      ) : null}
    </section>
  );
}



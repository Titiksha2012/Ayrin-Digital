import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLeaderboard } from "../api";

export function LeaderboardPage() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard(id);
        if (!alive) return;
        setLeaderboard(data);
        setError("");
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load leaderboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <section className="card">
      <div className="cardHeader">
        <h1>Leaderboard</h1>
        <div className="muted">Top scores for this quiz</div>
      </div>

      {loading ? <div className="muted">Loading…</div> : null}
      {error ? <div className="errorBox">{error}</div> : null}

      <div className="leaderTable">
        <div className="leaderRow head">
          <div>#</div>
          <div>Player</div>
          <div className="right">Score</div>
          <div className="right">%</div>
        </div>
        {leaderboard.map((row, i) => (
          <div className="leaderRow" key={`${row.playerName}-${row.score}-${row.percentage}`}>
            <div className="muted">{i + 1}</div>
            <div>{row.playerName}</div>
            <div className="right">{row.score}</div>
            <div className="right">{row.percentage}</div>
          </div>
        ))}
      </div>

      {!loading && !error && leaderboard.length === 0 ? (
        <div className="muted">No attempts yet. Take the quiz to appear here.</div>
      ) : null}

      <div className="footerRow">
        <Link className="btn secondary" to={`/quizzes/${id}`}>
          Back to Quiz
        </Link>
        <Link className="btn" to="/">
          All Quizzes
        </Link>
      </div>
    </section>
  );
}



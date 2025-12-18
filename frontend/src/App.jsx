import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { QuizListPage } from "./pages/QuizListPage";
import { TakeQuizPage } from "./pages/TakeQuizPage";
import { ResultsPage } from "./pages/ResultsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";

export default function App() {
  return (
    <div className="appShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark">Q</div>
      <div>
            <div className="brandTitle">Quiz App</div>
            <div className="brandSub">Ayrin Digital – Technical Assignment</div>
          </div>
      </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<QuizListPage />} />
          <Route path="/quizzes/:id" element={<TakeQuizPage />} />
          <Route path="/quizzes/:id/results" element={<ResultsPage />} />
          <Route path="/results/:resultId" element={<ResultsPage />} />
          <Route path="/quizzes/:id/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      </div>
  );
}

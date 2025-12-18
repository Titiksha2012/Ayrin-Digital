const express = require("express");
const cors = require("cors");
const { loadDb, updateDb } = require("./store");
const { createQuizSeed } = require("./seed");

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(2, 6)}`;
}

function toQuizSummary(quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category ?? "General",
    questionCount: quiz.questions.length,
    createdAt: quiz.createdAt,
    settings: quiz.settings ?? { shuffleQuestions: true, timer: { mode: "off" } },
  };
}

function stripCorrectIndex(quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category ?? "General",
    settings: quiz.settings ?? { shuffleQuestions: true, timer: { mode: "off" } },
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    })),
  };
}

function validateTimer(timer, errors) {
  if (timer == null) return;
  if (typeof timer !== "object") {
    errors.push("settings.timer must be an object.");
    return;
  }
  const mode = timer.mode;
  if (!["off", "total", "perQuestion"].includes(mode)) {
    errors.push("settings.timer.mode must be one of: off, total, perQuestion.");
    return;
  }
  if (mode === "total") {
    if (!Number.isInteger(timer.totalSeconds) || timer.totalSeconds <= 0) {
      errors.push("settings.timer.totalSeconds must be a positive integer.");
    }
  }
  if (mode === "perQuestion") {
    if (!Number.isInteger(timer.perQuestionSeconds) || timer.perQuestionSeconds <= 0) {
      errors.push("settings.timer.perQuestionSeconds must be a positive integer.");
    }
  }
}

function validateCreateQuiz(body) {
  const errors = [];
  if (!body || typeof body !== "object") errors.push("Body must be an object.");
  if (!body?.title || typeof body.title !== "string") errors.push("title is required.");
  if (typeof body?.description !== "string") errors.push("description must be a string.");
  if (body?.category != null && typeof body.category !== "string")
    errors.push("category must be a string.");
  if (body?.settings != null && typeof body.settings !== "object")
    errors.push("settings must be an object.");
  if (body?.settings?.shuffleQuestions != null && typeof body.settings.shuffleQuestions !== "boolean")
    errors.push("settings.shuffleQuestions must be a boolean.");
  validateTimer(body?.settings?.timer, errors);
  if (!Array.isArray(body?.questions) || body.questions.length === 0)
    errors.push("questions must be a non-empty array.");

  if (Array.isArray(body?.questions)) {
    body.questions.forEach((q, idx) => {
      if (!q || typeof q !== "object") {
        errors.push(`questions[${idx}] must be an object.`);
        return;
      }
      if (typeof q.question !== "string" || !q.question.trim())
        errors.push(`questions[${idx}].question is required.`);
      if (!Array.isArray(q.options) || q.options.length < 2)
        errors.push(`questions[${idx}].options must have at least 2 items.`);
      if (Array.isArray(q.options) && q.options.some((o) => typeof o !== "string"))
        errors.push(`questions[${idx}].options must be strings.`);
      if (!Number.isInteger(q.correctIndex))
        errors.push(`questions[${idx}].correctIndex must be an integer.`);
      else if (Array.isArray(q.options) && (q.correctIndex < 0 || q.correctIndex >= q.options.length))
        errors.push(`questions[${idx}].correctIndex out of range.`);
    });
  }
  return errors;
}

function validateSubmit(body) {
  const errors = [];
  if (!body || typeof body !== "object") errors.push("Body must be an object.");
  if (!body?.playerName || typeof body.playerName !== "string")
    errors.push("playerName is required.");
  if (!Array.isArray(body?.answers)) errors.push("answers must be an array.");
  if (body?.meta != null && typeof body.meta !== "object") errors.push("meta must be an object.");
  if (Array.isArray(body?.answers)) {
    body.answers.forEach((a, idx) => {
      if (!a || typeof a !== "object") {
        errors.push(`answers[${idx}] must be an object.`);
        return;
      }
      if (typeof a.questionId !== "string") errors.push(`answers[${idx}].questionId is required.`);
      if (!Number.isInteger(a.selectedIndex))
        errors.push(`answers[${idx}].selectedIndex must be an integer.`);
    });
  }
  return errors;
}

function ensureSeeded() {
  updateDb((db) => {
    // Seed on first run
    if (db.quizzes.length === 0) return { ...db, quizzes: createQuizSeed() };

    // Backfill new fields for existing data (non-breaking "migration")
    const nextQuizzes = db.quizzes.map((q) => ({
      ...q,
      category: q.category ?? "General",
      settings: q.settings ?? { shuffleQuestions: true, timer: { mode: "off" } },
    }));
    return { ...db, quizzes: nextQuizzes };
  });
}

ensureSeeded();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// List quizzes
app.get("/api/quizzes", (_req, res) => {
  const db = loadDb();
  res.json({ quizzes: db.quizzes.map(toQuizSummary) });
});

// Create quiz (admin)
app.post("/api/quizzes", (req, res) => {
  const errors = validateCreateQuiz(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const quiz = {
    id: makeId("quiz"),
    title: req.body.title.trim(),
    description: req.body.description ?? "",
    category: (req.body.category ?? "General").trim?.() ?? "General",
    settings: req.body.settings ?? { shuffleQuestions: true, timer: { mode: "off" } },
    createdAt: nowIso(),
    questions: req.body.questions.map((q) => ({
      id: makeId("q"),
      question: q.question.trim(),
      options: q.options.map((o) => String(o)),
      correctIndex: q.correctIndex,
    })),
  };

  updateDb((db) => ({ ...db, quizzes: [quiz, ...db.quizzes] }));
  return res.status(201).json(toQuizSummary(quiz));
});

// Get quiz for taking (no correctIndex)
app.get("/api/quizzes/:id", (req, res) => {
  const db = loadDb();
  const quiz = db.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  return res.json(stripCorrectIndex(quiz));
});

// Submit quiz answers
app.post("/api/quizzes/:id/submit", (req, res) => {
  const errors = validateSubmit(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const db = loadDb();
  const quiz = db.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });

  const byId = new Map(quiz.questions.map((q) => [q.id, q]));
  const answersByQid = new Map(
    (req.body.answers || []).map((a) => [a.questionId, a.selectedIndex])
  );

  const results = quiz.questions.map((q) => {
    const selectedIndex = answersByQid.has(q.id) ? answersByQid.get(q.id) : -1;
    const isCorrect = selectedIndex === q.correctIndex;
    return {
      questionId: q.id,
      question: q.question,
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
    };
  });

  const score = results.reduce((acc, r) => acc + (r.isCorrect ? 1 : 0), 0);
  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

  const resultRecord = {
    id: makeId("result"),
    quizId: quiz.id,
    playerName: req.body.playerName.trim(),
    score,
    totalQuestions,
    percentage,
    answers: req.body.answers || [],
    meta: req.body.meta ?? null,
    completedAt: nowIso(),
  };

  updateDb((db2) => ({ ...db2, results: [resultRecord, ...db2.results] }));

  return res.json({
    resultId: resultRecord.id,
    quizId: quiz.id,
    score,
    totalQuestions,
    percentage,
    results,
    meta: resultRecord.meta ?? null,
    playerName: resultRecord.playerName,
    completedAt: resultRecord.completedAt,
  });
});

// Get a specific result (for share links)
app.get("/api/results/:resultId", (req, res) => {
  const db = loadDb();
  const rr = db.results.find((r) => r.id === req.params.resultId);
  if (!rr) return res.status(404).json({ error: "Result not found" });

  const quiz = db.quizzes.find((q) => q.id === rr.quizId);
  if (!quiz) return res.status(404).json({ error: "Quiz not found for result" });

  const answersByQid = new Map((rr.answers || []).map((a) => [a.questionId, a.selectedIndex]));
  const results = quiz.questions.map((q) => {
    const selectedIndex = answersByQid.has(q.id) ? answersByQid.get(q.id) : -1;
    const isCorrect = selectedIndex === q.correctIndex;
    return {
      questionId: q.id,
      question: q.question,
      selectedIndex,
      correctIndex: q.correctIndex,
      isCorrect,
    };
  });

  return res.json({
    quiz: stripCorrectIndex(quiz),
    result: {
      id: rr.id,
      quizId: rr.quizId,
      playerName: rr.playerName,
      score: rr.score,
      totalQuestions: rr.totalQuestions,
      percentage: rr.percentage,
      results,
      meta: rr.meta ?? null,
      completedAt: rr.completedAt,
    },
  });
});

// Leaderboard
app.get("/api/quizzes/:id/leaderboard", (req, res) => {
  const db = loadDb();
  const quiz = db.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });

  // Group by player name and keep only their best score
  const bestByPlayer = new Map();
  db.results
    .filter((r) => r.quizId === quiz.id)
    .forEach((r) => {
      const existing = bestByPlayer.get(r.playerName);
      if (
        !existing ||
        r.score > existing.score ||
        (r.score === existing.score && r.percentage > existing.percentage) ||
        (r.score === existing.score && r.percentage === existing.percentage && r.completedAt > existing.completedAt)
      ) {
        bestByPlayer.set(r.playerName, {
          playerName: r.playerName,
          score: r.score,
          percentage: r.percentage,
          completedAt: r.completedAt,
        });
      }
    });

  const leaderboard = Array.from(bestByPlayer.values())
    .sort((a, b) => {
      // Primary: score (descending)
      if (b.score !== a.score) return b.score - a.score;
      // Secondary: percentage (descending)
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      // Tertiary: most recent (descending) for stable sort
      return new Date(b.completedAt) - new Date(a.completedAt);
    })
    .slice(0, 20)
    .map((r) => ({ playerName: r.playerName, score: r.score, percentage: r.percentage }));

  return res.json({ leaderboard });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});



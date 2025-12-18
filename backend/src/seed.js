function nowIso() {
  return new Date().toISOString();
}

function createQuizSeed() {
  return [
    {
      id: "quiz_js_basics",
      title: "JavaScript Basics",
      description: "Test your JS knowledge",
      category: "JavaScript",
      settings: { shuffleQuestions: true, timer: { mode: "total", totalSeconds: 60 } },
      createdAt: nowIso(),
      questions: [
        {
          id: "q_js_1",
          question: "What is the typeof null?",
          options: ["null", "undefined", "object", "number"],
          correctIndex: 2,
        },
        {
          id: "q_js_2",
          question: "Which is not a primitive type?",
          options: ["string", "boolean", "array", "symbol"],
          correctIndex: 2,
        },
        {
          id: "q_js_3",
          question: "Which keyword declares a block-scoped variable?",
          options: ["var", "let", "function", "this"],
          correctIndex: 1,
        },
      ],
    },
    {
      id: "quiz_react_fundamentals",
      title: "React Fundamentals",
      description: "Components, hooks, and more",
      category: "React",
      settings: { shuffleQuestions: true, timer: { mode: "perQuestion", perQuestionSeconds: 20 } },
      createdAt: nowIso(),
      questions: [
        {
          id: "q_r_1",
          question: "Which hook is used for state in a function component?",
          options: ["useMemo", "useState", "useRef", "useCallback"],
          correctIndex: 1,
        },
        {
          id: "q_r_2",
          question: "Keys in lists help React with…",
          options: ["Animations", "Reconciliation", "Styling", "Routing"],
          correctIndex: 1,
        },
        {
          id: "q_r_3",
          question: "Which prop renders nested content?",
          options: ["children", "content", "slot", "nested"],
          correctIndex: 0,
        },
      ],
    },
  ];
}

module.exports = { createQuizSeed };



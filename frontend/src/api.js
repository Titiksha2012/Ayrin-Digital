import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:4000",
  timeout: 15000,
});

export async function listQuizzes() {
  const { data } = await api.get("/api/quizzes");
  return data.quizzes;
}

export async function getQuiz(id) {
  const { data } = await api.get(`/api/quizzes/${id}`);
  return data;
}

export async function submitQuiz(id, payload) {
  const { data } = await api.post(`/api/quizzes/${id}/submit`, payload);
  return data;
}

export async function getResult(resultId) {
  const { data } = await api.get(`/api/results/${resultId}`);
  return data;
}

export async function getLeaderboard(id) {
  const { data } = await api.get(`/api/quizzes/${id}/leaderboard`);
  return data.leaderboard;
}



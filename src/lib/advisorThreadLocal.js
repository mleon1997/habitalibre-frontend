// src/lib/advisorThreadLocal.js
const KEY = "hl_advisor_thread_v1";

export function readAdvisorThread() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function writeAdvisorThread(thread) {
  try {
    localStorage.setItem(KEY, JSON.stringify(thread || []));
  } catch {}
}

export function clearAdvisorThread() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export default { readAdvisorThread, writeAdvisorThread, clearAdvisorThread };

const ALLOWED_FOCUS_AREAS = ["frontend", "backend", "dsa"];
const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"];

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateInterviewConfig(payload = {}) {
  const techStack = normalizeText(payload.techStack);
  const focusArea = normalizeText(payload.focusArea).toLowerCase();
  const difficulty = normalizeText(payload.difficulty).toLowerCase();
  const topic = normalizeText(payload.topic);

  const errors = [];

  if (!techStack) {
    errors.push("techStack is required.");
  }

  if (!topic) {
    errors.push("topic is required.");
  }

  if (!ALLOWED_FOCUS_AREAS.includes(focusArea)) {
    errors.push(`focusArea must be one of: ${ALLOWED_FOCUS_AREAS.join(", ")}.`);
  }

  if (!ALLOWED_DIFFICULTIES.includes(difficulty)) {
    errors.push(
      `difficulty must be one of: ${ALLOWED_DIFFICULTIES.join(", ")}.`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: {
      techStack,
      focusArea,
      difficulty,
      topic,
    },
  };
}

export function normalizePerformanceReport(report = {}) {
  const score = Number.isFinite(Number(report.score))
    ? Math.min(10, Math.max(0, Number(report.score)))
    : 0;

  const normalizeList = (items) =>
    Array.isArray(items)
      ? items
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
          .slice(0, 5)
      : [];

  return {
    score,
    strengths: normalizeList(report.strengths),
    weaknesses: normalizeList(report.weaknesses),
    overallFeedback:
      typeof report.overallFeedback === "string" && report.overallFeedback.trim()
        ? report.overallFeedback.trim()
        : "The interview ended without enough signal for detailed feedback.",
  };
}

export { ALLOWED_DIFFICULTIES, ALLOWED_FOCUS_AREAS };

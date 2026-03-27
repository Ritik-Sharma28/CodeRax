export function buildInterviewRevisionSummary({
  config,
  performanceReport,
}) {
  const strengths =
    performanceReport.strengths.slice(0, 2).join(", ") || "None recorded";
  const weaknesses =
    performanceReport.weaknesses.slice(0, 3).join(", ") || "None recorded";

  return [
    `Mock interview topic: ${config.topic}.`,
    `Focus: ${config.focusArea}.`,
    `Difficulty: ${config.difficulty}.`,
    `Strengths: ${strengths}.`,
    `Weaknesses to revise: ${weaknesses}.`,
    `Coaching summary: ${performanceReport.overallFeedback}`,
  ].join(" ");
}

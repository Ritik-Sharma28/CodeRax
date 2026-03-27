const ALLOWED_ROLES = new Set(["user", "assistant", "system", "model"]);
const ALLOWED_SOURCES = new Set(["voice", "editor", "reconnect", "silence-prompt"]);

function normalizeRole(role) {
  if (!ALLOWED_ROLES.has(role)) {
    return "user";
  }

  if (role === "model") {
    return "assistant";
  }

  return role;
}

function toDate(value) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function normalizeTranscriptEntries(entries = []) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      const text =
        typeof entry?.text === "string"
          ? entry.text.trim()
          : typeof entry?.content === "string"
          ? entry.content.trim()
          : "";

      if (!text) {
        return null;
      }

      const source = ALLOWED_SOURCES.has(entry?.source)
        ? entry.source
        : "voice";

      return {
        role: normalizeRole(entry?.role || "user"),
        text,
        timestamp: toDate(entry?.timestamp),
        source,
      };
    })
    .filter(Boolean);
}

export function buildReplayTurns(transcript = [], limit = 10) {
  return transcript.slice(-limit).map((entry) => ({
    role: entry.role === "assistant" ? "model" : entry.role,
    parts: [{ text: entry.text }],
  }));
}

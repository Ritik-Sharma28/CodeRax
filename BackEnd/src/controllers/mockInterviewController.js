import MockInterview from "../models/mockInterview.js";
import RevisionMemory from "../models/revisionMemory.js";
import { getEmbedding } from "../utils/embedder.js";
import { buildInterviewRevisionSummary } from "../interview/summary.js";
import { normalizeTranscriptEntries } from "../interview/transcript.js";
import {
  createInterviewLiveToken,
  gradeInterviewSession,
} from "../interview/geminiService.js";
import {
  normalizePerformanceReport,
  validateInterviewConfig,
} from "../interview/validation.js";
import User from "../models/user.js";

function badRequest(res, message, details = []) {
  return res.status(400).json({
    error: "invalid_request",
    message,
    details,
  });
}

export async function generateLiveToken(req, res) {
  try {
    const validation = validateInterviewConfig(req.body);

    if (!validation.isValid) {
      return badRequest(res, "Interview configuration is invalid.", validation.errors);
    }

    const liveToken = await createInterviewLiveToken(validation.config);

    const user = await User.findById(req.result._id);
    if (user.role !== 'admin' && user.mockInterviewUseLeft > 0) {
        user.mockInterviewUseLeft -= 1;
        await user.save();
    }

    return res.status(200).json({
      ...liveToken,
      config: validation.config,
      mockInterviewUseLeft: user.mockInterviewUseLeft,
    });
  } catch (error) {
    console.error("generateLiveToken error:", error?.message || error);
    return res.status(500).json({
      error: "live_token_failed",
      message: "Failed to generate a Gemini live token.",
    });
  }
}

export async function gradeInterview(req, res) {
  try {
    const validation = validateInterviewConfig(req.body);

    if (!validation.isValid) {
      return badRequest(res, "Interview configuration is invalid.", validation.errors);
    }

    const transcript = normalizeTranscriptEntries(req.body.transcript);
    if (transcript.length === 0) {
      return badRequest(res, "Transcript is required.");
    }

    const performanceReport = await gradeInterviewSession({
      config: validation.config,
      transcript,
      finalCode: typeof req.body.finalCode === "string" ? req.body.finalCode : "",
    });

    return res.status(200).json({ performanceReport });
  } catch (error) {
    console.error("gradeInterview error:", error?.message || error);
    return res.status(500).json({
      error: "grading_failed",
      message: "Failed to grade the mock interview session.",
    });
  }
}

export async function saveInterviewSession(req, res) {
  try {
    const validation = validateInterviewConfig(req.body);

    if (!validation.isValid) {
      return badRequest(res, "Interview configuration is invalid.", validation.errors);
    }

    const transcript = normalizeTranscriptEntries(req.body.transcript);
    if (transcript.length === 0) {
      return badRequest(res, "Transcript is required.");
    }

    const finalCode = typeof req.body.finalCode === "string" ? req.body.finalCode : "";
    const status = ["completed", "abandoned", "timed_out"].includes(req.body.status)
      ? req.body.status
      : "completed";
    const durationSeconds = Number.isFinite(Number(req.body.durationSeconds))
      ? Math.max(0, Number(req.body.durationSeconds))
      : 0;
    const endedAt = req.body.endedAt ? new Date(req.body.endedAt) : new Date();

    const performanceReport = req.body.performanceReport
      ? normalizePerformanceReport(req.body.performanceReport)
      : await gradeInterviewSession({
          config: validation.config,
          transcript,
          finalCode,
        });

    const mockInterview = await MockInterview.create({
      userId: req.result._id,
      ...validation.config,
      transcript,
      finalCode,
      performanceReport,
      status,
      durationSeconds,
      endedAt: Number.isNaN(endedAt.getTime()) ? new Date() : endedAt,
    });

    const summary = buildInterviewRevisionSummary({
      config: validation.config,
      performanceReport,
    });

    const vector = await getEmbedding(summary);

    await RevisionMemory.create({
      userId: req.result._id,
      topic: validation.config.topic,
      summary,
      sourceType: "interview",
      vector,
    });

    return res.status(201).json({
      mockInterviewId: mockInterview._id,
      performanceReport,
    });
  } catch (error) {
    console.error("saveInterviewSession error:", error?.message || error);
    return res.status(500).json({
      error: "session_save_failed",
      message: "Failed to save the mock interview session.",
    });
  }
}

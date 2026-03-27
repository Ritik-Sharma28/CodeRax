import { GoogleGenAI } from "@google/genai";
import {
  buildGradingContents,
  buildLiveSystemInstruction,
} from "./prompts.js";
import { normalizePerformanceReport } from "./validation.js";

let geminiClient;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return geminiClient;
}

export function getLiveModel() {
  return (
    process.env.GEMINI_LIVE_MODEL ||
    "gemini-live-2.5-flash-native-audio"
  );
}

export function getGradingModel() {
  return process.env.GEMINI_GRADING_MODEL || "gemini-2.5-flash";
}

export async function createInterviewLiveToken(config) {
  const client = getGeminiClient();
  const liveModel = getLiveModel();
  
  const minutes = config.difficulty === "easy" ? 3 : config.difficulty === "medium" ? 5 : 7;
  const expireTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  
  const systemInstruction = buildLiveSystemInstruction(config);

  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime,
      liveConnectConstraints: {
        model: liveModel,
        config: {
          responseModalities: ["AUDIO"],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          temperature: 0.7,
          sessionResumption: {},
          systemInstruction,
        },
      },
      httpOptions: {
        apiVersion: "v1alpha",
      },
    },
  });

  return {
    token: token.name,
    expireTime: token.expireTime || expireTime,
    newSessionExpireTime: token.newSessionExpireTime || null,
    model: liveModel,
    systemInstruction,
  };
}

export async function gradeInterviewSession({ config, transcript, finalCode }) {
  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model: getGradingModel(),
    contents: buildGradingContents({ config, transcript, finalCode }),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          score: { type: "number" },
          strengths: {
            type: "array",
            items: { type: "string" },
          },
          weaknesses: {
            type: "array",
            items: { type: "string" },
          },
          overallFeedback: { type: "string" },
        },
        required: ["score", "strengths", "weaknesses", "overallFeedback"],
      },
    },
  });

  let parsed;

  try {
    parsed = response?.text ? JSON.parse(response.text) : response?.parsed;
  } catch (error) {
    throw new Error("Gemini grading returned invalid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini grading returned an empty response.");
  }

  return normalizePerformanceReport(parsed);
}

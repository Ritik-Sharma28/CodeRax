import { GoogleGenAI, Modality } from "@google/genai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from '../../components/Navbar';
import mockInterviewService from '../../services/mockInterviewService';

const QUICK_START_TOPICS = [
  "Binary Search on Answer",
  "Sliding Window",
  "Two Pointers",
  "DFS and Backtracking",
  "Dynamic Programming",
  "Graph BFS",
  "Heap-based Top K",
  "Monotonic Stack",
];

const FOCUS_AREAS = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "dsa", label: "DSA" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const getDurationForDifficulty = (diff) => {
    switch (diff) {
        case 'easy': return 3 * 60 * 1000;
        case 'hard': return 7 * 60 * 1000;
        case 'medium':
        default: return 5 * 60 * 1000;
    }
};

const SILENCE_TIMEOUT_MS = 45 * 1000;
const RECONNECT_DELAY_MS = 1500;
const MAX_RECONNECTS = 3;
const MANUAL_RETRY_COOLDOWN_MS = 60 * 1000;

function joinClassNames(...values) {
  return values.filter(Boolean).join(" ");
}

function pcm16ToBase64(int16Array) {
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return window.btoa(binary);
}

function base64ToInt16Array(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Int16Array(bytes.buffer);
}

function parseSampleRate(mimeType) {
  const match = typeof mimeType === "string" ? mimeType.match(/rate=(\d+)/i) : null;
  return match ? Number(match[1]) : 24000;
}

function downsampleFloat32Buffer(buffer, inputRate, outputRate) {
  if (inputRate === outputRate) {
    return buffer;
  }

  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accumulator = 0;
    let count = 0;

    for (let index = offsetBuffer; index < nextOffsetBuffer && index < buffer.length; index += 1) {
      accumulator += buffer[index];
      count += 1;
    }

    result[offsetResult] = count > 0 ? accumulator / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

function floatTo16BitPCM(float32Array) {
  const output = new Int16Array(float32Array.length);

  for (let index = 0; index < float32Array.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[index]));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return output;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function mergeStreamingText(previousText, incomingText) {
  const prev = typeof previousText === "string" ? previousText.trim() : "";
  const next = typeof incomingText === "string" ? incomingText.trim() : "";

  if (!prev) {
    return next;
  }

  if (!next) {
    return prev;
  }

  if (next.startsWith(prev)) {
    return next;
  }

  if (prev.endsWith(next)) {
    return prev;
  }

  return `${prev} ${next}`.replace(/\s+/g, " ").trim();
}

function Visualizer({ levels, darkMode, accent = "emerald" }) {
  const activeBarClass =
    accent === "cyan"
      ? darkMode
        ? "from-cyan-400 to-blue-500"
        : "from-cyan-500 to-blue-600"
      : darkMode
      ? "from-emerald-400 to-teal-500"
      : "from-emerald-500 to-teal-600";

  return (
    <div className="flex h-16 items-end justify-center gap-1.5">
      {levels.map((level, index) => (
        <div
          key={index}
          className={joinClassNames(
            "w-2 rounded-full bg-gradient-to-t transition-all duration-150",
            activeBarClass
          )}
          style={{
            height: `${Math.max(12, Math.round(level * 100))}%`,
            opacity: Math.max(0.35, level),
          }}
        />
      ))}
    </div>
  );
}

function TranscriptBubble({ entry, darkMode }) {
  const isUser = entry.role === "user";

  return (
    <div className={joinClassNames("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={joinClassNames(
          "max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? darkMode
              ? "bg-emerald-600 text-white"
              : "bg-emerald-500 text-white"
            : darkMode
            ? "border border-slate-700 bg-slate-800 text-slate-200"
            : "border border-slate-200 bg-white text-slate-700"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{entry.text}</p>
        <p className={joinClassNames("mt-2 text-[10px]", isUser ? "text-white/70" : darkMode ? "text-slate-500" : "text-slate-400")}>
          {new Date(entry.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {entry.source ? ` • ${entry.source}` : ""}
        </p>
      </div>
    </div>
  );
}

export default function MockInterviewPage() {
  const user = useSelector((state) => state.auth.user);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [phase, setPhase] = useState("setup");
  const [form, setForm] = useState({
    techStack: "JavaScript, React, Node.js",
    focusArea: "dsa",
    difficulty: "medium",
    topic: "Sliding Window",
  });
  const [code, setCode] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [statusText, setStatusText] = useState("Waiting to start");
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [performanceReport, setPerformanceReport] = useState(null);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mobileLiveTab, setMobileLiveTab] = useState("chat");
  const [lastEditorSyncAt, setLastEditorSyncAt] = useState(null);
  const [lastRetryAttemptAt, setLastRetryAttemptAt] = useState(null);
  const [retryCooldownLeft, setRetryCooldownLeft] = useState(0);
  const [showManualReconnect, setShowManualReconnect] = useState(false);
  const [assistantLevels, setAssistantLevels] = useState(() => Array.from({ length: 20 }, () => 0.18));
  const [micLevels, setMicLevels] = useState(() => Array.from({ length: 20 }, () => 0.12));

  const transcriptEndRef = useRef(null);
  const sessionRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const processorRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const outputAnalyserRef = useRef(null);
  const outputGainRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimestampRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const silenceIntervalRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const isIntentionalCloseRef = useRef(false);
  const lastSentCodeRef = useRef("");
  const playbackQueueRef = useRef(Promise.resolve());
  const latestConfigRef = useRef(form);
  const reconnectingRef = useRef(false);
  const transcriptRef = useRef(transcript);
  const codeRef = useRef(code);
  const phaseRef = useRef(phase);
  const userPartialRef = useRef("");
  const assistantPartialRef = useRef("");
  const hasEverConnectedRef = useRef(false);
  const persistBlockedRef = useRef(false);
  const retryCooldownIntervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    latestConfigRef.current = form;
  }, [form]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (phase !== "live" || !sessionRef.current) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      if (code !== lastSentCodeRef.current) {
        pushEditorUpdate(code);
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [code, phase]);

  useEffect(() => {
    return () => {
      cleanupSessionResources();
    };
  }, []);

  useEffect(() => {
    if (!lastRetryAttemptAt) {
      setRetryCooldownLeft(0);
      if (retryCooldownIntervalRef.current) {
        window.clearInterval(retryCooldownIntervalRef.current);
        retryCooldownIntervalRef.current = null;
      }
      return undefined;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        MANUAL_RETRY_COOLDOWN_MS - (Date.now() - lastRetryAttemptAt)
      );
      setRetryCooldownLeft(Math.ceil(remaining / 1000));

      if (remaining <= 0 && retryCooldownIntervalRef.current) {
        window.clearInterval(retryCooldownIntervalRef.current);
        retryCooldownIntervalRef.current = null;
      }
    };

    tick();
    retryCooldownIntervalRef.current = window.setInterval(tick, 1000);

    return () => {
      if (retryCooldownIntervalRef.current) {
        window.clearInterval(retryCooldownIntervalRef.current);
        retryCooldownIntervalRef.current = null;
      }
    };
  }, [lastRetryAttemptAt]);

  const setupSummary = useMemo(
    () => [
      { label: "Tech Stack", value: form.techStack },
      { label: "Focus", value: form.focusArea },
      { label: "Difficulty", value: form.difficulty },
      { label: "Topic", value: form.topic },
    ],
    [form]
  );

  function appendTranscriptEntry(entry) {
    lastActivityRef.current = Date.now();
    setTranscript((current) => [
      ...current,
      {
        timestamp: new Date().toISOString(),
        source: "voice",
        ...entry,
      },
    ]);
  }

  function upsertStreamingEntry(role, text, source = "voice") {
    const nextText = typeof text === "string" ? text.trim() : "";
    if (!nextText) {
      return;
    }

    lastActivityRef.current = Date.now();
    setTranscript((current) => {
      const nextEntries = [...current];
      const lastEntry = nextEntries[nextEntries.length - 1];

      if (lastEntry && lastEntry.role === role && lastEntry.source === source && lastEntry.isStreaming) {
        nextEntries[nextEntries.length - 1] = {
          ...lastEntry,
          text: nextText,
          timestamp: new Date().toISOString(),
        };
        return nextEntries;
      }

      nextEntries.push({
        role,
        text: nextText,
        source,
        timestamp: new Date().toISOString(),
        isStreaming: true,
      });
      return nextEntries;
    });
  }

  function finalizeStreamingEntry(role, source = "voice") {
    setTranscript((current) => {
      const nextEntries = [...current];
      for (let index = nextEntries.length - 1; index >= 0; index -= 1) {
        const entry = nextEntries[index];
        if (entry.role === role && entry.source === source && entry.isStreaming) {
          nextEntries[index] = {
            ...entry,
            isStreaming: false,
          };
          break;
        }
      }
      return nextEntries;
    });
  }

  function updateVisualizer() {
    const nextAssistantLevels = Array.from({ length: 20 }, () => 0.1);
    const nextMicLevels = Array.from({ length: 20 }, () => 0.1);

    if (outputAnalyserRef.current) {
      const data = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
      outputAnalyserRef.current.getByteFrequencyData(data);

      for (let index = 0; index < nextAssistantLevels.length; index += 1) {
        const sample = data[Math.floor((index / nextAssistantLevels.length) * data.length)] || 0;
        nextAssistantLevels[index] = Math.max(0.12, sample / 255);
      }
    }

    if (micAnalyserRef.current) {
      const data = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
      micAnalyserRef.current.getByteFrequencyData(data);

      for (let index = 0; index < nextMicLevels.length; index += 1) {
        const sample = data[Math.floor((index / nextMicLevels.length) * data.length)] || 0;
        nextMicLevels[index] = Math.max(0.1, sample / 255);
      }
    }

    setAssistantLevels(nextAssistantLevels);
    setMicLevels(nextMicLevels);
    animationFrameRef.current = window.requestAnimationFrame(updateVisualizer);
  }

  async function ensureAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
      outputGainRef.current = audioContextRef.current.createGain();
      outputAnalyserRef.current = audioContextRef.current.createAnalyser();
      outputAnalyserRef.current.fftSize = 256;
      outputGainRef.current.connect(outputAnalyserRef.current);
      outputAnalyserRef.current.connect(audioContextRef.current.destination);
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
  }

  async function startMicrophoneCapture() {
    await ensureAudioContext();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    micStreamRef.current = stream;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    micAnalyserRef.current = analyser;

    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    source.connect(analyser);
    analyser.connect(processor);
    processor.connect(audioContextRef.current.destination);

    processor.onaudioprocess = (event) => {
      if (!sessionRef.current || isMuted) {
        return;
      }

      const input = event.inputBuffer.getChannelData(0);
      const downsampled = downsampleFloat32Buffer(
        input,
        audioContextRef.current.sampleRate,
        16000
      );

      let peak = 0;
      for (let index = 0; index < downsampled.length; index += 1) {
        peak = Math.max(peak, Math.abs(downsampled[index]));
      }

      if (peak > 0.015) {
        lastActivityRef.current = Date.now();
      }

      const pcm = floatTo16BitPCM(downsampled);

      sessionRef.current.sendRealtimeInput({
        audio: {
          data: pcm16ToBase64(pcm),
          mimeType: "audio/pcm;rate=16000",
        },
      });
    };
  }

  async function playPcmChunk(base64Data, mimeType) {
    await ensureAudioContext();

    const int16Data = base64ToInt16Array(base64Data);
    const float32 = new Float32Array(int16Data.length);

    for (let index = 0; index < int16Data.length; index += 1) {
      float32[index] = int16Data[index] / 0x8000;
    }

    const sampleRate = parseSampleRate(mimeType);

    playbackQueueRef.current = playbackQueueRef.current.then(
      () =>
        new Promise((resolve) => {
          const buffer = audioContextRef.current.createBuffer(1, float32.length, sampleRate);
          buffer.copyToChannel(float32, 0);

          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(outputGainRef.current);
          source.onended = resolve;
          source.start();
        })
    );

    return playbackQueueRef.current;
  }

  function startIntervals() {
    stopIntervals();

    durationIntervalRef.current = window.setInterval(() => {
      if (!startTimestampRef.current) {
        return;
      }

      const elapsed = Math.floor((Date.now() - startTimestampRef.current) / 1000);
      setElapsedSeconds(elapsed);

      if (Date.now() - startTimestampRef.current >= getDurationForDifficulty(latestConfigRef.current.difficulty)) {
        handleEndInterview("timed_out");
      }
    }, 1000);

    silenceIntervalRef.current = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current < SILENCE_TIMEOUT_MS) {
        return;
      }

      if (!sessionRef.current || reconnectingRef.current) {
        return;
      }

      lastActivityRef.current = Date.now();

      sessionRef.current.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [
              {
                text: "The candidate has been silent for a while. Briefly ask whether they want a hint or clarification, then continue the interview.",
              },
            ],
          },
        ],
        turnComplete: true,
      });

      setTranscript((current) => [
        ...current,
        {
          role: "system",
          text: "Hidden prompt injected after 45 seconds of silence.",
          source: "silence-prompt",
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 5000);

    if (!animationFrameRef.current) {
      animationFrameRef.current = window.requestAnimationFrame(updateVisualizer);
    }
  }

  function stopIntervals() {
    if (durationIntervalRef.current) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (silenceIntervalRef.current) {
      window.clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (retryCooldownIntervalRef.current) {
      window.clearInterval(retryCooldownIntervalRef.current);
      retryCooldownIntervalRef.current = null;
    }
  }

  function cleanupSessionResources() {
    stopIntervals();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (error) {
        console.warn("Failed to close live session cleanly:", error);
      }
      sessionRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    micAnalyserRef.current = null;
    outputAnalyserRef.current = null;
    outputGainRef.current = null;
    playbackQueueRef.current = Promise.resolve();
    userPartialRef.current = "";
    assistantPartialRef.current = "";
  }

  async function connectLiveSession(tokenBundle, config, replay = false) {
    const client = new GoogleGenAI({
      apiKey: tokenBundle.token,
      httpOptions: {
        apiVersion: "v1alpha",
      },
    });

    setStatusText(replay ? "Reconnecting to interviewer..." : "Connecting to interviewer...");

    const session = await client.live.connect({
      model: tokenBundle.model,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        temperature: 0.7,
        systemInstruction: tokenBundle.systemInstruction,
      },
      callbacks: {
        onmessage: async (message) => {
          const serverContent = message?.serverContent;
          if (!serverContent) {
            return;
          }

          if (serverContent.interrupted) {
            assistantPartialRef.current = "";
            finalizeStreamingEntry("assistant", "voice");
          }

          if (serverContent.inputTranscription?.text) {
            userPartialRef.current = mergeStreamingText(
              userPartialRef.current,
              serverContent.inputTranscription.text
            );
            upsertStreamingEntry("user", userPartialRef.current, "voice");
          }

          if (serverContent.outputTranscription?.text) {
            assistantPartialRef.current = mergeStreamingText(
              assistantPartialRef.current,
              serverContent.outputTranscription.text
            );
            upsertStreamingEntry("assistant", assistantPartialRef.current, "voice");
          }

          if (Array.isArray(serverContent.modelTurn?.parts)) {
            for (const part of serverContent.modelTurn.parts) {
              if (part.text && !assistantPartialRef.current) {
                assistantPartialRef.current = mergeStreamingText(
                  assistantPartialRef.current,
                  part.text
                );
                upsertStreamingEntry("assistant", assistantPartialRef.current, "voice");
              }
              if (part.inlineData?.data) {
                await playPcmChunk(part.inlineData.data, part.inlineData.mimeType);
              }
            }
          }

          if (serverContent.turnComplete || serverContent.generationComplete) {
            if (userPartialRef.current) {
              finalizeStreamingEntry("user", "voice");
              userPartialRef.current = "";
            }

            if (assistantPartialRef.current) {
              finalizeStreamingEntry("assistant", "voice");
              assistantPartialRef.current = "";
            }
          }
        },
        onerror: (liveError) => {
          console.error("Gemini live session error:", liveError);
          setError("The live interview connection failed. Attempting to reconnect.");
          scheduleReconnect();
        },
        onclose: () => {
          if (isIntentionalCloseRef.current) {
            return;
          }

          setStatusText("Connection dropped");
          scheduleReconnect();
        },
      },
    });

    sessionRef.current = session;
    reconnectingRef.current = false;
    hasEverConnectedRef.current = true;
    persistBlockedRef.current = false;
    setShowManualReconnect(false);
    setStatusText("Live interview in progress");

    if (replay) {
      const replayTurns = transcriptRef.current.slice(-10).map((entry) => ({
        role: entry.role === "assistant" ? "model" : entry.role,
        parts: [{ text: entry.text }],
      }));

      if (replayTurns.length > 0) {
        session.sendClientContent({
          turns: replayTurns,
          turnComplete: false,
        });
      }

      if (codeRef.current.trim()) {
        session.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: `Current whiteboard snapshot:\n\`\`\`\n${codeRef.current}\n\`\`\``,
                },
              ],
            },
          ],
          turnComplete: false,
        });
      }

      setTranscript((current) => [
        ...current,
        {
          role: "system",
          text: "Interview session reconnected and context restored.",
          source: "reconnect",
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [
              {
                text: [
                  "Interview setup for this session:",
                  `Topic: ${config.topic}`,
                  `Tech stack: ${config.techStack}`,
                  `Focus area: ${config.focusArea}`,
                  `Difficulty: ${config.difficulty}`,
                  "This is a whiteboard interview. There is no code execution. Evaluate the candidate using reasoning, syntax quality, debugging, tradeoffs, and communication.",
                  `You have ${getDurationForDifficulty(config.difficulty) / 60000} minutes for this interview. Please pace your questions accordingly.`,
                  "Keep the candidate on-topic even if they ask unrelated questions.",
                ].join("\n"),
              },
            ],
          },
        ],
        turnComplete: false,
      });

      session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [
              {
                text: `Start the mock interview now. Briefly acknowledge the context and ask your first interview question about ${config.topic}.`,
              },
            ],
          },
        ],
        turnComplete: true,
      });
    }
  }

  async function scheduleReconnect() {
    if (reconnectingRef.current || isIntentionalCloseRef.current || phaseRef.current !== "live") {
      return;
    }

    if (reconnectCountRef.current >= MAX_RECONNECTS) {
      persistBlockedRef.current = true;
      setShowManualReconnect(true);
      setError("The interview could not reconnect after multiple attempts. Please end the session and try again.");
      setStatusText("Reconnect failed");
      return;
    }

    reconnectingRef.current = true;
    reconnectCountRef.current += 1;
    setStatusText(`Reconnecting (${reconnectCountRef.current}/${MAX_RECONNECTS})...`);

    window.setTimeout(async () => {
      try {
        setLastRetryAttemptAt(Date.now());
        const tokenBundle = await mockInterviewService.generateLiveToken(latestConfigRef.current);
        await connectLiveSession(tokenBundle, latestConfigRef.current, true);
      } catch (reconnectError) {
        console.error("Reconnect failed:", reconnectError);
        reconnectingRef.current = false;
        setError(
            reconnectError?.response?.data?.message ||
            reconnectError?.message ||
            "Reconnect failed."
        );

        if (reconnectCountRef.current >= MAX_RECONNECTS) {
          persistBlockedRef.current = true;
          setShowManualReconnect(true);
          setStatusText("Reconnect failed");
        }
      }
    }, RECONNECT_DELAY_MS);
  }

  async function handleManualReconnect() {
    if (retryCooldownLeft > 0 || reconnectingRef.current || phaseRef.current !== "live") {
      return;
    }

    setError("");
    setShowManualReconnect(false);
    reconnectCountRef.current = 0;
    reconnectingRef.current = false;
    setLastRetryAttemptAt(Date.now());
    await scheduleReconnect();
  }

  function pushEditorUpdate(nextCode) {
    if (!sessionRef.current) {
      return;
    }

    lastSentCodeRef.current = nextCode;
    lastActivityRef.current = Date.now();
    setLastEditorSyncAt(new Date().toISOString());

    sessionRef.current.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [
            {
              text: `Whiteboard update from the candidate:\n\`\`\`\n${nextCode || "// Candidate cleared the editor"}\n\`\`\`\nUse this as the latest code context.`,
            },
          ],
        },
      ],
      turnComplete: false,
    });
  }

  async function handleStartInterview() {
    if (!form.techStack.trim() || !form.topic.trim()) {
      setError("Please fill in the tech stack and topic before starting.");
      return;
    }

    setError("");
    setIsStarting(true);
    setPerformanceReport(null);
    setSessionMeta(null);
    setTranscript([]);
    setCode("");
    setMobileLiveTab("chat");
    setLastEditorSyncAt(null);
    setLastRetryAttemptAt(null);
    setRetryCooldownLeft(0);
    setShowManualReconnect(false);
    lastSentCodeRef.current = "";
    reconnectCountRef.current = 0;
    isIntentionalCloseRef.current = false;
    hasEverConnectedRef.current = false;
    persistBlockedRef.current = false;
    userPartialRef.current = "";
    assistantPartialRef.current = "";

    try {
      const tokenBundle = await mockInterviewService.generateLiveToken(form);
      await startMicrophoneCapture();
      await connectLiveSession(tokenBundle, form, false);

      startTimestampRef.current = Date.now();
      lastActivityRef.current = Date.now();
      setElapsedSeconds(0);
      setPhase("live");
      startIntervals();
    } catch (startError) {
      console.error("Failed to start interview:", startError);
      setError(
        startError?.response?.data?.message ||
          startError?.message ||
          "Failed to start the mock interview."
      );
      cleanupSessionResources();
    } finally {
      setIsStarting(false);
    }
  }

  async function handleEndInterview(status = "completed") {
    if (isEnding) {
      return;
    }

    setIsEnding(true);
    setStatusText("Finalizing interview...");
    isIntentionalCloseRef.current = true;

    try {
      cleanupSessionResources();

      if (!hasEverConnectedRef.current || persistBlockedRef.current) {
        setPerformanceReport(null);
        setSessionMeta(null);
        setPhase("setup");
        setStatusText("Interview discarded");
        setError(
          persistBlockedRef.current
            ? "This interview was discarded because the live session failed to reconnect."
            : "This interview was discarded because the live session never connected."
        );
        return;
      }

      const durationSeconds = startTimestampRef.current
        ? Math.floor((Date.now() - startTimestampRef.current) / 1000)
        : elapsedSeconds;

      const payload = {
        ...latestConfigRef.current,
        transcript: transcriptRef.current,
        finalCode: codeRef.current,
        durationSeconds,
        endedAt: new Date().toISOString(),
        status,
      };

      const gradeResponse = await mockInterviewService.gradeInterview(payload);
      const report = gradeResponse.performanceReport;
      setPerformanceReport(report);

      const saveResponse = await mockInterviewService.saveInterviewSession({
        ...payload,
        performanceReport: report,
      });

      setSessionMeta(saveResponse);
      setPhase("result");
      setStatusText("Interview complete");
    } catch (endError) {
      console.error("Failed to end interview:", endError);
      setError(
        endError?.response?.data?.message ||
          endError?.message ||
          "Failed to finalize the interview."
      );
    } finally {
      setIsEnding(false);
    }
  }

  function handleQuickStart() {
    const topic = QUICK_START_TOPICS[Math.floor(Math.random() * QUICK_START_TOPICS.length)];
    setForm((current) => ({
      ...current,
      focusArea: "dsa",
      difficulty: "medium",
      topic,
    }));
  }

  function resetFlow() {
    setPhase("setup");
    setPerformanceReport(null);
    setSessionMeta(null);
    setTranscript([]);
    setCode("");
    setElapsedSeconds(0);
    setError("");
    setStatusText("Waiting to start");
    setMobileLiveTab("chat");
    setLastEditorSyncAt(null);
    setLastRetryAttemptAt(null);
    setRetryCooldownLeft(0);
    setShowManualReconnect(false);
    hasEverConnectedRef.current = false;
    persistBlockedRef.current = false;
  }

  return (
    <div className={joinClassNames("min-h-screen transition-colors duration-300", darkMode ? "bg-slate-950" : "bg-slate-50")}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {phase === "setup" && (
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section
              className={joinClassNames(
                "rounded-3xl border p-8 shadow-xl",
                darkMode
                  ? "border-slate-800 bg-slate-900/90"
                  : "border-slate-200 bg-white"
              )}
            >
              <div className="mb-8">
                <span
                  className={joinClassNames(
                    "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]",
                    darkMode ? "bg-cyan-500/10 text-cyan-300" : "bg-cyan-50 text-cyan-700"
                  )}
                >
                  Mock AI Interview ({user?.role === 'admin' ? 'Unlimited' : user?.mockInterviewUseLeft ?? 0} uses left today)
                </span>
                <h1 className={joinClassNames("mt-4 text-4xl font-black tracking-tight", darkMode ? "text-white" : "text-slate-900")}>
                  Set up a whiteboard interview that feels like a real screen.
                </h1>
                <p className={joinClassNames("mt-3 max-w-2xl text-sm leading-7", darkMode ? "text-slate-400" : "text-slate-600")}>
                  The interviewer will talk through your reasoning, react to your whiteboard code, and grade the full session afterward. No compiler, no execution, just logic and communication.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className={joinClassNames("text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>Tech Stack</span>
                  <input
                    value={form.techStack}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, techStack: event.target.value }))
                    }
                    placeholder="React, Node.js, TypeScript"
                    className={joinClassNames(
                      "rounded-2xl border px-4 py-3 text-sm outline-none transition",
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                    )}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className={joinClassNames("text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>Focus Area</span>
                  <select
                    value={form.focusArea}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, focusArea: event.target.value }))
                    }
                    className={joinClassNames(
                      "rounded-2xl border px-4 py-3 text-sm outline-none transition",
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-cyan-400"
                        : "border-slate-200 bg-white text-slate-900 focus:border-cyan-500"
                    )}
                  >
                    {FOCUS_AREAS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className={joinClassNames("text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>Difficulty</span>
                  <select
                    value={form.difficulty}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, difficulty: event.target.value }))
                    }
                    className={joinClassNames(
                      "rounded-2xl border px-4 py-3 text-sm outline-none transition",
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-cyan-400"
                        : "border-slate-200 bg-white text-slate-900 focus:border-cyan-500"
                    )}
                  >
                    {DIFFICULTIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className={joinClassNames("text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>Interview Topic</span>
                  <input
                    value={form.topic}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, topic: event.target.value }))
                    }
                    placeholder="Binary Search on Answer"
                    className={joinClassNames(
                      "rounded-2xl border px-4 py-3 text-sm outline-none transition",
                      darkMode
                        ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                    )}
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={handleStartInterview}
                  disabled={isStarting}
                  className={joinClassNames(
                    "inline-flex items-center rounded-2xl px-6 py-3 text-sm font-bold transition",
                    isStarting
                      ? "cursor-not-allowed bg-slate-400 text-white"
                      : "bg-cyan-600 text-white hover:bg-cyan-500"
                  )}
                >
                  {isStarting ? "Starting..." : "Start Interview"}
                </button>
                <button
                  onClick={handleQuickStart}
                  className={joinClassNames(
                    "inline-flex items-center rounded-2xl border px-6 py-3 text-sm font-bold transition",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-cyan-300"
                      : "border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
                  )}
                >
                  Quick Start DSA
                </button>
              </div>

              {error && (
                <div
                  className={joinClassNames(
                    "mt-6 rounded-2xl border px-4 py-3 text-sm",
                    darkMode
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {error}
                </div>
              )}
            </section>

            <aside
              className={joinClassNames(
                "rounded-3xl border p-8",
                darkMode
                  ? "border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40"
                  : "border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-slate-100"
              )}
            >
              <h2 className={joinClassNames("text-xl font-black", darkMode ? "text-white" : "text-slate-900")}>
                Interview preview
              </h2>
              <div className="mt-6 space-y-4">
                {setupSummary.map((item) => (
                  <div
                    key={item.label}
                    className={joinClassNames(
                      "rounded-2xl border px-4 py-4",
                      darkMode ? "border-slate-800 bg-slate-950/60" : "border-white/70 bg-white/80"
                    )}
                  >
                    <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.18em]", darkMode ? "text-slate-500" : "text-slate-400")}>
                      {item.label}
                    </p>
                    <p className={joinClassNames("mt-2 text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-800")}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-dashed border-cyan-400/40 px-4 py-4">
                <p className={joinClassNames("text-sm leading-7", darkMode ? "text-slate-300" : "text-slate-700")}>
                  The AI interviewer will listen to your voice, inspect your whiteboard updates every 1.5 seconds after you pause typing, and keep the conversation focused on the chosen topic.
                </p>
              </div>
            </aside>
          </div>
        )}

        {phase === "live" && (
          <div className="space-y-4">
            <div className={joinClassNames("flex items-center gap-2 rounded-2xl border p-1 lg:hidden", darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white")}>
              <button
                onClick={() => setMobileLiveTab("chat")}
                className={joinClassNames(
                  "flex-1 rounded-xl px-4 py-2 text-sm font-bold transition",
                  mobileLiveTab === "chat"
                    ? "bg-cyan-600 text-white"
                    : darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                )}
              >
                Interviewer
              </button>
              <button
                onClick={() => setMobileLiveTab("editor")}
                className={joinClassNames(
                  "flex-1 rounded-xl px-4 py-2 text-sm font-bold transition",
                  mobileLiveTab === "editor"
                    ? "bg-emerald-600 text-white"
                    : darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                )}
              >
                Editor
              </button>
            </div>

            <div className="grid gap-6 lg:h-[calc(100vh-8rem)] lg:grid-cols-[0.92fr_1.08fr]">
            <section
              className={joinClassNames(
                "flex min-h-[70vh] flex-col rounded-3xl border lg:min-h-0 lg:h-full",
                mobileLiveTab !== "chat" ? "hidden lg:flex" : "",
                darkMode ? "border-slate-800 bg-slate-900/90" : "border-slate-200 bg-white"
              )}
            >
              <div className={joinClassNames("border-b px-6 py-5", darkMode ? "border-slate-800" : "border-slate-200")}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.2em]", darkMode ? "text-cyan-300" : "text-cyan-700")}>
                      AI Interviewer
                    </p>
                    <h2 className={joinClassNames("mt-2 text-2xl font-black", darkMode ? "text-white" : "text-slate-900")}>
                      {form.topic}
                    </h2>
                    <p className={joinClassNames("mt-1 text-sm", darkMode ? "text-slate-400" : "text-slate-500")}>
                      {statusText}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={joinClassNames("rounded-2xl px-4 py-3 text-sm font-semibold", darkMode ? "bg-slate-950 text-slate-200" : "bg-slate-100 text-slate-700")}>
                      {formatDuration(Math.max(0, getDurationForDifficulty(form.difficulty) / 1000 - elapsedSeconds))}
                    </div>
                    {showManualReconnect && (
                      <button
                        onClick={handleManualReconnect}
                        disabled={retryCooldownLeft > 0 || reconnectingRef.current}
                        className={joinClassNames(
                          "rounded-2xl px-4 py-3 text-sm font-bold transition",
                          retryCooldownLeft > 0 || reconnectingRef.current
                            ? "cursor-not-allowed bg-slate-400 text-white"
                            : "bg-cyan-600 text-white hover:bg-cyan-500"
                        )}
                      >
                        {retryCooldownLeft > 0
                          ? `Retry in ${retryCooldownLeft}s`
                          : reconnectingRef.current
                          ? "Retrying..."
                          : "Retry Connection"}
                      </button>
                    )}
                    <button
                      onClick={() => setIsMuted((current) => !current)}
                      className={joinClassNames(
                        "rounded-2xl px-4 py-3 text-sm font-bold transition",
                        isMuted
                          ? "bg-amber-500 text-white hover:bg-amber-400"
                          : darkMode
                          ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      )}
                    >
                      {isMuted ? "Unmute" : "Mute"}
                    </button>
                    <button
                      onClick={() => handleEndInterview("completed")}
                      disabled={isEnding}
                      className={joinClassNames(
                        "rounded-2xl px-4 py-3 text-sm font-bold transition",
                        isEnding ? "bg-slate-400 text-white" : "bg-rose-600 text-white hover:bg-rose-500"
                      )}
                    >
                      {isEnding ? "Ending..." : "End Interview"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <div
                  className={joinClassNames(
                    "rounded-3xl border p-6",
                    darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50"
                  )}
                >
                  <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.18em]", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Assistant Voice
                  </p>
                  <div className="mt-5">
                    <Visualizer levels={assistantLevels} darkMode={darkMode} accent="cyan" />
                  </div>
                </div>
                <div
                  className={joinClassNames(
                    "rounded-3xl border p-6",
                    darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50"
                  )}
                >
                  <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.18em]", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Your Mic
                  </p>
                  <div className="mt-5">
                    <Visualizer levels={micLevels} darkMode={darkMode} accent="emerald" />
                  </div>
                </div>
              </div>
              {error && (
                <div
                  className={joinClassNames(
                    "mx-6 rounded-2xl border px-4 py-3 text-sm",
                    darkMode
                      ? "border-red-500/30 bg-red-500/10 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {error}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-4">
                  {transcript.length === 0 ? (
                    <div className={joinClassNames("rounded-3xl border border-dashed px-6 py-8 text-center text-sm", darkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-500")}>
                      The transcript will appear here once the interview begins.
                    </div>
                  ) : (
                    transcript.map((entry, index) => <TranscriptBubble key={`${entry.timestamp}-${index}`} entry={entry} darkMode={darkMode} />)
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </section>

            <section
              className={joinClassNames(
                "flex min-h-[70vh] flex-col rounded-3xl border lg:min-h-0 lg:h-full",
                mobileLiveTab !== "editor" ? "hidden lg:flex" : "",
                darkMode ? "border-slate-800 bg-slate-900/90" : "border-slate-200 bg-white"
              )}
            >
              <div className={joinClassNames("border-b px-6 py-5", darkMode ? "border-slate-800" : "border-slate-200")}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.2em]", darkMode ? "text-emerald-300" : "text-emerald-700")}>
                      Whiteboard
                    </p>
                    <h2 className={joinClassNames("mt-2 text-2xl font-black", darkMode ? "text-white" : "text-slate-900")}>
                      Candidate Editor
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={joinClassNames("rounded-2xl px-4 py-3 text-xs font-semibold", darkMode ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-600")}>
                      Debounced sync every 1.5s after typing stops
                    </div>
                    <div className={joinClassNames("text-[11px] font-medium", darkMode ? "text-slate-500" : "text-slate-400")}>
                      {lastEditorSyncAt
                        ? `Last synced at ${new Date(lastEditorSyncAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}`
                        : "No editor sync yet"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 p-6">
                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck={false}
                  placeholder={`// Explain your approach while you type.\n// The interviewer will see updates here.\n\nfunction solveInterviewQuestion() {\n  \n}`}
                  className={joinClassNames(
                    "h-full min-h-[50vh] w-full resize-none rounded-3xl border p-6 font-mono text-sm leading-7 outline-none transition lg:min-h-0",
                    darkMode
                      ? "border-slate-800 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-emerald-400"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
                  )}
                />
              </div>
            </section>
          </div>
          </div>
        )}

        {phase === "result" && performanceReport && (
          <div className="mx-auto max-w-4xl">
            <section
              className={joinClassNames(
                "rounded-3xl border p-8 shadow-xl",
                darkMode ? "border-slate-800 bg-slate-900/90" : "border-slate-200 bg-white"
              )}
            >
              <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.2em]", darkMode ? "text-cyan-300" : "text-cyan-700")}>
                Interview Report
              </p>
              <h1 className={joinClassNames("mt-3 text-4xl font-black", darkMode ? "text-white" : "text-slate-900")}>
                {form.topic}
              </h1>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className={joinClassNames("rounded-2xl border px-5 py-5", darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50")}>
                  <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.18em]", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Score
                  </p>
                  <p className={joinClassNames("mt-3 text-4xl font-black", darkMode ? "text-white" : "text-slate-900")}>
                    {performanceReport.score}
                    <span className={joinClassNames("ml-1 text-lg font-semibold", darkMode ? "text-slate-500" : "text-slate-400")}>/10</span>
                  </p>
                </div>
                <div className={joinClassNames("rounded-2xl border px-5 py-5 md:col-span-3", darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50")}>
                  <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.18em]", darkMode ? "text-slate-500" : "text-slate-400")}>
                    Overall Feedback
                  </p>
                  <p className={joinClassNames("mt-3 text-sm leading-7", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {performanceReport.overallFeedback}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className={joinClassNames("rounded-2xl border px-5 py-5", darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50")}>
                  <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.18em]", darkMode ? "text-emerald-300" : "text-emerald-700")}>
                    Strengths
                  </p>
                  <ul className={joinClassNames("mt-4 space-y-3 text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {performanceReport.strengths.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={joinClassNames("rounded-2xl border px-5 py-5", darkMode ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-slate-50")}>
                  <p className={joinClassNames("text-xs font-bold uppercase tracking-[0.18em]", darkMode ? "text-rose-300" : "text-rose-700")}>
                    Weaknesses
                  </p>
                  <ul className={joinClassNames("mt-4 space-y-3 text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {performanceReport.weaknesses.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={resetFlow}
                  className="rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-500"
                >
                  Start Another Interview
                </button>
                {sessionMeta?.mockInterviewId && (
                  <div className={joinClassNames("rounded-2xl px-4 py-3 text-xs font-semibold", darkMode ? "bg-slate-950 text-slate-400" : "bg-slate-100 text-slate-500")}>
                    Session saved: {sessionMeta.mockInterviewId}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

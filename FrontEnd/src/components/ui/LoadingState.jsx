import React, { useState, useEffect } from 'react';

const humorousMessages = [
    { emoji: "☕", text: "Pouring coffee for the backend..." },
    { emoji: "😴", text: "Server took a nap. Waking it up..." },
    { emoji: "🐹", text: "Spinning up the hamsters..." },
    { emoji: "💸", text: "Free hosting = free loading times..." },
    { emoji: "🧠", text: "Downloading more RAM... just kidding" },
    { emoji: "🔥", text: "Warming up the servers (literally)" },
    { emoji: "🫠", text: "Developer is broke, bear with us..." },
    { emoji: "⏳", text: "Good things take time. Great things take longer." },
    { emoji: "🚀", text: "Almost there... probably" },
    { emoji: "🤖", text: "AI is thinking about thinking..." },
];

const footerTips = [
    "Pro tip: This is free hosting doing its thing.",
    "Fun fact: The server runs on hopes and dreams.",
    "Patience level: Expert 💎",
    "This loading time is a feature, not a bug.",
];

/* ── Full-screen humorous loading overlay ── */
function HumorousLoadingScreen() {
    const [msgIndex, setMsgIndex] = useState(0);
    const [animState, setAnimState] = useState("in"); // "in" | "out"
    const [tipIndex] = useState(() => Math.floor(Math.random() * footerTips.length));

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimState("out");
            setTimeout(() => {
                setMsgIndex((prev) => (prev + 1) % humorousMessages.length);
                setAnimState("in");
            }, 400);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const current = humorousMessages[msgIndex];

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "linear-gradient(160deg, #020617 0%, #0f172a 50%, #020617 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Background glow orbs */}
            <div style={{
                position: "absolute", top: "20%", left: "30%", width: 300, height: 300,
                background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", bottom: "25%", right: "25%", width: 250, height: 250,
                background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
                borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none",
            }} />

            {/* Logo */}
            <img
                src="/coderax_logo.png"
                alt="CodeRax"
                style={{
                    width: 64, height: 64, borderRadius: 16,
                    marginBottom: 32, objectFit: "cover",
                    animation: "pulseGlow 3s ease-in-out infinite",
                    boxShadow: "0 0 30px rgba(99,102,241,0.3)",
                }}
            />

            {/* Glowing ring spinner */}
            <div style={{
                width: 64, height: 64, borderRadius: "50%",
                border: "3px solid rgba(99,102,241,0.15)",
                borderTopColor: "#6366f1", borderRightColor: "#06b6d4",
                animation: "glowRingSpin 1.2s linear infinite",
                boxShadow: "0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(6,182,212,0.15)",
                marginBottom: 36,
            }} />

            {/* Title */}
            <h1 style={{
                fontSize: "1.5rem", fontWeight: 900, color: "#f8fafc",
                margin: "0 0 12px 0", letterSpacing: "-0.02em",
            }}>
                Hang tight, CodeRax is loading
            </h1>

            {/* Cycling humorous message */}
            <div style={{ minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
                <p
                    key={msgIndex}
                    style={{
                        fontSize: "1.15rem", color: "#94a3b8", fontWeight: 500,
                        margin: 0, textAlign: "center", maxWidth: 440,
                        animation: animState === "in" ? "fadeSlideIn 0.4s ease-out forwards" : "fadeSlideOut 0.35s ease-in forwards",
                    }}
                >
                    <span style={{ marginRight: 8, fontSize: "1.35rem" }}>{current.emoji}</span>
                    {current.text}
                </p>
            </div>

            {/* Bouncing dots */}
            <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                            display: "inline-block",
                            animation: `bounceDot 1.4s ease-in-out ${i * 0.16}s infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Footer tip */}
            <p style={{
                position: "absolute", bottom: 32, left: 0, right: 0,
                textAlign: "center", color: "#475569", fontSize: "0.8rem",
                fontWeight: 400, fontStyle: "italic", margin: 0, padding: "0 24px",
            }}>
                {footerTips[tipIndex]}
            </p>
        </div>
    );
}

/* ── Standard compact/inline loading state ── */
function LoadingState({ title = "Loading...", description = "Preparing your workspace.", darkMode, compact = false, humorous = false }) {
    if (humorous) {
        return <HumorousLoadingScreen />;
    }

    return (
        <div className={`flex items-center justify-center ${compact ? "py-10" : "min-h-[280px]"}`}>
            <div className="flex flex-col items-center gap-3 text-center">
                <div
                    className={`h-10 w-10 animate-spin rounded-full border-2 border-t-cyan-500 ${
                        darkMode ? "border-slate-800" : "border-slate-200"
                    }`}
                />
                <div>
                    <p className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {title}
                    </p>
                    <p className={`mt-1 text-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoadingState;

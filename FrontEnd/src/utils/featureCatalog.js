export const FEATURE_CATALOG = {
    problems: {
        key: "problems",
        title: "Problem Arena",
        route: "/problems",
        description: "Solve curated DSA problems in a workspace built for focus, speed, and progress.",
        accent: "from-cyan-500 to-blue-600",
        eyebrow: "Practice",
        heroTagline: "Your arena for serious DSA practice",
        longDescription:
            "The Problem Arena isn't a clone list — it's a focused workspace where every problem has a clean editor, instant test feedback, and your solve history tracked. Filter by difficulty, search by topic, and maintain a rhythm through daily challenges.",
        benefits: [
            "Curated problems across easy, medium, and hard difficulty levels",
            "Built-in code editor with instant run and test against multiple cases",
            "Track solved problems, streaks, and identify weak topics",
            "Daily challenges pinned by admins to keep your rhythm consistent",
        ],
        highlights: [
            { icon: "💻", title: "Clean Workspace", desc: "Monaco editor with syntax highlighting and auto-complete." },
            { icon: "⚡", title: "Instant Feedback", desc: "Run your code and see results against test cases immediately." },
            { icon: "📊", title: "Progress Tracking", desc: "Stats dashboard showing solved count, streak, and difficulty breakdown." },
        ],
    },
    "revision-mentor": {
        key: "revision-mentor",
        title: "Revision Mentor",
        route: "/revision-mentor",
        description: "Turn weak topics into repeatable wins with AI-guided revision and saved insights.",
        accent: "from-emerald-500 to-teal-600",
        eyebrow: "AI Coach",
        heroTagline: "AI that knows your weak spots",
        longDescription:
            "The Revision Mentor uses AI to analyze your practice patterns and generate personalized revision sessions. Have a conversation about difficult concepts, save AI-generated insights as notes, and build spaced-repetition habits that actually stick. It's not generic — it adapts to your specific gaps.",
        benefits: [
            "AI-powered weak-topic detection based on your actual solve history",
            "Conversational revision — ask follow-up questions, go deeper on concepts",
            "Save AI insights as persistent notes for quick future reference",
            "Spaced-repetition loops to ensure concepts move from short-term to long-term memory",
        ],
        highlights: [
            { icon: "🧠", title: "Smart Detection", desc: "AI identifies topics where you struggle and prioritizes them." },
            { icon: "💬", title: "Chat-Based Revision", desc: "Have a back-and-forth conversation to solidify understanding." },
            { icon: "📝", title: "Save Insights", desc: "Bookmark AI explanations as notes you can revisit anytime." },
        ],
    },
    "mock-interview": {
        key: "mock-interview",
        title: "Mock Interview",
        route: "/mock-interview",
        description: "Practice voice-driven interviews and review your communication under pressure.",
        accent: "from-sky-500 to-cyan-600",
        eyebrow: "Interview",
        heroTagline: "Simulate real interviews with AI",
        longDescription:
            "Mock Interview simulates the real coding interview experience with AI-driven voice dialogue. Choose your difficulty, get timed sessions that match industry standards, practice explaining your thought process out loud, and review your performance afterward. Build the confidence that only comes from repetition.",
        benefits: [
            "AI voice-driven interview simulation that feels real",
            "Difficulty-based timers matching industry interview standards",
            "Practice articulating your thought process under time pressure",
            "Post-interview review to identify communication gaps",
        ],
        highlights: [
            { icon: "🎙️", title: "Voice Dialogue", desc: "Speak your solution approach just like a real interview." },
            { icon: "⏱️", title: "Timed Sessions", desc: "Difficulty-based timers that mimic real interview pressure." },
            { icon: "📋", title: "Performance Review", desc: "Get feedback on your communication and problem-solving flow." },
        ],
    },
    "dsa-visualizer": {
        key: "dsa-visualizer",
        title: "DSA Visualizer",
        route: "/dsa-visualizer",
        description: "Watch algorithms move step by step with a light, interactive visual experience.",
        accent: "from-amber-400 to-orange-500",
        eyebrow: "Visualizer",
        heroTagline: "See algorithms come alive",
        longDescription:
            "The DSA Visualizer transforms abstract algorithm concepts into animated, step-by-step visual breakdowns. Watch sorting algorithms rearrange arrays in real-time, see tree traversals navigate nodes, and understand graph operations by watching data flow. Learning by watching the data move is fundamentally different from reading pseudocode.",
        benefits: [
            "Animated sorting algorithms: Bubble Sort, Merge Sort, Quick Sort, and more",
            "Tree and graph traversal visualizations with highlighted paths",
            "Step-by-step controls — pause, step forward, adjust speed",
            "Learn visually what textbooks can only describe with words",
        ],
        highlights: [
            { icon: "📐", title: "Sorting Animations", desc: "Watch arrays rearrange in real-time with color-coded comparisons." },
            { icon: "🌳", title: "Tree Traversals", desc: "See BFS, DFS, and other traversals navigate node by node." },
            { icon: "🎮", title: "Interactive Controls", desc: "Pause, step through, and adjust speed at any point." },
        ],
    },
    "battle-lobby": {
        key: "battle-lobby",
        title: "DSA Arena",
        route: "/battle-lobby",
        description: "Compete in live coding battles and build real momentum with ranked matchups.",
        accent: "from-fuchsia-500 to-violet-600",
        eyebrow: "Competition",
        heroTagline: "Prove your speed in the arena",
        longDescription:
            "The DSA Arena is where practice meets competition. Enter real-time 1v1 coding battles where you and your opponent get the same problem at the same time. Race to solve it first, climb the ELO-based ranking ladder, and feel the adrenaline of competitive coding. This isn't practice — it's a proving ground.",
        benefits: [
            "Real-time 1v1 coding battles with synchronized problem delivery",
            "ELO-based ranking system that tracks your competitive trajectory",
            "Live competitive pressure that trains you for contest environments",
            "Battle history and win-rate analytics on your profile",
        ],
        highlights: [
            { icon: "⚔️", title: "Live 1v1 Battles", desc: "Same problem, same clock — race your opponent in real-time." },
            { icon: "🏅", title: "ELO Rankings", desc: "Climb the competitive ladder with every win." },
            { icon: "📈", title: "Battle Analytics", desc: "Track wins, losses, and rating progression over time." },
        ],
    },
};

export const DEFAULT_FEATURE_ORDER = [
    FEATURE_CATALOG.problems,
    FEATURE_CATALOG["revision-mentor"],
    FEATURE_CATALOG["mock-interview"],
    FEATURE_CATALOG["dsa-visualizer"],
    FEATURE_CATALOG["battle-lobby"],
];

export const resolveFeaturedModules = (keys = []) => {
    const mapped = keys
        .map((key) => FEATURE_CATALOG[key])
        .filter(Boolean);

    return mapped.length > 0 ? mapped : DEFAULT_FEATURE_ORDER;
};

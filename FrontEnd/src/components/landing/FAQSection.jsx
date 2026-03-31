import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const faqData = [
    {
        question: "What is CodeRax?",
        answer: "CodeRax is an all-in-one DSA practice platform that combines a problem arena, AI-powered revision mentor, algorithm visualizer, real-time coding battles, and mock interviews — all in one sharp workspace built for coders who want rhythm and results.",
    },
    {
        question: "Is CodeRax free to use?",
        answer: "Yes! You can explore problems, the DSA visualizer, and browse features without even creating an account. Sign up for free to unlock AI revision, mock interviews, battle arena, streaks, and your personal dashboard.",
    },
    {
        question: "How does the AI Revision Mentor work?",
        answer: "The Revision Mentor uses AI to identify your weak topics based on your solve history and generates personalized revision sessions. You can have a conversation with the AI, save insights as notes, and build spaced-repetition loops to lock in concepts.",
    },
    {
        question: "What are DSA Battles?",
        answer: "DSA Battles let you compete against other coders in real-time 1v1 matches. You both get the same problem and race to solve it. An ELO-based ranking system tracks your competitive performance and pushes you to solve faster under pressure.",
    },
    {
        question: "How does the Mock Interview feature work?",
        answer: "Mock interviews simulate real coding interviews with AI-driven voice dialogue. Choose your difficulty level, get timed sessions, practice communicating your thought process, and review your performance — all designed to build confidence for the real thing.",
    },
    {
        question: "Can I use CodeRax without signing up?",
        answer: "Absolutely. The problem library, DSA visualizer previews, and all feature landing pages are publicly accessible. Create a free account when you're ready to track progress, save streaks, use AI features, and enter the battle arena.",
    },
];

function FAQItem({ item, isOpen, onToggle, darkMode }) {
    return (
        <div
            className={`rounded-2xl border transition-colors ${
                isOpen
                    ? darkMode
                        ? "border-indigo-500/30 bg-indigo-500/5"
                        : "border-indigo-200 bg-indigo-50/50"
                    : darkMode
                    ? "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    : "border-slate-200 bg-white hover:border-slate-300"
            }`}
        >
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between px-5 py-4 sm:px-6 sm:py-5 text-left"
            >
                <span
                    className={`text-sm sm:text-base font-bold pr-4 ${
                        darkMode ? "text-white" : "text-slate-900"
                    }`}
                >
                    {item.question}
                </span>
                <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                    } ${
                        darkMode
                            ? "bg-slate-800 text-indigo-400"
                            : "bg-indigo-100 text-indigo-600"
                    }`}
                >
                    +
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p
                            className={`px-5 pb-5 sm:px-6 sm:pb-6 text-sm leading-7 ${
                                darkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                        >
                            {item.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FAQSection({ darkMode }) {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
                <p
                    className={`text-xs font-bold uppercase tracking-[0.22em] ${
                        darkMode ? "text-indigo-400" : "text-indigo-600"
                    }`}
                >
                    FAQ
                </p>
                <h2
                    className={`mt-3 text-3xl font-black sm:text-4xl ${
                        darkMode ? "text-white" : "text-slate-900"
                    }`}
                >
                    Got questions? We've got answers.
                </h2>
                <p
                    className={`mt-3 text-sm sm:text-base leading-7 ${
                        darkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                >
                    Everything you need to know about CodeRax and how it helps you dominate DSA.
                </p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl space-y-3">
                {faqData.map((item, index) => (
                    <FAQItem
                        key={index}
                        item={item}
                        isOpen={openIndex === index}
                        onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                        darkMode={darkMode}
                    />
                ))}
            </div>
        </section>
    );
}

export default FAQSection;

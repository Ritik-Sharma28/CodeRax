function HowItWorks({ darkMode }) {
    const steps = [
        {
            number: "01",
            title: "Create Your Account",
            description: "Sign up in seconds. No credit card, no friction. Your dashboard is ready immediately.",
            icon: "🔐",
        },
        {
            number: "02",
            title: "Choose Your Path",
            description: "Jump into problems, start an AI revision session, visualize algorithms, or enter the battle arena.",
            icon: "🛤️",
        },
        {
            number: "03",
            title: "Track & Compete",
            description: "Build streaks, climb ranks, review AI insights, and keep momentum with daily challenges.",
            icon: "🏆",
        },
    ];

    return (
        <section
            className={`py-16 sm:py-20 ${
                darkMode ? "bg-slate-900/30" : "bg-gradient-to-b from-indigo-50/40 to-transparent"
            }`}
        >
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <p
                        className={`text-xs font-bold uppercase tracking-[0.22em] ${
                            darkMode ? "text-cyan-400" : "text-cyan-700"
                        }`}
                    >
                        How it works
                    </p>
                    <h2
                        className={`mt-3 text-3xl font-black sm:text-4xl ${
                            darkMode ? "text-white" : "text-slate-900"
                        }`}
                    >
                        Three steps to get started
                    </h2>
                </div>

                <div className="relative mt-12 grid gap-6 sm:gap-8 md:grid-cols-3">
                    {/* Connecting line (desktop only) */}
                    <div
                        className={`absolute left-0 right-0 top-16 hidden h-px md:block ${
                            darkMode
                                ? "bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
                                : "bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"
                        }`}
                    />

                    {steps.map((step) => (
                        <div key={step.number} className="relative text-center">
                            <div
                                className={`relative z-10 mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl text-2xl sm:text-3xl ${
                                    darkMode
                                        ? "bg-slate-800 shadow-lg shadow-indigo-500/10"
                                        : "bg-white shadow-lg shadow-indigo-100/80"
                                }`}
                            >
                                {step.icon}
                            </div>
                            <p
                                className={`mt-4 text-xs font-bold uppercase tracking-[0.2em] ${
                                    darkMode ? "text-indigo-400" : "text-indigo-600"
                                }`}
                            >
                                Step {step.number}
                            </p>
                            <h3
                                className={`mt-2 text-lg font-black ${
                                    darkMode ? "text-white" : "text-slate-900"
                                }`}
                            >
                                {step.title}
                            </h3>
                            <p
                                className={`mt-2 text-sm leading-7 ${
                                    darkMode ? "text-slate-400" : "text-slate-500"
                                }`}
                            >
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;

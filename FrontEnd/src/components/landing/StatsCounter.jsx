import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ target, suffix = "", duration = 2000 }) {
    const [value, setValue] = useState(0);
    const ref = useRef(null);
    const animated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !animated.current) {
                    animated.current = true;
                    const start = performance.now();
                    const step = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setValue(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(step);
                    };
                    requestAnimationFrame(step);
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return (
        <span ref={ref}>
            {value}
            {suffix}
        </span>
    );
}

const stats = [
    { label: "Platform Features", value: 5, suffix: "+", icon: "🚀" },
    { label: "AI-Powered Tools", value: 3, suffix: "", icon: "🤖" },
    { label: "Real-Time Battles", value: 1, suffix: "v1", icon: "⚔️" },
    { label: "Algorithm Visualizations", value: 10, suffix: "+", icon: "📊" },
];

function StatsCounter({ darkMode }) {
    return (
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="text-center">
                <p
                    className={`text-xs font-bold uppercase tracking-[0.22em] ${
                        darkMode ? "text-cyan-400" : "text-cyan-700"
                    }`}
                >
                    Platform at a glance
                </p>
                <h2
                    className={`mt-3 text-3xl font-black sm:text-4xl ${
                        darkMode ? "text-white" : "text-slate-900"
                    }`}
                >
                    Built for serious practice
                </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className={`group relative overflow-hidden rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 ${
                            darkMode
                                ? "border-slate-800 bg-slate-900/60 hover:border-indigo-500/40"
                                : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50"
                        }`}
                    >
                        <div className="text-3xl">{stat.icon}</div>
                        <p
                            className={`mt-3 text-4xl font-black ${
                                darkMode ? "text-white" : "text-slate-900"
                            }`}
                        >
                            <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                        </p>
                        <p
                            className={`mt-2 text-sm font-semibold ${
                                darkMode ? "text-slate-400" : "text-slate-500"
                            }`}
                        >
                            {stat.label}
                        </p>
                        {/* Hover glow */}
                        <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                            darkMode
                                ? "bg-gradient-to-br from-indigo-500/5 to-transparent"
                                : "bg-gradient-to-br from-indigo-50/50 to-transparent"
                        }`} />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default StatsCounter;

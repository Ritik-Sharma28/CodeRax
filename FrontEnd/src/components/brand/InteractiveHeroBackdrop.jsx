import { Suspense, lazy, useMemo, useState } from "react";

const ParticleField = lazy(() => import("./ParticleField"));

function InteractiveHeroBackdrop({ darkMode, className = "", children, intensity = 1 }) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const layers = useMemo(
        () => [
            { id: "one", className: darkMode ? "bg-cyan-400/14" : "bg-cyan-400/10", size: "h-52 w-52 sm:h-72 sm:w-72", position: "-left-10 top-14", factor: 14 * intensity },
            { id: "two", className: darkMode ? "bg-indigo-500/16" : "bg-indigo-500/12", size: "h-52 w-52 sm:h-80 sm:w-80", position: "right-0 top-0", factor: -10 * intensity },
            { id: "three", className: darkMode ? "bg-fuchsia-500/14" : "bg-fuchsia-500/10", size: "h-40 w-40 sm:h-60 sm:w-60", position: "bottom-10 right-12", factor: 16 * intensity },
        ],
        [darkMode, intensity]
    );

    const handleMove = (event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        setOffset({ x, y });
    };

    const reset = () => setOffset({ x: 0, y: 0 });

    return (
        <div className={`relative overflow-hidden ${className}`} onMouseMove={handleMove} onMouseLeave={reset}>
            {/* Radial gradient base layer */}
            <div
                className={`absolute inset-0 ${
                    darkMode
                        ? "bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.1),_transparent_28%),radial-gradient(circle_at_80%_25%,_rgba(6,182,212,0.12),_transparent_30%),radial-gradient(circle_at_75%_80%,_rgba(168,85,247,0.09),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1)_0%,_rgba(3,7,18,0.98)_100%)]"
                        : "bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.08),_transparent_28%),radial-gradient(circle_at_80%_25%,_rgba(6,182,212,0.1),_transparent_28%),radial-gradient(circle_at_75%_80%,_rgba(168,85,247,0.06),_transparent_24%),linear-gradient(180deg,_rgba(248,249,252,1)_0%,_rgba(255,255,255,0.98)_100%)]"
                }`}
            />

            {/* Grid overlay */}
            <div
                className={`absolute inset-0 opacity-30 ${
                    darkMode
                        ? "bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)]"
                        : "bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)]"
                } [background-size:56px_56px]`}
                style={{ transform: `translate(${offset.x * -8}px, ${offset.y * -8}px)` }}
            />

            {/* Horizontal accent line */}
            <div
                className={`pointer-events-none absolute inset-x-[12%] top-[16%] h-px ${
                    darkMode ? "bg-gradient-to-r from-transparent via-white/15 to-transparent" : "bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"
                }`}
                style={{ transform: `translateY(${offset.y * 6}px)` }}
            />

            {/* Three.js particle field - lazy loaded, auto-disabled on mobile */}
            <Suspense fallback={null}>
                <ParticleField darkMode={darkMode} />
            </Suspense>

            {/* Floating blur orbs */}
            {layers.map((layer) => (
                <div
                    key={layer.id}
                    className={`pointer-events-none absolute rounded-full blur-3xl animate-pulse-glow ${layer.className} ${layer.size} ${layer.position}`}
                    style={{ transform: `translate(${offset.x * layer.factor}px, ${offset.y * layer.factor}px)` }}
                />
            ))}

            {/* Decorative floating shapes */}
            <div
                className={`pointer-events-none absolute left-[8%] top-[18%] hidden h-28 w-28 rounded-[28px] border lg:block ${
                    darkMode ? "border-white/8 bg-white/[0.03]" : "border-indigo-200/50 bg-white/40"
                }`}
                style={{ transform: `translate(${offset.x * -10}px, ${offset.y * -14}px) rotate(8deg)` }}
            />
            <div
                className={`pointer-events-none absolute bottom-[16%] right-[10%] hidden h-32 w-32 rounded-[30px] border lg:block ${
                    darkMode ? "border-white/8 bg-white/[0.03]" : "border-cyan-200/50 bg-white/45"
                }`}
                style={{ transform: `translate(${offset.x * 14}px, ${offset.y * 10}px) rotate(-7deg)` }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

export default InteractiveHeroBackdrop;

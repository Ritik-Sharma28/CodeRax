function BrandWordmark({ darkMode = true, className = "", compact = false, tagline = false }) {
    const codeClass = darkMode
        ? "bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-400"
        : "bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700";
    const raxClass = darkMode
        ? "bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-400"
        : "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600";

    return (
        <div className={className}>
            <div className={`font-black tracking-tight ${compact ? "text-lg sm:text-xl" : "text-3xl sm:text-4xl lg:text-5xl"}`}>
                <span className={`bg-clip-text text-transparent ${codeClass}`}>Code</span>
                <span className={`bg-clip-text text-transparent ${raxClass}`}>Rax</span>
            </div>
            {tagline ? (
                <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.28em] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                    Practice. Revise. Visualize. Compete.
                </p>
            ) : null}
        </div>
    );
}

export default BrandWordmark;

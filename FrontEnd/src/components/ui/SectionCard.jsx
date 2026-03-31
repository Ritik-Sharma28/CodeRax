function SectionCard({ children, darkMode, className = "" }) {
    return (
        <section
            className={`rounded-[30px] border p-5 sm:p-6 ${
                darkMode
                    ? "border-slate-800 bg-slate-900/85 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.8)]"
                    : "border-slate-200 bg-white/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.24)]"
            } ${className}`}
        >
            {children}
        </section>
    );
}

export default SectionCard;

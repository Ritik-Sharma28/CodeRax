import { NavLink } from "react-router";
import BrandWordmark from "./brand/BrandWordmark";

function Footer({ darkMode }) {
    const linkClass = `text-sm transition ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`;
    const headingClass = `text-xs font-bold uppercase tracking-[0.2em] ${darkMode ? "text-slate-500" : "text-slate-400"}`;

    return (
        <footer className={`border-t ${darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"}`}>
            {/* Main footer grid */}
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.25fr_0.75fr_0.75fr_0.75fr] lg:px-8">
                <div className="max-w-lg">
                    <BrandWordmark darkMode={darkMode} compact />
                    <h3 className={`mt-3 text-xl sm:text-2xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                        The practice platform for coders who want rhythm, rank, and real interview reps.
                    </h3>
                    <p className={`mt-3 text-sm leading-7 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        Problems, AI revision, algorithm visualization, mock interviews, and arena energy — one sharper workspace.
                    </p>
                </div>

                <div>
                    <p className={headingClass}>Platform</p>
                    <div className="mt-3 flex flex-col gap-2">
                        <NavLink className={linkClass} to="/problems">Problems</NavLink>
                        <NavLink className={linkClass} to="/revision-mentor">Revision AI</NavLink>
                        <NavLink className={linkClass} to="/mock-interview">Mock Interview</NavLink>
                        <NavLink className={linkClass} to="/battle-lobby">Arena</NavLink>
                    </div>
                </div>

                <div>
                    <p className={headingClass}>Explore</p>
                    <div className="mt-3 flex flex-col gap-2">
                        <NavLink className={linkClass} to="/dsa-visualizer">Visualizer</NavLink>
                        <NavLink className={linkClass} to="/login">Log In</NavLink>
                        <NavLink className={linkClass} to="/signup">Sign Up</NavLink>
                    </div>
                </div>

                <div>
                    <p className={headingClass}>Contact</p>
                    <div className="mt-3 flex flex-col gap-2">
                        <a className={linkClass} href="mailto:ritiksharma.14y@gmail.com">coderax.team@gmail.com</a>
                        <a className={linkClass} href="https://github.com/Ritik-Sharma28" target="_blank" rel="noreferrer">GitHub</a>
                        <a className={linkClass} href="https://www.linkedin.com/in/ritik-sharma-295536331/" target="_blank" rel="noreferrer">LinkedIn</a>
                    </div>
                </div>
            </div>

            {/* Bottom credit bar */}
            <div className={`border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
                    <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                        © {new Date().getFullYear()} CodeRax. All rights reserved.
                    </p>
                    <p className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                        Made with ❤️ by{" "}
                        <span className={`font-black ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                            Ritik Sharma
                        </span>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

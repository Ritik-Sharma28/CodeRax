import { useEffect, useRef } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services";

const loadGoogleScript = () =>
    new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) {
            resolve(window.google);
            return;
        }

        const existing = document.getElementById(GOOGLE_SCRIPT_ID);
        if (existing) {
            existing.addEventListener("load", () => resolve(window.google), { once: true });
            existing.addEventListener("error", reject, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.id = GOOGLE_SCRIPT_ID;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google);
        script.onerror = reject;
        document.body.appendChild(script);
    });

export default function GoogleAuthButton({ onCredential, disabled = false }) {
    const containerRef = useRef(null);
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        let isMounted = true;

        if (!clientId || disabled) return undefined;

        loadGoogleScript()
            .then((google) => {
                if (!isMounted || !google?.accounts?.id || !containerRef.current) return;

                containerRef.current.innerHTML = "";
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: ({ credential }) => {
                        if (credential) onCredential?.(credential);
                    },
                });
                google.accounts.id.renderButton(containerRef.current, {
                    theme: "outline",
                    size: "large",
                    width: 360,
                    text: "continue_with",
                    shape: "pill",
                });
            })
            .catch((error) => {
                console.error("Failed to load Google Identity Services:", error);
            });

        return () => {
            isMounted = false;
        };
    }, [clientId, disabled, onCredential]);

    if (!clientId) {
        return (
            <button
                type="button"
                disabled
                className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400"
            >
                Google sign-in unavailable
            </button>
        );
    }

    return (
        <div className={`${disabled ? "pointer-events-none opacity-60" : ""}`}>
            <div ref={containerRef} className="flex min-h-[44px] items-center justify-center" />
        </div>
    );
}

import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { closeVerificationModal } from "../../services/slices/uiSlice";
import { resendOtp } from "../../services/slices/authSlice";

export default function VerificationRequiredModal() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { verificationModalOpen, verificationMessage } = useSelector((state) => state.ui);
    const { user, pendingVerificationEmail, loading } = useSelector((state) => state.auth);

    if (!verificationModalOpen) return null;

    const emailId = user?.emailId || pendingVerificationEmail || "";

    const handleVerifyNow = () => {
        dispatch(closeVerificationModal());
        navigate("/signup", { state: { mode: "verify", emailId } });
    };

    const handleResend = async () => {
        if (!emailId) return;
        await dispatch(resendOtp({ emailId }));
    };

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_120px_-40px_rgba(15,23,42,0.45)]">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Verification needed</p>
                <h2 className="mt-3 text-2xl font-black text-slate-900">Unlock AI features</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{verificationMessage}</p>
                {emailId ? (
                    <p className="mt-2 text-sm font-semibold text-slate-800">Email: {emailId}</p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleVerifyNow}
                        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-black text-white transition hover:from-indigo-500 hover:to-purple-500"
                    >
                        Verify now
                    </button>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!emailId || loading}
                        className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Sending..." : "Resend OTP"}
                    </button>
                    <button
                        type="button"
                        onClick={() => dispatch(closeVerificationModal())}
                        className="w-full rounded-2xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../axiosClient";

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem("coderax-user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const persistUser = (user) => {
    try {
        if (user) localStorage.setItem("coderax-user", JSON.stringify(user));
        else localStorage.removeItem("coderax-user");
    } catch {
        // Ignore storage failures and keep auth in memory.
    }
};

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/register", userData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.data || { message: err.message, status: err.status });
        }
    }
);

export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/verify-otp", payload);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const resendOtp = createAsyncThunk(
    "auth/resendOtp",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/resend-otp", payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/forgot-password", payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const verifyResetOtp = createAsyncThunk(
    "auth/verifyResetOtp",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/verify-reset-otp", payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const resendResetOtp = createAsyncThunk(
    "auth/resendResetOtp",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/resend-reset-otp", payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const googleLogin = createAsyncThunk(
    "auth/googleLogin",
    async (credential, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/google", { credential });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/auth/login", credentials);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosClient.get("/auth/check");
            return data.user;
        } catch (error) {
            if (error.status === 401) {
                return rejectWithValue(null);
            }
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await axiosClient.post("/auth/logout");
            return null;
        } catch (error) {
            return rejectWithValue(error.data || { message: error.message, status: error.status });
        }
    }
);

const storedUser = readStoredUser();

const initialState = {
    user: storedUser,
    isAuthenticated: !!storedUser,
    loading: false,
    authChecked: false,
    error: null,
    pendingVerificationEmail: null,
    verificationMeta: null,
    pendingResetEmail: null,
    resetMeta: null,
    resetSuccessMessage: null,
};

const setAuthenticatedUser = (state, user) => {
    state.user = user;
    state.isAuthenticated = !!user;
    state.pendingVerificationEmail = null;
    state.verificationMeta = null;
    state.pendingResetEmail = null;
    state.resetMeta = null;
    state.resetSuccessMessage = null;
    persistUser(user);
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        updateUserFields: (state, action) => {
            state.user = state.user ? { ...state.user, ...action.payload } : action.payload;
            state.isAuthenticated = !!state.user;
            persistUser(state.user);
        },
        setPendingVerification: (state, action) => {
            state.pendingVerificationEmail = action.payload?.emailId || null;
            state.verificationMeta = action.payload
                ? {
                    resendAvailableAt: action.payload.resendAvailableAt || null,
                    expiresAt: action.payload.expiresAt || null,
                }
                : null;
        },
        clearPendingVerification: (state) => {
            state.pendingVerificationEmail = null;
            state.verificationMeta = null;
        },
        setPendingReset: (state, action) => {
            state.pendingResetEmail = action.payload?.emailId || null;
            state.resetMeta = action.payload
                ? {
                    resendAvailableAt: action.payload.resendAvailableAt || null,
                    expiresAt: action.payload.expiresAt || null,
                }
                : null;
            state.resetSuccessMessage = null;
        },
        clearPendingReset: (state) => {
            state.pendingResetEmail = null;
            state.resetMeta = null;
        },
        clearResetSuccessMessage: (state) => {
            state.resetSuccessMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = null;
                state.pendingVerificationEmail = action.payload?.emailId || null;
                state.verificationMeta = {
                    resendAvailableAt: action.payload?.resendAvailableAt || null,
                    expiresAt: action.payload?.expiresAt || null,
                };
                persistUser(null);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";
            })
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                setAuthenticatedUser(state, action.payload);
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Unable to verify the code.";
            })
            .addCase(resendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resendOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.pendingVerificationEmail = action.payload?.emailId || state.pendingVerificationEmail;
                state.verificationMeta = {
                    resendAvailableAt: action.payload?.resendAvailableAt || null,
                    expiresAt: action.payload?.expiresAt || null,
                };
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Unable to resend the code.";
            })
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.resetSuccessMessage = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.pendingResetEmail = action.payload?.emailId || null;
                state.resetMeta = {
                    resendAvailableAt: action.payload?.resendAvailableAt || null,
                    expiresAt: action.payload?.expiresAt || null,
                };
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Unable to start password reset.";
            })
            .addCase(verifyResetOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.resetSuccessMessage = null;
            })
            .addCase(verifyResetOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.pendingResetEmail = null;
                state.resetMeta = null;
                state.resetSuccessMessage = action.payload?.message || "Password reset successful.";
            })
            .addCase(verifyResetOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Unable to reset the password.";
            })
            .addCase(resendResetOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resendResetOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.pendingResetEmail = action.payload?.emailId || state.pendingResetEmail;
                state.resetMeta = {
                    resendAvailableAt: action.payload?.resendAvailableAt || null,
                    expiresAt: action.payload?.expiresAt || null,
                };
            })
            .addCase(resendResetOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Unable to resend the reset code.";
            })
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                setAuthenticatedUser(state, action.payload);
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Unable to continue with Google.";
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                setAuthenticatedUser(state, action.payload);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";

                if (action.payload?.error === "verification_required") {
                    state.pendingVerificationEmail = action.payload?.emailId || state.pendingVerificationEmail;
                    state.verificationMeta = {
                        resendAvailableAt: action.payload?.resendAvailableAt || null,
                        expiresAt: action.payload?.expiresAt || null,
                    };
                }

                if (action.payload?.status === 401) {
                    state.isAuthenticated = false;
                    state.user = null;
                    persistUser(null);
                }
            })
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.authChecked = true;
                state.error = null;
                setAuthenticatedUser(state, action.payload);
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.authChecked = true;
                state.error = null;
                state.isAuthenticated = false;
                state.user = null;
                persistUser(null);
            })
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
                state.user = null;
                state.isAuthenticated = false;
                state.pendingVerificationEmail = null;
                state.verificationMeta = null;
                state.pendingResetEmail = null;
                state.resetMeta = null;
                state.resetSuccessMessage = null;
                persistUser(null);
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";
                state.isAuthenticated = false;
                state.user = null;
                persistUser(null);
            });
    },
});

export const {
    updateUserFields,
    setPendingVerification,
    clearPendingVerification,
    setPendingReset,
    clearPendingReset,
    clearResetSuccessMessage,
} = authSlice.actions;
export default authSlice.reducer;

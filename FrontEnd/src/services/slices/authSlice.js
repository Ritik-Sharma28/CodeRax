import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosClient from "../axiosClient"

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/register', userData)
            return response.data.user
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/auth/login', credentials);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);


export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axiosClient.get('/auth/check');
            return data.user;
        } catch (error) {
            if (error.response?.status === 401) {
                return rejectWithValue(null);
            }
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axiosClient.post('/auth/logout');
            return null;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);


const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    authChecked: false,
    error: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Register User Cases
        builder
            .addCase(registerUser.pending, (state, action) => {
                state.loading = true,
                    state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = !!action.payload
                state.user = action.payload
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.error || 'Something went wrong';
                state.isAuthenticated = false
                state.user = null
            })

            // Login User Cases

            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            })

            // Check Auth Cases
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.authChecked = true;
                state.isAuthenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.authChecked = true;
                state.error = null;
                state.isAuthenticated = false;
                state.user = null;
            })

            // Logout User Cases
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.isAuthenticated = false;
                state.user = null;
            });
    }
})

export default authSlice.reducer
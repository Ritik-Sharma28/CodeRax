import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import problemService from "../problemService";

export const fetchAllProblems = createAsyncThunk(
    "problems/fetchAll",
    async (_, thunkAPI) => {
        try {
            const data = await problemService.getAllProblems();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch problems");
        }
    }
);

const initialState = {
    problemIndex: [], // lightweight metadata array
    searchQuery: "",
    currentPage: 1,
    itemsPerPage: 10,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const problemsSlice = createSlice({
    name: "problems",
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1; // reset to first page on new search
        },
        setPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllProblems.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAllProblems.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.problemIndex = action.payload;
            })
            .addCase(fetchAllProblems.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export const { setSearchQuery, setPage } = problemsSlice.actions;

// Selectors
export const selectProblemIndex = (state) => state.problems.problemIndex;
export const selectSearchQuery = (state) => state.problems.searchQuery;
export const selectCurrentPage = (state) => state.problems.currentPage;
export const selectItemsPerPage = (state) => state.problems.itemsPerPage;

// Derived selector for real-time frontend filtering and pagination
export const selectPaginatedProblems = (state) => {
    const { problemIndex, searchQuery, currentPage, itemsPerPage } = state.problems;
    
    let filtered = problemIndex;
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = problemIndex.filter(p => p.title.toLowerCase().includes(query));
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    return {
        paginated,
        totalFilteredRows: filtered.length,
        totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
};

export default problemsSlice.reducer;

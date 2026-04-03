import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    verificationModalOpen: false,
    verificationMessage: "Verify your email to unlock AI features.",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openVerificationModal: (state, action) => {
            state.verificationModalOpen = true;
            state.verificationMessage = action.payload?.message || initialState.verificationMessage;
        },
        closeVerificationModal: (state) => {
            state.verificationModalOpen = false;
        },
    },
});

export const { openVerificationModal, closeVerificationModal } = uiSlice.actions;
export default uiSlice.reducer;

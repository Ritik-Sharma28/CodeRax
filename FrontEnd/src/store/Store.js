import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../services/authSlice"
import problemsReducer from "./problemsSlice"

export const store = configureStore({
    reducer : {
        auth : authReducer,
        problems: problemsReducer
    }
})
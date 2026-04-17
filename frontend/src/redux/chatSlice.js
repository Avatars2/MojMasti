import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [],
    },
    reducers: {
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages = [...(state.messages || []), action.payload];
        },
        clearMessages: (state) => {
            state.messages = [];
        }
    }
});
export const { setOnlineUsers, setMessages, addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
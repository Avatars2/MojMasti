import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null,
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        // Add follow/unfollow action
        updateFollowing: (state, action) => {
            if (state.user) {
                state.user.following = action.payload;
            }
        }
    }
});

export const {
    setAuthUser,
    setLoading,
    setSuggestedUsers,
    setUserProfile,
    setSelectedUser,
    updateFollowing,
} = authSlice.actions;

export default authSlice.reducer;
// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

// Async thunk for user login (remains the same)
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }) => {
    const response = await axios.post(
      "http://localhost:5000/api/users/login",
      { email, password },
      { withCredentials: true }
    );

    // store tokens in cookies
    Cookies.set("accessToken", response.data.accessToken);
    Cookies.set("refreshToken", response.data.refreshToken);

    return response.data; // {user, accessToken}
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/logout",
        {},
        {
          withCredentials: true,
        }
      );

      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data); // Return error data from the backend
    }
  }
);

// Async thunk for loading user from token
// src/features/auth/authSlice.js
export const loadUserFromToken = createAsyncThunk(
  "auth/loadUserFromToken",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = Cookies.get("accessToken");
      if (!accessToken) throw new Error("No access token");
      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          withCredentials: true,
        }
      );
      console.log(response);
      return response.data.user;
    } catch (error) {
      Cookies.remove("accessToken");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    clearUser(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "idle";
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null; // Clear any previous errors when login starts
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message; // Set error message from payload
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "succeeded"; // Logout succeeded, so clear user data
        state.user = null;
        state.accessToken = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.error || "Logout failed"; // Set error message from payload
      })
      .addCase(loadUserFromToken.pending, (state) => {
        state.status = "loading";
        state.error = null; // Clear previous error
      })
      .addCase(loadUserFromToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.accessToken = Cookies.get("accessToken");
        state.error = null;
      })
      .addCase(loadUserFromToken.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.error || "Error loading user";
      });
  },
});

export const { clearUser, setUser } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunk for logging in
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, thunkAPI) => {
  try {
    const response = await api.post("/users/login", credentials);
    const { token, user } = response.data;
    
    // Always use localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || { message: "Login failed" });
  }
});

// Check localStorage for existing auth
const getStoredUser = () => {
  return JSON.parse(localStorage.getItem("user")) || null;
};

const getStoredToken = () => {
  return localStorage.getItem("token") || null;
};

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
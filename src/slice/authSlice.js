import {api} from '../lib/api.js'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

//async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);

      // ✅ If success, return normally
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }

      // ✅ If verification required, pass full object to reducer
      if (response.data.requiresVerification) {
        return rejectWithValue({
          requiresVerification: true,
          email: response.data.email,
          message: response.data.message
        });
      }

      return rejectWithValue({
        message: response.data.message || 'Login failed'
      });

    } catch (error) {
      if (error.response?.data) {
        // ✅ Still handle requiresVerification from error response
        if (error.response.data.requiresVerification) {
          return rejectWithValue({
            requiresVerification: true,
            email: error.response.data.email,
            message: error.response.data.message
          });
        }

        return rejectWithValue({
          message: error.response.data.message
        });
      }

      return rejectWithValue({
        message: error.message || 'Network error'
      });
    }
  }
);


export const signupUser = createAsyncThunk(
    'auth/signup',
    async(userData, {rejectWithValue}) => {
        try {
            const response = await api.post('/auth/signup', userData)

            if(response.data.success){
                return response.data
            }

            return rejectWithValue(response.data.message) || 'signup failed'
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Network error';
            return rejectWithValue(message);
        }
    }
)


export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async({email, otp}, {rejectWithValue}) => {
        try {
            console.log('Sending verification request:', { email, otp }); // ADD THIS
            
            const response = await api.post('/auth/verify-email', {email, otp})

            console.log('Verification response:', response.data); // ADD THIS

            if(response.data.success) {
                localStorage.setItem('accessToken', response.data.accessToken)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                return response.data
            }

            return rejectWithValue(response.data.message || 'Verification failed');
        } catch (error) {
            console.error('Verification error:', error.response?.data); // ADD THIS
            const message = error.response?.data?.message || error.message || 'Network error';
            return rejectWithValue(message);
        }
    }
)


export const resendVerificationOTP = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Network error';
      return rejectWithValue(message);
    }
  }
);


export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Network error';
      return rejectWithValue(message);
    }
  }
);

export const verifyResetOTP = createAsyncThunk(
  'auth/verifyResetOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, otp });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Network error';
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Network error';
      return rejectWithValue(message);
    }
  }
);


export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return true;
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get user';
      return rejectWithValue(message);
    }
  }
);


export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/refresh');
      
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data;
      }
      
      return rejectWithValue('Token refresh failed');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return rejectWithValue('Token refresh failed');
    }
  }
);


const user = JSON.parse(localStorage.getItem("user"))

//initial state
const initialState = {
    user: user ? user : null,
    token: localStorage.getItem("accessToken"),
    isLoading: false,
    globalLoading: true,
    isAuthenticated: !!localStorage.getItem("accessToken"),
    error: null,
    message: null,
    pendingVerification: false,
    pendingVerificationEmail: null,
}

//auth slice
const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },

        clearMessage: (state) => {
            state.message = null
        },

        setCredentials: (state, action) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
        },

        resetAuth: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.error = null
            state.message = null
            state.pendingVerification = false
            state.pendingVerificationEmail = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
        },

        setPendingVerification: (state, action) => {
            state.pendingVerification = true
            state.pendingVerificationEmail = action.payload.email
        },
    },

    extraReducers: (builder) => {
        builder

        //Login
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })

        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false 
            state.isAuthenticated = true
            state.user = action.payload.user
            state.token = action.payload.accesssToken
            state.message = action.payload.meesage || 'Login successful'
            state.pendingVerification = false
            state.pendingVerificationEmail = null
        })

        // In authSlice.js - Update loginUser rejected case
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            
        // FIX: Check if action.payload is an object with requiresVerification
        if (typeof action.payload === 'object' && action.payload?.requiresVerification) {
            state.pendingVerification = true;
            state.pendingVerificationEmail = action.payload.email;
            state.error = action.payload.message; // Set the error message
            } else {
        // Handle regular error (string or object with message)
            state.error = typeof action.payload === 'string' 
                ? action.payload 
                : action.payload?.message || 'Login failed';
            }
          })


        //signup
        .addCase(signupUser.pending, (state) => {
            state.isLoading = true
            state.error = null
        })

        .addCase(signupUser.fulfilled, (state, action) => {
            state.isLoading = false
            state.message = action.payload.message
            if(action.payload.requiresVerification) {
                state.pendingVerification = true
                state.pendingVerificationEmail = action.payload.user.email
            }
        })

        .addCase(signupUser.rejected, (state, action) => {
            state.isLoading  = false
            state.error = action.payload
        })


        // Verify email cases
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.message = action.payload.message;
        state.pendingVerification = false;
        state.pendingVerificationEmail = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Resend verification OTP cases
      .addCase(resendVerificationOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(resendVerificationOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Verify reset OTP cases
      .addCase(verifyResetOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyResetOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(verifyResetOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.globalLoading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.globalLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.message = 'Logged out successfully';
        state.pendingVerification = false;
        state.pendingVerificationEmail = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.globalLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.message = 'Logged out successfully';
      })

      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.globalLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.globalLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.globalLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      })
      // onBoard cases
      // .addCase(onBoard.pending, (state) => {
      //   state.isLoading = true;
      //   state.globalLoading = false;
      //   state.error = null;
      // })
      // .addCase(onBoard.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   state.globalLoading = false;
      //   state.isAuthenticated = true;
      //   state.user = action.payload.user;
      //   state.message = action.payload.message || 'Onboard details created successfully';
      // })
      // .addCase(onBoard.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.globalLoading = false;
      //   state.error = action.payload;
      // })
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.accessToken;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});
    

export const { clearError, clearMessage, setCredentials, resetAuth, setPendingVerification } = authSlice.actions

export default authSlice.reducer
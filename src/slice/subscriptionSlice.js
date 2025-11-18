// slice/subscriptionSlice.js - Subscription Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../lib/api';

// ==================== ASYNC THUNKS ====================

/**
 * Create subscription checkout session
 */
export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async ({ priceId, email, websiteId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/templates/subscribe', {
        priceId,
        email,
        websiteId,
        userId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

/**
 * Check if user has active subscription for website
 */
export const checkSubscription = createAsyncThunk(
  'subscription/checkSubscription',
  async ({ userId, websiteId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/templates/check/${userId}/${websiteId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check subscription');
    }
  }
);

/**
 * Get subscription details
 */
export const getSubscriptionDetails = createAsyncThunk(
  'subscription/getSubscriptionDetails',
  async ({ userId, websiteId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/templates/subscription-details/${userId}/${websiteId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription details');
    }
  }
);

/**
 * Get all user subscriptions
 */
export const getUserSubscriptions = createAsyncThunk(
  'subscription/getUserSubscriptions',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/templates/user-subscriptions/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

/**
 * Cancel subscription
 */
export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async ({ subscriptionId, userId, cancelImmediately = false }, { rejectWithValue }) => {
    try {
      const response = await api.post('/templates/cancel-subscription', {
        subscriptionId,
        userId,
        cancelImmediately,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

/**
 * Reactivate subscription
 */
export const reactivateSubscription = createAsyncThunk(
  'subscription/reactivateSubscription',
  async ({ subscriptionId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/templates/reactivate-subscription', {
        subscriptionId,
        userId
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reactivate subscription');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  subscriptions: [],
  currentSubscription: null,
  hasActiveSubscription: false,
  checkoutUrl: null,
  isLoading: false,
  isChecking: false,
  error: null,
  message: null,
};

// ==================== SLICE ====================

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearCheckoutUrl: (state) => {
      state.checkoutUrl = null;
    },
    clearCurrentSubscription: (state) => {
      state.currentSubscription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkoutUrl = action.payload.data.url;
        state.message = action.payload.message;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Check subscription
      .addCase(checkSubscription.pending, (state) => {
        state.isChecking = true;
        state.error = null;
      })
      .addCase(checkSubscription.fulfilled, (state, action) => {
        state.isChecking = false;
        state.hasActiveSubscription = action.payload.hasActiveSubscription;
        if (action.payload.data) {
          state.currentSubscription = action.payload.data;
        }
      })
      .addCase(checkSubscription.rejected, (state, action) => {
        state.isChecking = false;
        state.error = action.payload;
      })

      // Get subscription details
      .addCase(getSubscriptionDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload.data;
      })
      .addCase(getSubscriptionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get user subscriptions
      .addCase(getUserSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload.data;
      })
      .addCase(getUserSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Reactivate subscription
      .addCase(reactivateSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reactivateSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(reactivateSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearMessage, 
  clearCheckoutUrl, 
  clearCurrentSubscription 
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
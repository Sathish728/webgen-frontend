// slice/websiteSlice.js - Updated with Subscription Handling
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../lib/api';

// ==================== ASYNC THUNKS ====================

/**
 * Create website from template
 */
export const createWebsite = createAsyncThunk(
  'website/createWebsite',
  async ({ userId, templateId, customName }, { rejectWithValue }) => {
    try {
      const response = await api.post('/websites/create-website', {
        userId,
        templateId,
        customName
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create website');
    }
  }
);

/**
 * Get user's websites with subscription status
 */
export const getUserWebsites = createAsyncThunk(
  'website/getUserWebsites',
  async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/websites/website-list/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch websites');
    }
  }
);

/**
 * Get website by ID for editing
 */
export const getWebsiteById = createAsyncThunk(
  'website/getWebsiteById',
  async (websiteId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/websites/website/${websiteId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch website');
    }
  }
);

/**
 * Update website content
 */
export const updateWebsite = createAsyncThunk(
  'website/updateWebsite',
  async ({ websiteId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/websites/update/${websiteId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update website');
    }
  }
);

/**
 * Delete website
 */
export const deleteWebsite = createAsyncThunk(
  'website/deleteWebsite',
  async (websiteId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/websites/delete-website/${websiteId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete website');
    }
  }
);

/**
 * Publish website with subscription check
 */
export const publishWebsite = createAsyncThunk(
  'website/publishWebsite',
  async ({ websiteId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/websites/${websiteId}/publish`, data);
      return response.data;
    } catch (error) {
      // Handle subscription requirement error
      const errorData = error.response?.data;
      if (errorData?.requiresSubscription) {
        return rejectWithValue({
          message: errorData.message,
          requiresSubscription: true
        });
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to publish website');
    }
  }
);

/**
 * Get published website by slug
 */
export const getPublishedWebsite = createAsyncThunk(
  'website/getPublishedWebsite',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/websites/site/${slug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch published website');
    }
  }
);



/**
 * Set custom domain with subscription check
 */
export const setCustomDomain = createAsyncThunk(
  'website/setCustomDomain',
  async ({ websiteId, domain }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/websites/${websiteId}/custom-domain`, { domain });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.requiresSubscription) {
        return rejectWithValue({
          message: errorData.message,
          requiresSubscription: true
        });
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to set custom domain');
    }
  }
);

/**
 * Verify custom domain
 */
export const verifyCustomDomain = createAsyncThunk(
  'website/verifyCustomDomain',
  async ({ domain, siteid }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/websites/verify-domain/${domain}?siteid=${siteid}`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.requiresSubscription) {
        return rejectWithValue({
          message: errorData.message,
          requiresSubscription: true
        });
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to verify domain');
    }
  }
);



// ==================== INITIAL STATE ====================

const initialState = {
  websites: [],
  currentWebsite: null,
  publishedWebsite: null,
  domainVerification: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  isLoading: false,
  isPublishing: false,
  isVerifying: false,
  error: null,
  message: null,
  requiresSubscription: false, // NEW: Track if error is subscription-related
};

// ==================== SLICE ====================

const websiteSlice = createSlice({
  name: 'website',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.requiresSubscription = false;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearCurrentWebsite: (state) => {
      state.currentWebsite = null;
    },
    clearDomainVerification: (state) => {
      state.domainVerification = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create website
      .addCase(createWebsite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWebsite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(createWebsite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get user websites
      .addCase(getUserWebsites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserWebsites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.websites = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserWebsites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get website by ID
      .addCase(getWebsiteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWebsiteById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWebsite = action.payload.data;
      })
      .addCase(getWebsiteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update website
      .addCase(updateWebsite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWebsite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.currentWebsite = action.payload.data;
      })
      .addCase(updateWebsite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete website
      .addCase(deleteWebsite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWebsite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.websites = state.websites.filter(w => w._id !== action.payload.data.websiteId);
      })
      .addCase(deleteWebsite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Publish website - UPDATED with subscription handling
      .addCase(publishWebsite.pending, (state) => {
        state.isPublishing = true;
        state.error = null;
        state.requiresSubscription = false;
      })
      .addCase(publishWebsite.fulfilled, (state, action) => {
        state.isPublishing = false;
        state.message = action.payload.message;
        // Update current website if it's loaded
        if (state.currentWebsite && state.currentWebsite._id === action.payload.data.websiteId) {
          state.currentWebsite.isPublished = action.payload.data.isPublished;
          state.currentWebsite.publishedAt = action.payload.data.publishedAt;
        }
      })
      .addCase(publishWebsite.rejected, (state, action) => {
        state.isPublishing = false;
        if (typeof action.payload === 'object' && action.payload?.requiresSubscription) {
          state.error = action.payload.message;
          state.requiresSubscription = true;
        } else {
          state.error = action.payload;
        }
      })

      // Get published website
      .addCase(getPublishedWebsite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPublishedWebsite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publishedWebsite = action.payload.data
      })
      .addCase(getPublishedWebsite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Set custom domain - UPDATED with subscription handling
      .addCase(setCustomDomain.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.requiresSubscription = false;
      })
      .addCase(setCustomDomain.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        // Update current website if it's loaded
        if (state.currentWebsite) {
          state.currentWebsite.customDomain = action.payload.data.customDomain;
          state.currentWebsite.isCustomDomainVerified = action.payload.data.isCustomDomainVerified;
        }
      })
      .addCase(setCustomDomain.rejected, (state, action) => {
        state.isLoading = false;
        if (typeof action.payload === 'object' && action.payload?.requiresSubscription) {
          state.error = action.payload.message;
          state.requiresSubscription = true;
        } else {
          state.error = action.payload;
        }
      })

      // Verify custom domain - UPDATED with subscription handling
      .addCase(verifyCustomDomain.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
        state.requiresSubscription = false;
      })
      .addCase(verifyCustomDomain.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.domainVerification = action.payload;
        state.message = action.payload.message;
        // Update current website if domain was verified
        if (state.currentWebsite && action.payload.data.isVerified) {
          state.currentWebsite.isCustomDomainVerified = true;
          state.currentWebsite.domainVerifiedAt = action.payload.data.verifiedAt;
        }
      })
      .addCase(verifyCustomDomain.rejected, (state, action) => {
        state.isVerifying = false;
        if (typeof action.payload === 'object' && action.payload?.requiresSubscription) {
          state.error = action.payload.message;
          state.requiresSubscription = true;
        } else {
          state.error = action.payload;
        }
      });
  },
});

export const { clearError, clearMessage, clearCurrentWebsite, clearDomainVerification } = websiteSlice.actions;
export default websiteSlice.reducer;
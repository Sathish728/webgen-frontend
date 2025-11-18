// slice/templateSlice.js - Template Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../lib/api';

// ==================== ASYNC THUNKS ====================

/**
 * Get all templates with pagination
 */
export const getAllTemplates = createAsyncThunk(
  'template/getAllTemplates',
  async ({ page = 1, limit = 10, category = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (category) params.append('category', category);
      
      const response = await api.get(`/templates/get-templates?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch templates');
    }
  }
);

/**
 * Get template by ID
 */
export const getTemplateById = createAsyncThunk(
  'template/getTemplateById',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/templates/get-templates/${templateId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch template');
    }
  }
);

/**
 * Get popular templates
 */
export const getPopularTemplates = createAsyncThunk(
  'template/getPopularTemplates',
  async (limit = 6, { rejectWithValue }) => {
    try {
      const response = await api.get(`/templates/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular templates');
    }
  }
);

/**
 * Get template categories
 */
export const getTemplateCategories = createAsyncThunk(
  'template/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/templates/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

/**
 * Add new template (Admin)
 */
export const addTemplate = createAsyncThunk(
  'template/addTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/templates/add-template', templateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add template');
    }
  }
);

/**
 * Update template (Admin)
 */
export const updateTemplate = createAsyncThunk(
  'template/updateTemplate',
  async ({ templateId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/templates/update-template/${templateId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update template');
    }
  }
);

/**
 * Delete template (Admin)
 */
export const deleteTemplate = createAsyncThunk(
  'template/deleteTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/templates/delete-template/${templateId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete template');
    }
  }
);

/**
 * Get template stats (Admin)
 */
export const getTemplateStats = createAsyncThunk(
  'template/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/templates/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  templates: [],
  currentTemplate: null,
  popularTemplates: [],
  categories: [],
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  isLoading: false,
  isLoadingPopular: false,
  isLoadingStats: false,
  error: null,
  message: null,
  selectedCategory: '',
};

// ==================== SLICE ====================

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all templates
      .addCase(getAllTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get template by ID
      .addCase(getTemplateById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTemplateById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTemplate = action.payload.data;
      })
      .addCase(getTemplateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get popular templates
      .addCase(getPopularTemplates.pending, (state) => {
        state.isLoadingPopular = true;
        state.error = null;
      })
      .addCase(getPopularTemplates.fulfilled, (state, action) => {
        state.isLoadingPopular = false;
        state.popularTemplates = action.payload.data;
      })
      .addCase(getPopularTemplates.rejected, (state, action) => {
        state.isLoadingPopular = false;
        state.error = action.payload;
      })

      // Get categories
      .addCase(getTemplateCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data;
      })

      // Add template
      .addCase(addTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(addTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update template
      .addCase(updateTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete template
      .addCase(deleteTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        // Remove deleted template from list
        state.templates = state.templates.filter(t => t._id !== action.payload.data.templateId);
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get stats
      .addCase(getTemplateStats.pending, (state) => {
        state.isLoadingStats = true;
        state.error = null;
      })
      .addCase(getTemplateStats.fulfilled, (state, action) => {
        state.isLoadingStats = false;
        state.stats = action.payload.data;
      })
      .addCase(getTemplateStats.rejected, (state, action) => {
        state.isLoadingStats = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, setSelectedCategory, clearCurrentTemplate } = templateSlice.actions;
export default templateSlice.reducer;
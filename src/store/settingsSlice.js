import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to load settings from the settings store
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async () => {
    try {
      const uiSettings = await window.electronAPI.getUISettings();
      return uiSettings;
    } catch (error) {
      console.error('Error loading UI settings:', error);
      return { showQuotes: true }; // Default if error
    }
  }
);

// Async thunk to save settings to the settings store
export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings) => {
    try {
      await window.electronAPI.saveUISettings(settings);
      return settings;
    } catch (error) {
      console.error('Error saving UI settings:', error);
      throw error;
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    showQuotes: true, // Default to showing quotes
    isLoading: false,
    error: null,
  },
  reducers: {
    toggleShowQuotes: (state) => {
      state.showQuotes = !state.showQuotes;
      // Save the updated setting
      window.electronAPI.saveUISettings({ showQuotes: state.showQuotes })
        .catch(error => console.error('Error saving showQuotes setting:', error));
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle loadSettings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        // Only update if we got valid settings
        if (action.payload && typeof action.payload.showQuotes === 'boolean') {
          state.showQuotes = action.payload.showQuotes;
        }
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Handle saveSettings
      .addCase(saveSettings.fulfilled, (state, action) => {
        // Update state with saved settings if needed
        if (action.payload && typeof action.payload.showQuotes === 'boolean') {
          state.showQuotes = action.payload.showQuotes;
        }
      });
  },
});

export const { toggleShowQuotes } = settingsSlice.actions;
export default settingsSlice.reducer;

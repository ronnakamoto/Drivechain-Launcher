import { createSlice } from '@reduxjs/toolkit';

const aboutModalSlice = createSlice({
  name: 'aboutModal',
  initialState: {
    isOpen: false,
  },
  reducers: {
    openAboutModal: (state) => {
      state.isOpen = true;
    },
    closeAboutModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openAboutModal, closeAboutModal } = aboutModalSlice.actions;
export default aboutModalSlice.reducer;

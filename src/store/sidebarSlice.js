import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  collapsed: false,
  activeItem: null
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    openSidebar: (state) => {
      state.isOpen = true;
    },
    closeSidebar: (state) => {
      state.isOpen = false;
    },
    toggleCollapse: (state) => {
      state.collapsed = !state.collapsed;
    },
    setActiveItem: (state, action) => {
      state.activeItem = action.payload;
    },
    clearActiveItem: (state) => {
      state.activeItem = null;
    }
  }
});

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleCollapse,
  setActiveItem,
  clearActiveItem
} = sidebarSlice.actions;

export default sidebarSlice.reducer;

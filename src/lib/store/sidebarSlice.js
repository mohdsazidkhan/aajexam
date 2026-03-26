import { createSlice } from '@reduxjs/toolkit'

// Initialize as false - will be set properly on client side
const initialState = {
  isOpen: false,
}

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen
    },
    openSidebar: (state) => {
      state.isOpen = true
    },
    closeSidebar: (state) => {
      state.isOpen = false
    },
  },
})

export const { toggleSidebar, openSidebar, closeSidebar } = sidebarSlice.actions

export default sidebarSlice.reducer

import { configureStore } from '@reduxjs/toolkit'
import sidebarSlice from './sidebarSlice'

export const store = configureStore({
  reducer: {
    sidebar: sidebarSlice,
  },
})
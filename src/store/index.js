import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './sidebarSlice';
import darkModeReducer from './darkModeSlice';
import languageReducer from './languageSlice';
import themeColorReducer from './themeColorSlice';
import fontReducer from './fontSlice';
import textSizeReducer from './textSizeSlice';

const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    darkMode: darkModeReducer,
    language: languageReducer,
    themeColor: themeColorReducer,
    font: fontReducer,
    textSize: textSizeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export default store;

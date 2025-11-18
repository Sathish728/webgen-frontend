import { configureStore } from '@reduxjs/toolkit'
import themeReducer from '../slice/themeSlice'
import authReducer from '../slice/authSlice'
import templateReducer from '../slice/templateSlice'
import websiteReducer from '../slice/websiteSlice'
import subscriptionReducer from '../slice/subscriptionSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        template: templateReducer,
        website: websiteReducer,
        subscription: subscriptionReducer,
    },
     middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
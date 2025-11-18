import { createSlice } from "@reduxjs/toolkit"

const initialTheme = localStorage.getItem("webgen-theme") || "forest" // Changed default

const themeSlice = createSlice({
    name: "theme",
    initialState: { 
        theme: initialTheme,
    },
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload
            localStorage.setItem("webgen-theme", action.payload)
            // Apply theme to document
            document.documentElement.setAttribute('data-theme', action.payload)
        }
    }
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
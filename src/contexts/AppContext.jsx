import { createContext, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('splitwise_user') || null)
  const [geminiApiKey, setGeminiApiKey] = useState(
    () => localStorage.getItem('splitwise_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || ''
  )

  useEffect(() => {
    if (currentUser) localStorage.setItem('splitwise_user', currentUser)
    else localStorage.removeItem('splitwise_user')
  }, [currentUser])

  useEffect(() => {
    if (geminiApiKey) localStorage.setItem('splitwise_gemini_key', geminiApiKey)
  }, [geminiApiKey])

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, geminiApiKey, setGeminiApiKey }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

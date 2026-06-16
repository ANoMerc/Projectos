import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { AppState, AppAction } from './types'
import { appReducer } from './reducer'
import { initialState } from './initialState'

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

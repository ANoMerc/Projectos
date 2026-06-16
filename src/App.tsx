import { AppProvider, useApp } from '@/store/AppContext'
import AuthService from '@/services/AuthService'
import AppShell from '@/components/AppShell'
import type { User } from '@/store/types'

function AuthGate() {
  const { state, dispatch } = useApp()

  const handleLogin = (user: User) => {
    dispatch({ type: 'LOGIN', user })
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  if (!state.currentUser) {
    return <AuthService onSuccess={handleLogin} />
  }

  return <AppShell onLogout={handleLogout} />
}

export default function App() {
  return (
    <AppProvider>
      <AuthGate />
    </AppProvider>
  )
}

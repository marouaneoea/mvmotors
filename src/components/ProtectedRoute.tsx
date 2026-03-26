import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setAuthenticated(!!data.session)
      setChecked(true)
    })
  }, [])

  if (!checked) return null

  return authenticated ? <>{children}</> : <Navigate to="/login" replace />
}

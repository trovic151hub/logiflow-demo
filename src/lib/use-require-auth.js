import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from './mock-store'

export function useRequireAuth() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getCurrentUser())
  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      navigate('/auth', { replace: true })
      return
    }
    setUser(u)
  }, [navigate])
  return user
}

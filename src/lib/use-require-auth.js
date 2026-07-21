import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from './mock-store'

export function useRequireAuth(requiredRole) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getCurrentUser())
  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      navigate('/auth', { replace: true })
      return
    }
    if (requiredRole && u.role !== requiredRole) {
      navigate(u.role === 'rider' ? '/rider' : '/customer', { replace: true })
      return
    }
    setUser(u)
  }, [navigate, requiredRole])
  return user
}

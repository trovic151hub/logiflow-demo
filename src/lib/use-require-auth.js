import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from './mock-store'

export function useRequireAuth(role) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  useEffect(() => {
    const u = getCurrentUser()
    if (!u) {
      navigate('/auth', { replace: true })
      return
    }
    if (u.role !== role) {
      navigate(u.role === 'rider' ? '/rider' : '/customer')
      return
    }
    setUser(u)
  }, [navigate, role])
  return user
}

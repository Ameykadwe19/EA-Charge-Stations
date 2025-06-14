import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const API_URL = import.meta.env.VITE_API_URL

export function useAuth() {
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
    localStorage.setItem('token', res.data.token)
    // Decode and store role (optional)
    const decoded = jwtDecode(res.data.token)
    localStorage.setItem('user', JSON.stringify(decoded))
  }

  const register = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { email, password })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const getToken = () => localStorage.getItem('token')

  const isLoggedIn = () => !!getToken()

  const getUser = () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  return {
    login,
    logout,
    getToken,
    isLoggedIn,
    register,
    getUser // now you can access role/id/email easily
  }
}

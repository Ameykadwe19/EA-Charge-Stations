import axios from 'axios'
import jwt_decode from 'jwt-decode' // needed for decoding

const API_URL = import.meta.env.VITE_API_URL

export function useAuth() {
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })

    const token = res.data.token
    localStorage.setItem('token', token)

    const decoded = jwt_decode(token)
    localStorage.setItem('role', decoded.role) // store role separately for UI

    return decoded.role // so Login.vue can redirect based on it
  }

  const register = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { email, password })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }

  const getToken = () => localStorage.getItem('token')

  const isLoggedIn = () => !!getToken()

  return { login, logout, getToken, isLoggedIn, register }
}

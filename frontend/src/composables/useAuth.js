import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function useAuth() {
  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
    localStorage.setItem('token', res.data.token)
  }

  const register = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, { email, password })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
  }

  const getToken = () => localStorage.getItem('token')

  const isLoggedIn = () => !!getToken()

  return { login, logout, getToken, isLoggedIn, register }
}

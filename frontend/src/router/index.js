import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ChargerList from '../views/ChargerList.vue'
import MapView from '../views/MapView.vue'
import { jwtDecode } from 'jwt-decode'


const routes = [
  {
    path: '/',
    redirect: '/chargers'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/chargers',
    name: 'ChargerList',
    component: ChargerList,
    meta: { requiresAuth: true } // accessible by both user and admin
  },
  {
    path: '/map',
    name: 'MapView',
    component: MapView,
    meta: { requiresAuth: true } // accessible by both user and admin
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🧠 Helper to decode role
function getUserRole() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const decoded = jwtDecode(token)
    return decoded.role
  } catch (err) {
    return null
  }
}

// 🔐 Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token
  const requiredRole = to.meta.role
  const userRole = getUserRole()

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Not logged in, block protected pages
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // Already logged in? Go to dashboard
    next('/chargers')
  } else if (requiredRole && requiredRole !== userRole) {
    // Role mismatch (e.g. user trying to access admin-only page)
    next('/chargers')
  } else {
    // Allow
    next()
  }
})

export default router

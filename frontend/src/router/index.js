import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ChargerList from '../views/ChargerList.vue'
import MapView from '../views/MapView.vue'
// import other views like Dashboard, Register, etc.

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
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'MapView',
    component: MapView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/chargers')
  } else {
    next()
  }
})

export default router

<template>
  <div id="app">
    <header class="navbar">
      <div class="navbar-content">
        <div class="logo">
          <img src="@/assets/logo.svg" alt="Logo" />
          <span>EA Charge Stations</span>
        </div>

        <!-- Desktop Nav -->
        <nav class="nav-links" v-if="!isMobile">
          <router-link
            v-if="currentPath !== '/chargers' && (isAdmin || isUser)"
            to="/chargers"
            class="nav-link"
          >
            <i class="fas fa-list"></i> List View
          </router-link>

          <router-link
            v-if="currentPath !== '/map' && (isAdmin || isUser)"
            to="/map"
            class="nav-link"
          >
            <i class="fas fa-map-marked-alt"></i> Map View
          </router-link>

          <button @click="handleLogout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </nav>

        <!-- Mobile Hamburger -->
        <div v-if="isMobile" class="hamburger" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </div>
      </div>

      <!-- Mobile Nav Menu -->
      <div v-if="showMobileMenu && isMobile" class="mobile-menu">
        <router-link
          v-if="currentPath === '/chargers' && (isAdmin || isUser)"
          to="/map"
          class="mobile-link"
          @click="toggleMobileMenu"
        >
          <i class="fas fa-map"></i> Map View
        </router-link>

        <router-link
          v-else-if="(isAdmin || isUser)"
          to="/chargers"
          class="mobile-link"
          @click="toggleMobileMenu"
        >
          <i class="fas fa-list"></i> List View
        </router-link>

        <button class="mobile-link" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, watchEffect, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'


const router = useRouter()
const route = useRoute()

const token = ref(localStorage.getItem('token'))
const role = ref(localStorage.getItem('role'))

const isAdmin = computed(() => role.value === 'admin')
const isUser = computed(() => role.value === 'user')

const currentPath = computed(() => route.path)
const isMobile = ref(window.innerWidth <= 768)
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  token.value = null
  role.value = null
  router.push('/login')
}

// Detect screen resize
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) showMobileMenu.value = false
}

window.addEventListener('resize', handleResize)

// Watch for route changes and decode token
watchEffect(() => {
  token.value = localStorage.getItem('token')
  if (token.value) {
    try {
      const decoded = jwtDecode(token.value)
      role.value = decoded.role
    } catch (err) {
      handleLogout()
    }
  }

  // Redirect to login if not logged in and not on login/register
  if (
    !token.value &&
    route.path !== '/login' &&
    route.path !== '/register'
  ) {
    router.push('/login')
  }
})

onMounted(() => {
  handleResize()
})
</script>

<style scoped>
/* Basic Styling */
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
}

.navbar-content {
  max-width: 1200px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1.2rem;
  color: #1f2937;
}

.logo img {
  height: 32px;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: #1f2937;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  color: #0061f2;
}

.logout-btn {
  background: transparent;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-weight: 500;
}

.hamburger {
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.mobile-link {
  color: #1f2937;
  font-weight: 500;
  text-decoration: none;
}

.mobile-link:hover {
  color: #0061f2;
}

main {
  padding: 1rem;
}
</style>

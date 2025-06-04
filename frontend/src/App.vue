<template>
  <div class="app">
    <!-- Navigation -->
    <nav v-if="isLoggedIn" class="navbar">
      <div class="nav-brand">
        <img src="@/assets/logo.svg" alt="Logo" class="nav-logo">
        <span>Charging Station</span>
      </div>
      
      <div class="nav-links">
        <router-link to="/chargers" class="nav-link">
          <i class="fas fa-list"></i>
          List View
        </router-link>
        <router-link to="/map" class="nav-link">
          <i class="fas fa-map-marked-alt"></i>
          Map View
        </router-link>
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main :class="{ 'with-nav': isLoggedIn }">
      <router-view></router-view>
      </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Add reactive token state
const token = ref(localStorage.getItem('token'))

// Update isLoggedIn to use token ref
const isLoggedIn = computed(() => {
  return token.value && route.path !== '/login' && route.path !== '/register'
})

// Watch for route changes to check token
watch(route, () => {
  token.value = localStorage.getItem('token')
})

// Handle logout
const handleLogout = () => {
  localStorage.removeItem('token')
  token.value = null
  router.push('/login')
}

// Check token on mount
onMounted(() => {
  token.value = localStorage.getItem('token')
})
</script>

<style>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.5;
  color: #1e293b;
  background: #f8fafc;
}

#app {
  height: 100%;
}

/* App Layout */
.app {
  min-height: 100vh;
  background: #f8fafc;
}

/* Navbar Styles */
.navbar {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.nav-logo {
  height: 32px;
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #f1f5f9;
  color: #0061f2;
}

.logout-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #fecaca;
}

/* Main Content */
main {
  min-height: 100vh;
  padding: 1rem;
}

main.with-nav {
  padding-top: calc(64px + 1rem);
}

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Leaflet Map Fixes */
.leaflet-container {
  height: 100%;
  width: 100%;
  z-index: 1;
}

.leaflet-div-icon {
  background: transparent;
  border: none;
}

/* Form Styles */
input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #0061f2;
  box-shadow: 0 0 0 3px rgba(0, 97, 242, 0.1);
}

button {
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  transition: all 0.3s;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

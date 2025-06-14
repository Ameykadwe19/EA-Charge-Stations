<template>
  <div class="app">
    <!-- Navigation -->
    <nav v-if="isLoggedIn" class="navbar">
      <div class="nav-brand">
        <img src="@/assets/logo.svg" alt="Logo" class="nav-logo" />
        <span>Charging Station</span>
        <span v-if="userRole === 'admin'" class="admin-label">Admin</span>
      </div>

      <!-- Desktop Nav Links -->
      <div class="nav-links">
        <router-link to="/chargers" class="nav-link">
          <i class="fas fa-list"></i> List View
        </router-link>
        <router-link to="/map" class="nav-link">
          <i class="fas fa-map-marked-alt"></i> Map View
        </router-link>
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <!-- Hamburger for mobile -->
      <button class="hamburger" @click="toggleMobileMenu" v-if="isMobile">
        <i :class="showMobileMenu ? 'fas fa-times' : 'fas fa-bars'"></i>
      </button>
    </nav>

    <!-- Mobile Dropdown Menu -->
    <div v-if="showMobileMenu && isMobile" class="mobile-menu">
      <router-link
        v-if="currentPath === '/chargers'"
        to="/map"
        class="mobile-link"
        @click="toggleMobileMenu"
      >
        <i class="fas fa-map"></i> Map View
      </router-link>
      <router-link
        v-else
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

    <!-- Main Content -->
    <main :class="{ 'with-nav': isLoggedIn }">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const router = useRouter()
const route = useRoute()

const token = ref(localStorage.getItem('token'))
const userRole = ref(null) //  to store decoded role
const showMobileMenu = ref(false)

const isLoggedIn = computed(() => token.value && route.path !== '/login' && route.path !== '/register')
const currentPath = computed(() => route.path)
const isMobile = computed(() => window.innerWidth <= 768)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = () => {
  localStorage.removeItem('token')
  token.value = null
  showMobileMenu.value = false
  router.push('/login')
}

watch(route, () => {
  token.value = localStorage.getItem('token')
  showMobileMenu.value = false
  decodeRole()
})

onMounted(() => {
  token.value = localStorage.getItem('token')
  decodeRole()

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    const menu = document.querySelector('.mobile-menu')
    const button = document.querySelector('.hamburger')

    if (
      menu &&
      !menu.contains(e.target) &&
      button &&
      !button.contains(e.target)
    ) {
      showMobileMenu.value = false
    }
  })
})

//  Decode JWT role
const decodeRole = () => {
  try {
    const decoded = jwtDecode(token.value)
    userRole.value = decoded?.role
  } catch (err) {
    userRole.value = null
  }
}
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

.app {
  min-height: 100vh;
  background: #f8fafc;
}

/* Navbar */
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

main {
  min-height: 100vh;
  padding: 1rem;
}

main.with-nav {
  padding-top: calc(64px + 1rem);
}

/* Hamburger button */
.hamburger {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #1e293b;
  cursor: pointer;
  display: none;
  margin-left: auto;
}


.mobile-menu {
  position: fixed; 
  top: 64px; 
  right: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 9999; 
  min-width: 180px;
  max-height: calc(100vh - 80px); 
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  animation: dropdownFade 0.25s ease-out;
}

@keyframes dropdownFade {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-link {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: white;
  text-decoration: none;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.mobile-link:last-child {
  border-bottom: none;
}

.mobile-link:hover {
  background: #f8fafc;
  color: #0061f2;
}

/* Mobile styles */
@media (max-width: 768px) {
  .nav-links {
    display: none !important;
  }

  .hamburger {
    display: block;
  }

  main.with-nav {
    padding-top: 120px;
  }
}

/*  Admin label */
.admin-label {
  margin-left: 1rem;
  background-color: #10b981;
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
}
</style>

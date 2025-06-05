<template>
  <div class="app">
    <!-- Navigation -->
    <nav v-if="isLoggedIn" class="navbar">
      <div class="nav-brand">
        <img src="@/assets/logo.svg" alt="Logo" class="nav-logo" />
        <span>Charging Station</span>
      </div>

      <!-- Desktop Nav -->
      <div class="nav-links desktop-only">
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

      <!-- Mobile Hamburger -->
      <div class="hamburger mobile-only" @click="menuOpen = !menuOpen">
        <i class="fas fa-bars"></i>
      </div>

      <!-- Mobile Menu -->
      <div v-if="menuOpen" class="mobile-menu">
        <router-link
          v-if="$route.path === '/chargers'"
          to="/map"
          class="nav-link"
          @click="menuOpen = false"
        >
          <i class="fas fa-map-marked-alt"></i>
          Map View
        </router-link>
        <router-link
          v-if="$route.path === '/map'"
          to="/chargers"
          class="nav-link"
          @click="menuOpen = false"
        >
          <i class="fas fa-list"></i>
          List View
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)

const token = ref(localStorage.getItem('token'))

const isLoggedIn = computed(() => {
  return token.value && route.path !== '/login' && route.path !== '/register'
})

watch(route, () => {
  token.value = localStorage.getItem('token')
  menuOpen.value = false // close on route change
})

const handleLogout = () => {
  localStorage.removeItem('token')
  token.value = null
  menuOpen.value = false
  router.push('/login')
}

onMounted(() => {
  token.value = localStorage.getItem('token')
})
</script>

<style scoped>
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

.hamburger {
  font-size: 1.5rem;
  cursor: pointer;
  color: #1e293b;
}

/* Mobile dropdown menu */
.mobile-menu {
  position: absolute;
  top: 64px;
  right: 1rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1001;
  animation: slideDown 0.2s ease-in-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive visibility */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  main.with-nav {
    padding-top: 120px;
  }
}
</style>

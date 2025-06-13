<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="login-logo" />
        <h1>Welcome Back</h1>
        <p>Sign in to manage your charging stations</p>
      </div>

      <!-- Success Message -->
      <div v-if="$route.query.message" class="alert-success">
        <i class="fas fa-check-circle"></i>
        {{ $route.query.message }}
      </div>

      <!--  LOGIN FORM -->
      <form @submit.prevent="submitLogin" class="login-form">
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i>
            Email Address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            :class="['form-input', { error: errors.email }]"
            placeholder="Enter your email"
            required
            autocomplete="username"
            @input="validateEmail"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Password
          </label>
          <div class="password-input">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :class="['form-input', { error: errors.password }]"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
              @input="validatePassword"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <button type="submit" class="login-button" :disabled="loading || !isFormValid">
          <span v-if="!loading">Sign In</span>
          <div v-else class="spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
        </button>

        <div v-if="error" class="alert-error">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>
      </form>

      <!-- MOVED OUTSIDE THE FORM -->
      <div class="login-footer">
        <p>
          Don't have an account?
          <router-link to="/register" class="register-link">
            Register here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const errors = ref({
  email: '',
  password: ''
})

// Validation functions
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
  } else {
    errors.value.email = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  } else {
    errors.value.password = ''
  }
}

const isFormValid = computed(() => {
  return email.value && password.value && !errors.value.email && !errors.value.password
})

async function submitLogin() {
  validateEmail()
  validatePassword()

  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    const response = await login(email.value, password.value)
    const token = response.token || response.data?.token

    if (token) {
      localStorage.setItem('token', token)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const role = payload.role
      localStorage.setItem('role', role)
      router.push('/chargers')
    } else {
      error.value = 'Login failed: No token received'
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.message) {
    setTimeout(() => {
      router.replace({ path: route.path, query: {} })
    }, 3000)
  }
})
</script>

<style scoped>
/* Same styles — no changes needed */
</style>

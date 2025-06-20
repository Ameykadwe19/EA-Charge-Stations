<template>
  <div class="login-container">
    <div class="login-card">
<p 
  v-if="successMessage" 
  class="text-green-700 bg-green-100 border border-green-300 rounded-md px-4 py-2 mb-3 text-sm text-center shadow-sm"
>
  ✅ Account created successfully! Please log in.
</p>

      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="login-logo">
        <h1>Welcome Back</h1>
        <p>Sign in to manage your charging stations</p>
      </div>

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
            :class="['form-input', { 'error': errors.email }]"
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
              :class="['form-input', { 'error': errors.password }]"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
              @input="validatePassword"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <button 
          type="submit" 
          class="login-button" 
          :disabled="loading || !isFormValid"
        >
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

      <div class="login-footer">
        <p>Don't have an account? 
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

const successMessage = ref(false)

onMounted(() => {
  if (route.query.success === '1') {
    successMessage.value = true
    setTimeout(() => {
      successMessage.value = false
    }, 3000)
  }
})

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
  return email.value && 
         password.value && 
         !errors.value.email && 
         !errors.value.password
})

async function submitLogin() {
  validateEmail()
  validatePassword()
  
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''
  
  try {
    await login(email.value, password.value)
    router.push('/chargers')
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #64748b;
  font-size: 0.875rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-group label i {
  margin-right: 0.5rem;
  color: #64748b;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #0061f2;
  box-shadow: 0 0 0 3px rgba(0, 97, 242, 0.1);
}

.form-input.error {
  border-color: #dc2626;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
}

.error-message {
  display: block;
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.login-button {
  width: 100%;
  padding: 0.875rem;
  background: #0061f2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button:hover:not(:disabled) {
  background: #0052cc;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner i {
  font-size: 1.25rem;
}

.alert-error {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.login-footer {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.register-link {
  color: #0061f2;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.register-link:hover {
  color: #0052cc;
  text-decoration: underline;
}
</style>

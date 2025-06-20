<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <img src="@/assets/logo.svg" alt="Logo" class="register-logo">
        <h1>Create Account</h1>
        <p>Join us to manage your charging stations</p>
      </div>

      <form @submit.prevent="submitRegister" class="register-form">
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
            autocomplete="email"
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
              placeholder="Create a password"
              required
              autocomplete="new-password"
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
          class="register-button" 
          :disabled="loading || !isFormValid"
        >
          <span v-if="!loading">Create Account</span>
          <div v-else class="spinner">
            <i class="fas fa-circle-notch fa-spin"></i>
          </div>
        </button>

        <div v-if="error" class="alert-error">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
        </div>
      </form>

      <div class="register-footer">
        <p>Already have an account? 
          <router-link to="/login" class="login-link">
            Sign in here
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { register } = useAuth()

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

async function submitRegister() {
  validateEmail()
  validatePassword()
  
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''
  
  try {
    await register(email.value, password.value)
    router.push({ path: '/login', query: { success: '1' } })
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-logo {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
}

.register-header h1 {
  font-size: 1.75rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.register-header p {
  color: #64748b;
  font-size: 0.875rem;
}

.register-form {
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background: #0052cc;
}

.register-button:disabled {
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

.register-footer {
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.login-link {
  color: #0061f2;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.login-link:hover {
  color: #0052cc;
  text-decoration: underline;
}
</style> 

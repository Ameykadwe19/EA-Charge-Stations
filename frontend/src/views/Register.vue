<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <img src="@/assets/logo.svg" alt="Logo" class="register-logo" />
        <h1>Create Account</h1>
        <p>Register to access EV charging stations dashboard</p>
      </div>

      <form @submit.prevent="submitRegister" class="register-form">
        <div class="form-group">
          <label for="name">
            <i class="fas fa-user"></i>
            Full Name
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="form-input"
            placeholder="Enter your name"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i>
            Email Address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Create a password"
            required
            autocomplete="new-password"
          />
        </div>

        <button
          type="submit"
          class="register-button"
          :disabled="loading || !isFormValid"
        >
          <span v-if="!loading">Register</span>
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
          <router-link to="/login" class="login-link">Login here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const router = useRouter()

const isFormValid = computed(() => {
  return name.value && email.value && password.value.length >= 6
})

async function submitRegister() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    await axios.post('http://localhost:3000/api/register', {
      name: name.value,
      email: email.value,
      password: password.value
    })

    // ✅ Redirect to login with success message
    router.push({
      path: '/login',
      query: { message: 'Registration successful! Please log in.' }
    })

  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Try again.'
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
  background: linear-gradient(135deg, #e0f7fa, #e1f5fe);
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
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
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
}

.register-button {
  width: 100%;
  padding: 0.875rem;
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.register-button:hover:not(:disabled) {
  background: #0369a1;
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
  color: #0284c7;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.login-link:hover {
  color: #0369a1;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .register-card {
    padding: 1.25rem;
  }

  .register-logo {
    width: 48px;
    height: 48px;
  }

  .register-header h1 {
    font-size: 1.5rem;
  }

  .form-input {
    padding: 0.65rem 0.85rem;
    font-size: 0.85rem;
  }

  .register-button {
    padding: 0.75rem;
    font-size: 0.85rem;
  }

  .register-footer {
    font-size: 0.8rem;
  }
}
</style>

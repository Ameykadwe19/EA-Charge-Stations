<template>
  <div class="card p-3 mb-3">
    <h4>{{ charger?.id ? 'Edit Charger' : 'Add Charger' }}</h4>

    <form @submit.prevent="submit">
      <div class="mb-3">
        <label>Name</label>
        <input v-model="form.name" required class="form-control" />
      </div>

      <div class="mb-3 d-flex gap-2">
        <div>
          <label>Latitude</label>
          <input type="number" step="any" v-model.number="form.latitude" required class="form-control" />
        </div>
        <div>
          <label>Longitude</label>
          <input type="number" step="any" v-model.number="form.longitude" required class="form-control" />
        </div>
      </div>

      <div class="mb-3">
        <label>Status</label>
        <select v-model="form.status" required class="form-select">
          <option value="" disabled>Select status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div class="mb-3">
        <label>Power Output (kW)</label>
        <input
          type="number"
          min="0"
          step="any"
          v-model.number="form.powerOutput"
          required
          class="form-control"
        />
      </div>

      <div class="mb-3">
        <label>Connector Type</label>
        <select v-model="form.connectorType" required class="form-select">
          <option value="" disabled>Select connector</option>
          <option value="Type 1">Type 1</option>
          <option value="Type 2">Type 2</option>
          <option value="CCS2">CCS2</option>
          <option value="CHAdeMO">CHAdeMO</option>
          <option value="GB/T">GB/T</option>
          <option value="Ather">Ather</option>
          <option value="Bharat AC-001">Bharat AC-001</option>
          <option value="Bharat DC-001">Bharat DC-001</option>
          <option value="Tesla">Tesla</option>
        </select>
      </div>

      <button class="btn btn-success me-2" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save' }}
      </button>
      <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancel</button>
    </form>

    <div v-if="error" class="alert alert-danger mt-2">{{ error }}</div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  charger: Object
})

const emit = defineEmits(['close', 'refresh'])

const form = ref({
  name: '',
  latitude: 0,
  longitude: 0,
  status: '',
  powerOutput: 0,
  connectorType: ''
})

const loading = ref(false)
const error = ref('')
const token = localStorage.getItem('token')

// Backend base URL from env, fallback to localhost without trailing slash
const API_BASE_RAW = import.meta.env.VITE_API_URL || 'http://localhost:5000'
// Append /api consistently
const API_BASE_URL = API_BASE_RAW.endsWith('/') ? API_BASE_RAW + 'api' : API_BASE_RAW + '/api'

watch(
  () => props.charger,
  (val) => {
    if (val) {
      form.value = { ...val }
    } else {
      form.value = {
        name: '',
        latitude: 0,
        longitude: 0,
        status: '',
        powerOutput: 0,
        connectorType: ''
      }
    }
  },
  { immediate: true }
)

async function submit() {
  loading.value = true
  error.value = ''
  try {
    if (form.value.id) {
      // 🔄 Update charger
      await axios.put(`${API_BASE_URL}/chargers/${form.value.id}`, form.value, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      //  Create charger
      await axios.post(`${API_BASE_URL}/chargers`, form.value, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    emit('refresh')
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save charger'
  } finally {
    loading.value = false
  }
}
</script>

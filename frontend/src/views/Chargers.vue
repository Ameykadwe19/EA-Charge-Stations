<template>
  <div>
    <h2>Charging Stations</h2>

    <!-- Filter Controls -->
    <div class="row g-2 mb-3 align-items-end">
      <div class="col-6 col-md-auto">
        <label class="form-label mb-1">Status</label>
        <select v-model="filters.status" class="form-select">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div class="col-6 col-md-auto">
        <label class="form-label mb-1">Connector</label>
        <select v-model="filters.connectorType" class="form-select">
          <option value="">All Connectors</option>
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

      <div class="col-12 col-md-auto">
        <label class="form-label mb-1">Min Power Output (kW)</label>
        <input
          v-model="filters.powerOutput"
          type="number"
          class="form-control"
          placeholder="e.g. 50"
        />
      </div>

      <div class="col-12 col-md text-md-end">
        <button class="btn btn-primary w-100 w-md-auto" @click="showAddForm = true">
          Add Charger
        </button>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading chargers...</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Charger Table -->
    <div class="table-responsive">
      <table v-if="!loading && chargers.length" class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>Name</th>
            <th>Location (Lat, Lng)</th>
            <th>Status</th>
            <th>Power (kW)</th>
            <th>Connector</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="charger in filteredChargers" :key="charger.id">
            <td>{{ charger.name }}</td>
            <td>{{ charger.latitude.toFixed(4) }}, {{ charger.longitude.toFixed(4) }}</td>
            <td>{{ charger.status }}</td>
            <td>{{ charger.powerOutput }}</td>
            <td>{{ charger.connectorType }}</td>
            <td>
              <button class="btn btn-sm btn-warning me-2" @click="editCharger(charger)">
                Edit
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteCharger(charger.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <p v-if="!loading && !chargers.length" class="text-muted mt-4">No chargers found.</p>

    <!-- Modal Form -->
    <ChargerForm
      v-if="showAddForm || editingCharger"
      :charger="editingCharger"
      @close="closeForm"
      @refresh="fetchChargers"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import ChargerForm from '../components/ChargerForm.vue'

// API base URL from environment variable, fallback localhost
const API_BASE_URL_RAW = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_BASE_URL = API_BASE_URL_RAW.endsWith('/') ? API_BASE_URL_RAW + 'api' : API_BASE_URL_RAW + '/api'


// Reactive states
const chargers = ref([])
const loading = ref(false)
const error = ref('')
const showAddForm = ref(false)
const editingCharger = ref(null)

const filters = reactive({
  status: '',
  connectorType: '',
  powerOutput: ''
})

// Fetch chargers with latest token each time
const fetchChargers = async () => {
  loading.value = true
  error.value = ''
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get(`${API_BASE_URL}/chargers`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    chargers.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load chargers'
  } finally {
    loading.value = false
  }
}

const filteredChargers = computed(() => {
  return chargers.value.filter(c => {
    return (
      (filters.status === '' || c.status === filters.status) &&
      (filters.connectorType === '' || c.connectorType === filters.connectorType) &&
      (filters.powerOutput === '' || c.powerOutput >= Number(filters.powerOutput))
    )
  })
})

function editCharger(charger) {
  editingCharger.value = { ...charger }
  showAddForm.value = true
}

async function deleteCharger(id) {
  if (!confirm('Are you sure you want to delete this charger?')) return

  const token = localStorage.getItem('token')
  try {
    await axios.delete(`${API_BASE_URL}/chargers/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchChargers()
  } catch (err) {
    alert('Failed to delete charger')
  }
}

function closeForm() {
  editingCharger.value = null
  showAddForm.value = false
}

onMounted(() => {
  fetchChargers()
})
</script>

<style scoped>
@media (max-width: 576px) {
  th,
  td {
    white-space: nowrap;
    font-size: 0.85rem;
  }

  .btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }

  .form-control,
  .form-select {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
  }

  .table {
    font-size: 0.875rem;
  }
}
</style> 

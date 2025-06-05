<template>
  <div class="charger-list">
    <!-- Filters -->
    <div class="filters mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <select v-model="filters.status" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="filters.connectorType" class="form-select">
            <option value="">All Connectors</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="Tesla">Tesla</option>
          </select>
        </div>
        <div class="col-md-3">
          <input 
            type="number" 
            v-model="filters.minPower" 
            class="form-control" 
            placeholder="Min Power (kW)"
          >
        </div>
        <div class="col-md-3">
          <button @click="openAddModal" class="btn btn-primary w-100">
            Add New Charger
          </button>
        </div>
      </div>
    </div>

    <!-- Chargers Table -->
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Power Output</th>
            <th>Connector Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="charger in filteredChargers" :key="charger.id">
            <td>{{ charger.name }}</td>
            <td>{{ formatLocation(charger) }}</td>
            <td>
              <span :class="getStatusClass(charger.status)">
                {{ charger.status }}
              </span>
            </td>
            <td>{{ charger.powerOutput }} kW</td>
            <td>{{ charger.connectorType }}</td>
            <td>
              <button @click="editCharger(charger)" class="btn btn-sm btn-outline-primary me-2">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteCharger(charger.id)" class="btn btn-sm btn-outline-danger">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" ref="chargerModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingCharger ? 'Edit' : 'Add' }} Charger</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCharger">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model="chargerForm.name" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  v-model.number="chargerForm.latitude"
                  required
                  class="form-control"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  v-model.number="chargerForm.longitude"
                  required
                  class="form-control"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Power Output (kW)</label>
                <input v-model="chargerForm.powerOutput" type="number" step="0.1" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Connector Type</label>
                <select v-model="chargerForm.connectorType" class="form-select" required>
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
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select v-model="chargerForm.status" class="form-select" required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Modal } from 'bootstrap'

//  Use deployed backend base URL with fallback and correct '/api' suffix
const API_BASE_RAW = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_BASE_URL = API_BASE_RAW.endsWith('/') ? API_BASE_RAW + 'api' : API_BASE_RAW + '/api'

const chargers = ref([])
const filters = ref({
  status: '',
  connectorType: '',
  minPower: ''
})
const chargerForm = ref({
  name: '',
  latitude: '',
  longitude: '',
  powerOutput: '',
  connectorType: '',
  status: 'active'
})
const editingCharger = ref(null)
let modal = null

// Fetch chargers
const fetchChargers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chargers`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    chargers.value = response.data
  } catch (error) {
    console.error('Error fetching chargers:', error)
  }
}

// Filter chargers
const filteredChargers = computed(() => {
  return chargers.value.filter(charger => {
    const matchesStatus = !filters.value.status || charger.status === filters.value.status
    const matchesType = !filters.value.connectorType || charger.connectorType === filters.value.connectorType
    const matchesPower = !filters.value.minPower || charger.powerOutput >= filters.value.minPower
    return matchesStatus && matchesType && matchesPower
  })
})

// Format location
const formatLocation = (charger) => {
  return `${charger.latitude.toFixed(6)}, ${charger.longitude.toFixed(6)}`
}

// Get status class
const getStatusClass = (status) => {
  return {
    'badge bg-success': status === 'active',
    'badge bg-danger': status === 'inactive'
  }
}

// CRUD operations
const openAddModal = () => {
  editingCharger.value = null
  chargerForm.value = {
    name: '',
    latitude: '',
    longitude: '',
    powerOutput: '',
    connectorType: '',
    status: 'active'
  }
  modal.show()
}

const editCharger = (charger) => {
  editingCharger.value = charger
  chargerForm.value = { ...charger }
  modal.show()
}

const saveCharger = async () => {
  try {
    const url = `${API_BASE_URL}/chargers${editingCharger.value ? `/${editingCharger.value.id}` : ''}`
    const method = editingCharger.value ? 'put' : 'post'
    
    await axios[method](url, chargerForm.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    
    await fetchChargers()
    modal.hide()
  } catch (error) {
    console.error('Error saving charger:', error)
  }
}

const deleteCharger = async (id) => {
  if (!confirm('Are you sure you want to delete this charger?')) return
  
  try {
    await axios.delete(`${API_BASE_URL}/chargers/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    await fetchChargers()
  } catch (error) {
    console.error('Error deleting charger:', error)
  }
}

onMounted(() => {
  modal = new Modal(document.querySelector('.modal'))
  fetchChargers()
})
</script>

<style scoped>
.charger-list {
  padding: 2rem;
}

.filters {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5em 0.75em;
}
</style>




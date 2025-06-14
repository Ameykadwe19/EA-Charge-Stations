
<template>
  <div class="charger-list">
    <header class="page-header">
      <div class="header-content">
        <h1>Charging Stations</h1>
        <button class="add-button" @click="openAddModal">
          <i class="fas fa-plus"></i>
          Add New Station
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading charging stations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchChargers" class="retry-btn">
        <i class="fas fa-redo"></i>
        Retry
      </button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="Search stations..."
          >
        </div>
        
        <div class="filter-group">
          <div class="filter-item">
            <label>Status</label>
            <select v-model="filters.status">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="filter-item">
            <label>Connector Type</label>
            <select v-model="filters.connectorType">
              <option value="">All Types</option>
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
              <option value="CCS">CCS</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="Tesla">Tesla</option>
            </select>
          </div>

          <div class="filter-item">
            <label>Min Power (kW)</label>
            <input 
              v-model.number="filters.minPower" 
              type="number" 
              min="0"
              placeholder="Min power"
            >
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!chargers.length" class="empty-state">
        <i class="fas fa-charging-station"></i>
        <h2>No Charging Stations Yet</h2>
        <p>Add your first charging station to get started!</p>
        <button @click="openAddModal" class="add-button">
          <i class="fas fa-plus"></i>
          Add New Station
        </button>
      </div>

      <!-- Chargers Grid -->
      <div v-else class="chargers-grid">
        <div v-for="charger in filteredChargers" 
             :key="charger.id" 
             class="charger-card"
        >
          <div class="card-header">
            <h3>{{ charger.name }}</h3>
            <div class="status-badge" :class="charger.status">
              {{ charger.status }}
            </div>
          </div>

          <div class="card-body">
            <div class="info-row">
              <i class="fas fa-map-marker-alt"></i>
              <span>{{ formatLocation(charger) }}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-bolt"></i>
              <span>{{ charger.powerOutput }} kW</span>
            </div>
            <div class="info-row">
              <i class="fas fa-plug"></i>
              <span>{{ charger.connectorType }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button @click="editCharger(charger)" class="edit-btn">
              <i class="fas fa-edit"></i>
              Edit
            </button>
            <button @click="confirmDelete(charger)" class="delete-btn">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCharger ? 'Edit' : 'Add' }} Charging Station</h2>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveCharger" class="modal-form">
          <div class="form-group">
            <label>Name</label>
            <input v-model="chargerForm.name" type="text" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Latitude</label>
              <input v-model.number="chargerForm.latitude" type="number" step="0.000001" required>
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input v-model.number="chargerForm.longitude" type="number" step="0.000001" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Power Output (kW)</label>
              <input v-model.number="chargerForm.powerOutput" type="number" min="0" step="any" required>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="chargerForm.status" required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Connector Type</label>
            <select v-model="chargerForm.connectorType" required>
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
              <option value="CCS">CCS</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="Tesla">Tesla</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
            <button type="submit" class="save-btn" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <span v-else>{{ editingCharger ? 'Save Changes' : 'Add Station' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { jwtDecode } from "jwt-decode";

const router = useRouter()

const chargers = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const editingCharger = ref(null)
const saving = ref(false)

const filters = ref({
  search: '',
  status: '',
  connectorType: '',
  minPower: null
})

const chargerForm = ref({
  name: '',
  latitude: '',
  longitude: '',
  powerOutput: '',
  connectorType: '',
  status: 'active'
})

const API_URL = import.meta.env.VITE_API_URL + '/api'

// === JWT Decode for User Role ===
const token = localStorage.getItem('token')
let currentUser = null
let isAdmin = false

if (token) {
  try {
    const decoded = jwtDecode(token)
    currentUser = decoded
    isAdmin = decoded.role === 'admin'
  } catch (e) {
    console.error('JWT decode error:', e)
  }
}

// === Fetch Chargers (same endpoint for both admin and user) ===
const fetchChargers = async () => {
  loading.value = true
  error.value = null

  try {
    const url = `${API_URL}/chargers`

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    chargers.value = response.data
  } catch (err) {
    console.error('Error fetching chargers:', err)
    if (err.response?.status === 401) {
      error.value = 'Please log in to view charging stations.'
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    } else {
      error.value = err.response?.data?.message || 'Failed to load charging stations'
    }
  } finally {
    loading.value = false
  }
}

// === Filters (includes role-based filtering now) ===
const filteredChargers = computed(() => {
  return chargers.value
    .filter(charger => {
      if (isAdmin) return true
      return charger.userId === currentUser.userId
    })
    .filter(charger => {
      const matchesSearch = !filters.value.search || 
        charger.name.toLowerCase().includes(filters.value.search.toLowerCase())
      const matchesStatus = !filters.value.status || 
        charger.status === filters.value.status
      const matchesType = !filters.value.connectorType || 
        charger.connectorType === filters.value.connectorType
      const matchesPower = !filters.value.minPower || 
        charger.powerOutput >= filters.value.minPower
      return matchesSearch && matchesStatus && matchesType && matchesPower
    })
})

// === Format Lat/Lng ===
const formatLocation = (charger) => {
  return `${charger.latitude.toFixed(6)}, ${charger.longitude.toFixed(6)}`
}

// === Open Modal for Add ===
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
  showModal.value = true
}

// === Open Modal for Edit ===
const editCharger = (charger) => {
  editingCharger.value = charger
  chargerForm.value = { ...charger }
  showModal.value = true
}

// === Close Modal ===
const closeModal = () => {
  showModal.value = false
  editingCharger.value = null
}

// === Validation ===
const validateForm = () => {
  const errors = []

  if (!chargerForm.value.name?.trim()) {
    errors.push('Name is required')
  }
  if (!chargerForm.value.latitude || isNaN(chargerForm.value.latitude)) {
    errors.push('Valid latitude is required')
  } else if (chargerForm.value.latitude < -90 || chargerForm.value.latitude > 90) {
    errors.push('Latitude must be between -90 and 90')
  }
  if (!chargerForm.value.longitude || isNaN(chargerForm.value.longitude)) {
    errors.push('Valid longitude is required')
  } else if (chargerForm.value.longitude < -180 || chargerForm.value.longitude > 180) {
    errors.push('Longitude must be between -180 and 180')
  }
  if (!chargerForm.value.powerOutput || chargerForm.value.powerOutput <= 0) {
    errors.push('Power output must be greater than 0')
  }
  if (!chargerForm.value.connectorType) {
    errors.push('Connector type is required')
  }

  return errors
}

// === Save Charger (Add or Update) ===
const saveCharger = async () => {
  const errors = validateForm()
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }

  saving.value = true
  try {
    const url = `${API_URL}/chargers${editingCharger.value ? `/${editingCharger.value.id}` : ''}`
    const method = editingCharger.value ? 'put' : 'post'

    await axios[method](url, chargerForm.value, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    await fetchChargers()
    closeModal()
  } catch (error) {
    console.error('Error saving charger:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      alert('Please log in to continue.')
      router.push('/login')
    } else {
      alert(error.response?.data?.message || 'Error saving charger. Please try again.')
    }
  } finally {
    saving.value = false
  }
}

// === Delete Charger ===
const confirmDelete = async (charger) => {
  if (!confirm(`Are you sure you want to delete ${charger.name}?`)) return

  try {
    await axios.delete(`${API_URL}/chargers/${charger.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    await fetchChargers()
  } catch (error) {
    console.error('Error deleting charger:', error)
    if (error.response?.status === 401) {
      alert('Please log in to continue.')
      router.push('/login')
    } else {
      alert(error.response?.data?.message || 'Error deleting charger. Please try again.')
    }
  }
}

onMounted(fetchChargers)
</script>



<style scoped>
.charger-list {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 2rem;
  color: #1e293b;
  margin: 0;
}

.add-button {
  background: #0061f2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background: #0052cc;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.filter-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.filter-item select,
.filter-item input {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.chargers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.charger-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.charger-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.card-body {
  padding: 1.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #64748b;
}

.info-row i {
  width: 1rem;
  color: #0061f2;
}

.card-actions {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  gap: 1rem;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn {
  background: #eff6ff;
  color: #1d4ed8;
}

.edit-btn:hover {
  background: #dbeafe;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1.25rem;
}

.modal-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #0061f2;
  box-shadow: 0 0 0 3px rgba(0, 97, 242, 0.1);
  outline: none;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.save-btn {
  background: #0061f2;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-btn:hover {
  background: #0052cc;
}

.save-btn:disabled {
  background: #99b8e8;
  cursor: not-allowed;
}

.loading-container,
.error-container,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  font-size: 2rem;
  color: #0061f2;
}

.error-container {
  color: #dc2626;
}

.error-container i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  background: #0061f2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem auto 0;
}

.empty-state {
  color: #64748b;
}

.empty-state i {
  font-size: 4rem;
  color: #0061f2;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
}
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .filters-section {
    padding: 1rem;
  }

  .chargers-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}

</style>

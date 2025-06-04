<template>
  <div>
    <h2>Charging Stations</h2>

    <div class="d-flex gap-3 mb-3 flex-wrap">
      <select v-model="filters.status" class="form-select" style="max-width: 150px;">
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      <select v-model="filters.connectorType" class="form-select" style="max-width: 150px;">
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

      <input
        v-model="filters.powerOutput"
        type="number"
        class="form-control"
        placeholder="Min Power Output (kW)"
        style="max-width: 180px;"
      />
      <button class="btn btn-primary ms-auto" @click="showAddForm = true">Add Charger</button>
    </div>

    <div v-if="loading" class="text-center">Loading chargers...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <table v-if="!loading && chargers.length" class="table table-bordered table-hover">
      <thead>
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
            <button class="btn btn-sm btn-warning me-2" @click="editCharger(charger)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deleteCharger(charger.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && !chargers.length">No chargers found.</p>

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

const API_URL = 'http://localhost:5000/api/chargers'
const token = localStorage.getItem('token')

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

const fetchChargers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(API_URL, {
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

  try {
    await axios.delete(`${API_URL}/${id}`, {
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

<template>
  <div class="map-view">
    <h2>Map View</h2>
    <div class="map-container">
      <!-- Side Details Panel -->
      <div class="side-panel">
        <h3>Charging Stations</h3>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search by name..."
          class="search-input"
        />
        <div class="station-list">
          <div v-if="loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading stations...
          </div>
          <div v-else-if="error" class="error">
            {{ error }}
          </div>
          <div 
            v-else
            v-for="station in filteredStations" 
            :key="station.id"
            class="station-item"
            :class="{ 'active': selectedStation?.id === station.id }"
            @click="selectStation(station)"
          >
            <div class="station-header">
              <h4>{{ station.name }}</h4>
              <span class="status-badge" :class="station.status">
                {{ station.status }}
              </span>
            </div>
            <div class="station-details">
              <div class="detail-row">
                <i class="fas fa-bolt"></i>
                <span>{{ station.powerOutput }} kW</span>
              </div>
              <div class="detail-row">
                <i class="fas fa-plug"></i>
                <span>{{ station.connectorType }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import L from 'leaflet'
import axios from 'axios'
import { jwtDecode } from "jwt-decode";


import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

// === JWT Decode ===
const token = localStorage.getItem('token')
const user = token ? jwtDecode(token) : null
const isAdmin = user?.role === 'admin'

const API_URL = import.meta.env.VITE_API_URL + '/api/chargers'

const stations = ref([])
const loading = ref(true)
const error = ref(null)
const selectedStation = ref(null)
const searchQuery = ref("")
let map
let markers = {}

const filteredStations = computed(() =>
  stations.value.filter(station =>
    station.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const initMap = () => {
  map = L.map('map').setView([18.5204, 73.8567], 13)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & CartoDB',
  }).addTo(map)
}

const selectStation = (station) => {
  selectedStation.value = station

  requestAnimationFrame(() => {
    if (markers[station.id]) {
      markers[station.id].openPopup()
      map.setView([station.latitude, station.longitude], 15)
      map.invalidateSize()
    }
  })
}

onMounted(async () => {
  initMap()

  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })

    stations.value = res.data

    res.data.forEach(charger => {
      const marker = L.marker([charger.latitude, charger.longitude]).addTo(map)
      markers[charger.id] = marker

      marker.bindPopup(`
        <b>${charger.name}</b><br/>
        Status: ${charger.status}<br/>
        Power: ${charger.powerOutput} kW<br/>
        Connector: ${charger.connectorType}
      `)

      marker.on('click', () => {
        selectedStation.value = charger
      })
    })
  } catch (err) {
    error.value = 'Failed to load charger data for map'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.map-view {
  padding: 1rem;
}

.map-container {
  display: flex;
  gap: 1rem;
  height: 600px;
  flex-direction: row;
}

.side-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.side-panel h3 {
  padding: 1rem;
  margin: 0;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  width: calc(100% - 2rem);
  margin: 0 1rem 1rem;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.station-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.station-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.station-item:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.station-item.active {
  background: #e0f2fe;
  border: 1px solid #0ea5e9;
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.station-header h4 {
  margin: 0;
  font-size: 1rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.station-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.detail-row i {
  width: 16px;
}

#map {
  flex: 1;
  height: 100%;
  min-height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  padding: 1rem;
}

.error {
  color: #dc2626;
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-container {
    flex-direction: column;
    height: auto;
  }

  .side-panel {
    width: 100%;
    max-height: 300px;
  }

  #map {
    height: 400px;
    min-height: 400px;
  }
}
</style>

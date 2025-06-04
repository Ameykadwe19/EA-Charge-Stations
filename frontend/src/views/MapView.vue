<template>
  <div class="map-view">
    <h2>Map View</h2>
    <div class="map-container">
      <!-- Side Details Panel -->
      <div class="side-panel">
        <h3>Charging Stations</h3>
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
            v-for="station in stations" 
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
import { onMounted, ref } from 'vue'
import L from 'leaflet'
import axios from 'axios'

const token = localStorage.getItem('token')
  
const API_URL = import.meta.env.VITE_API_URL + '/api/chargers'

const stations = ref([])
const loading = ref(true)
const error = ref(null)
const selectedStation = ref(null)
let map
let markers = {}

// Initialize map
const initMap = () => {
  map = L.map('map').setView([18.5204, 73.8567], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
}

const selectStation = (station) => {
  selectedStation.value = station
  if (markers[station.id]) {
    markers[station.id].openPopup()
    map.setView([station.latitude, station.longitude], 15)
  }
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
  margin-top: 1rem;
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
</style>

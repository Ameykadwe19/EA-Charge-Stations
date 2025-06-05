<template>
  <div class="view-container">
    <div class="top-bar">
      <div class="view-toggle">
        <button :class="{ active: view === 'list' }" @click="view = 'list'">
          <i class="fas fa-list"></i> List View
        </button>
        <button :class="{ active: view === 'map' }" @click="view = 'map'">
          <i class="fas fa-map"></i> Map View
        </button>
      </div>
      <input type="text" v-model="searchTerm" placeholder="Search stations..." class="search-bar" />
    </div>

    <div v-if="view === 'list'" class="list-view">
      <div v-if="loading" class="info">Loading stations...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div
          v-for="station in filteredStations"
          :key="station.id"
          class="station-card"
        >
          <h3>{{ station.name }}</h3>
          <p>Status: {{ station.status }}</p>
          <p>Power: {{ station.powerOutput }} kW</p>
          <p>Connector: {{ station.connectorType }}</p>
        </div>
      </div>
    </div>

    <div v-else class="map-view">
      <div class="side-panel">
        <h3>Stations</h3>
        <div class="station-list">
          <div
            v-for="station in filteredStations"
            :key="station.id"
            class="station-item"
            :class="{ active: selectedStation?.id === station.id }"
            @click="selectStation(station)"
          >
            <div class="station-header">
              <h4>{{ station.name }}</h4>
              <span class="status" :class="station.status">{{ station.status }}</span>
            </div>
            <div class="station-meta">
              <div><i class="fas fa-bolt"></i> {{ station.powerOutput }} kW</div>
              <div><i class="fas fa-plug"></i> {{ station.connectorType }}</div>
            </div>
          </div>
        </div>
      </div>
      <div id="map" class="map"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import L from 'leaflet'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const token = localStorage.getItem('token')
const API_URL = import.meta.env.VITE_API_URL + '/api/chargers'

const stations = ref([])
const loading = ref(true)
const error = ref(null)
const selectedStation = ref(null)
const searchTerm = ref('')
const view = ref('map') // default view

let map
let markers = {}

const initMap = () => {
  map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([18.5204, 73.8567], 13)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & CartoDB',
  }).addTo(map)
}

const selectStation = (station) => {
  selectedStation.value = station
  if (markers[station.id]) {
    markers[station.id].openPopup()
    map.setView([station.latitude, station.longitude], 15)
    map.invalidateSize()
  }
}

const filteredStations = computed(() => {
  return stations.value.filter(s =>
    s.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

onMounted(async () => {
  initMap()
  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
    stations.value = res.data
    res.data.forEach(station => {
      const marker = L.marker([station.latitude, station.longitude]).addTo(map)
      markers[station.id] = marker

      marker.bindPopup(`
        <b>${station.name}</b><br/>
        Status: ${station.status}<br/>
        Power: ${station.powerOutput} kW<br/>
        Connector: ${station.connectorType}
      `)

      marker.on('click', () => {
        selectedStation.value = station
      })
    })
  } catch (err) {
    error.value = 'Failed to load charger data.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.view-container {
  padding: 1rem;
}

.top-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.view-toggle button {
  background: #f3f4f6;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.3s;
}

.view-toggle .active {
  background: #dbeafe;
  color: #1d4ed8;
}

.search-bar {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 100%;
  max-width: 300px;
}

.map-view {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  height: 600px;
}

.side-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.station-list {
  padding: 1rem;
  max-height: 600px;
  overflow-y: auto;
}

.station-item {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  background: #f9fafb;
  cursor: pointer;
  border: 1px solid transparent;
}

.station-item.active {
  background: #e0f2fe;
  border-color: #38bdf8;
}

.station-header {
  display: flex;
  justify-content: space-between;
}

.status {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e5e7eb;
}

.status.active {
  background: #dcfce7;
  color: #16a34a;
}

.status.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.station-meta {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.map {
  flex: 1;
  border-radius: 8px;
}

.list-view .station-card {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}

.info, .error {
  padding: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.error {
  color: #dc2626;
}

@media (max-width: 768px) {
  .map-view {
    flex-direction: column;
  }

  .side-panel {
    width: 100%;
    max-height: 300px;
  }

  .map {
    height: 300px;
  }
}
</style>

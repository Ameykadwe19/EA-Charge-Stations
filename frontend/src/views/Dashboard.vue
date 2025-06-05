<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    
    <!-- Statistics Cards -->
    <div class="dashboard-grid grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="dashboard-card">
        <div class="dashboard-stat">24</div>
        <div class="dashboard-label">Total Charging Stations</div>
      </div>
      <div class="dashboard-card">
        <div class="dashboard-stat">18</div>
        <div class="dashboard-label">Active Stations</div>
      </div>
      <div class="dashboard-card">
        <div class="dashboard-stat">85%</div>
        <div class="dashboard-label">Average Uptime</div>
      </div>
      <div class="dashboard-card">
        <div class="dashboard-stat">156</div>
        <div class="dashboard-label">Charges Today</div>
      </div>
    </div>

    <!-- Charger Status Section -->
    <h2 class="section-title">Charger Status</h2>
    <div class="charger-grid">
      <div v-for="charger in chargers" :key="charger.id" class="charger-card">
        <div class="charger-status">
          <span 
            class="status-indicator" 
            :class="{
              'status-active': charger.status === 'active',
              'status-inactive': charger.status === 'inactive',
              'status-maintenance': charger.status === 'maintenance'
            }"
          ></span>
          <span>{{ charger.status.charAt(0).toUpperCase() + charger.status.slice(1) }}</span>
        </div>
        <h3>{{ charger.name }}</h3>
        <p>{{ charger.location }}</p>
        <div class="charger-details">
          <span>Power: {{ charger.power }}kW</span>
          <span>Type: {{ charger.type }}</span>
        </div>
      </div>
    </div>

    <!-- Recent Activity Table -->
    <h2 class="section-title">Recent Activity</h2>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Station</th>
            <th>Event</th>
            <th>Duration</th>
            <th>Energy</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in recentActivity" :key="activity.id">
            <td>{{ activity.time }}</td>
            <td>{{ activity.station }}</td>
            <td>{{ activity.event }}</td>
            <td>{{ activity.duration }}</td>
            <td>{{ activity.energy }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Connector Type Selection -->
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const chargers = ref([
  {
    id: 1,
    name: 'Charger Station A1',
    status: 'active',
    location: 'Parking Level 1',
    power: 50,
    type: 'DC Fast Charging'
  },
  {
    id: 2,
    name: 'Charger Station A2',
    status: 'inactive',
    location: 'Parking Level 1',
    power: 50,
    type: 'DC Fast Charging'
  },
  {
    id: 3,
    name: 'Charger Station B1',
    status: 'maintenance',
    location: 'Parking Level 2',
    power: 22,
    type: 'AC Type 2'
  },
  {
    id: 4,
    name: 'Charger Station B2',
    status: 'active',
    location: 'Parking Level 2',
    power: 22,
    type: 'AC Type 2'
  }
])

const recentActivity = ref([
  {
    id: 1,
    time: '10:30 AM',
    station: 'Charger A1',
    event: 'Charging Complete',
    duration: '45 min',
    energy: '35 kWh'
  },
  {
    id: 2,
    time: '09:15 AM',
    station: 'Charger B2',
    event: 'Charging Started',
    duration: '30 min',
    energy: '22 kWh'
  },
  {
    id: 3,
    time: '08:45 AM',
    station: 'Charger A2',
    event: 'Error Detected',
    duration: '-',
    energy: '-'
  }
])
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
}

.section-title {
  margin: 2rem 0 1rem;
  color: var(--gray-900);
  font-size: 1.5rem;
}

.charger-details {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  color: var(--gray-600);
  font-size: 0.875rem;
}
</style>

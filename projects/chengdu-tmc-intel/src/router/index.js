import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import HotelInput from '../views/HotelInput.vue'
import TmcTrend from '../views/TmcTrend.vue'
import CompetitorIntel from '../views/CompetitorIntel.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/input', name: 'HotelInput', component: HotelInput },
  { path: '/tmc-trend', name: 'TmcTrend', component: TmcTrend },
  { path: '/competitor', name: 'CompetitorIntel', component: CompetitorIntel }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

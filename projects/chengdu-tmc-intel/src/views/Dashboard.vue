<template>
  <div class="dashboard">
    <header>
      <h1>🏨 成都商旅情报</h1>
      <p class="subtitle">实时商旅需求趋势 · 酒店决策助手</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>参与酒店</h3>
        <div class="number">{{ store.hotels.length }}</div>
        <span class="trend up">+2 本周新增</span>
      </div>
      <div class="stat-card">
        <h3>本周会场活动</h3>
        <div class="number">{{ totalEvents }}</div>
        <span class="trend up">高新南区集中</span>
      </div>
      <div class="stat-card">
        <h3>团队用房预测</h3>
        <div class="number">{{ totalTeamRooms }}</div>
        <span class="trend">间夜</span>
      </div>
      <div class="stat-card highlight">
        <h3>下周热度指数</h3>
        <div class="number">{{ heatIndex }}</div>
        <span class="trend" :class="heatIndex > 70 ? 'hot' : 'normal'">
          {{ heatIndex > 70 ? '🔥 火爆' : '平稳' }}
        </span>
      </div>
    </div>

    <div class="charts-section">
      <div class="chart-card">
        <h3>各商圈需求热度</h3>
        <div class="chart-wrapper">
          <Bar :data="districtData" :options="chartOptions" />
        </div>
      </div>
      <div class="chart-card">
        <h3>近4周趋势</h3>
        <div class="chart-wrapper">
          <Line :data="trendData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="action-section">
      <router-link to="/input" class="btn-primary">
        + 录入本周数据
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '../stores/data.js'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const store = useDataStore()

const totalEvents = computed(() => 
  store.weeklyData.reduce((sum, d) => sum + d.events, 0)
)

const totalTeamRooms = computed(() =>
  store.weeklyData.reduce((sum, d) => sum + d.teamRooms, 0)
)

const heatIndex = computed(() => {
  if (store.weeklyData.length === 0) return 0
  const avg = store.weeklyData.reduce((sum, d) => sum + d.occupancy, 0) / store.weeklyData.length
  return Math.round(avg * 100)
})

const districtData = {
  labels: ['高新南', '天府新区', '锦江', '武侯', '金牛', '成华'],
  datasets: [{
    label: '需求指数',
    data: [85, 72, 68, 65, 58, 55],
    backgroundColor: 'rgba(56, 189, 248, 0.8)',
    borderRadius: 6
  }]
}

const trendData = {
  labels: ['第1周', '第2周', '第3周', '第4周'],
  datasets: [{
    label: '平均入住率',
    data: [65, 72, 68, 78],
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    fill: true,
    tension: 0.4
  }, {
    label: '团队用房占比',
    data: [25, 30, 28, 35],
    borderColor: '#4ade80',
    backgroundColor: 'transparent',
    tension: 0.4
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#94a3b8',
        font: { size: 12 }
      }
    }
  },
  scales: {
    y: {
      ticks: { color: '#64748b' },
      grid: { color: '#334155' }
    },
    x: {
      ticks: { color: '#64748b' },
      grid: { display: false }
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

header {
  margin-bottom: 1.5rem;
}

header h1 {
  font-size: 1.75rem;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #1e293b;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #334155;
}

.stat-card.highlight {
  border-color: #38bdf8;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.stat-card h3 {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.number {
  font-size: 2rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.25rem;
}

.trend {
  font-size: 0.8rem;
  color: #64748b;
}

.trend.up {
  color: #4ade80;
}

.trend.hot {
  color: #f87171;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: #1e293b;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #334155;
}

.chart-card h3 {
  font-size: 1rem;
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.chart-wrapper {
  height: 250px;
  position: relative;
}

.action-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary {
  background: #38bdf8;
  color: #0f172a;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>

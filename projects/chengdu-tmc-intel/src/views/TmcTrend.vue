<template>
  <div class="tmc-trend">
    <h2>📈 商旅动态监测</h2>
    <p class="desc">输入商旅在住数据，生成需求状态判断</p>

    <div class="input-section">
      <div class="form-group">
        <label>本周商旅在住量（间夜数）</label>
        <input v-model.number="form.volume" type="number" placeholder="例如：15000" />
      </div>

      <div class="form-group">
        <label>环比趋势</label>
        <div class="trend-select">
          <button 
            v-for="opt in trendOptions" 
            :key="opt.value"
            :class="{ active: form.trend === opt.value }"
            @click="form.trend = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Weekly → To Day 变化</label>
        <select v-model="form.wtdChange">
          <option value="accelerating">增速加快</option>
          <option value="stable">保持稳定</option>
          <option value="decelerating">增速放缓</option>
          <option value="reversing">趋势反转</option>
        </select>
      </div>

      <div class="form-group">
        <label>OTA 价格同步情况</label>
        <select v-model="form.otaSync">
          <option value="leading">商旅涨、OTA未动</option>
          <option value="synced">同步上涨</option>
          <option value="lagging">商旅稳、OTA先涨</option>
          <option value="both-down">双双下行</option>
        </select>
      </div>

      <button class="analyze-btn" @click="analyze">生成分析</button>
    </div>

    <div v-if="result" class="result-section">
      <div class="status-card" :class="result.statusClass">
        <h3>商旅需求状态</h3>
        <div class="status">{{ result.status }}</div>
        <div class="signal">{{ result.signal }}</div>
      </div>

      <div class="insight-card">
        <h4>💡 决策建议</h4>
        <p>{{ result.advice }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const trendOptions = [
  { value: 'up', label: '↑ 上升' },
  { value: 'flat', label: '→ 持平' },
  { value: 'down', label: '↓ 下降' }
]

const form = reactive({
  volume: null,
  trend: 'flat',
  wtdChange: 'stable',
  otaSync: 'synced'
})

const result = ref(null)

function analyze() {
  // 判断逻辑
  let status = ''
  let statusClass = ''
  let signal = ''
  let advice = ''

  // 连续趋势判断
  const isRising = form.trend === 'up' && (form.wtdChange === 'accelerating' || form.wtdChange === 'stable')
  const isFalling = form.trend === 'down' && (form.wtdChange === 'decelerating' || form.wtdChange === 'reversing')
  
  // 结构性判断
  const structuralHeat = form.trend === 'up' && form.otaSync === 'leading'
  const priceLagRisk = form.trend === 'down' && (form.otaSync === 'synced' || form.otaSync === 'lagging')

  if (structuralHeat) {
    status = '结构性升温'
    statusClass = 'hot'
    signal = '商旅需求增强，但价格尚未传导'
    advice = '建议酒店提前锁价，未来3-5天存在涨价窗口。关注竞品是否开始跟进。'
  } else if (isRising) {
    status = '需求增强'
    statusClass = 'warm'
    signal = '商旅需求持续上升'
    advice = '市场热度上行，可适当提价。关注涨幅是否过快导致客户流失。'
  } else if (priceLagRisk) {
    status = '价格滞后风险'
    statusClass = 'warning'
    signal = '需求走弱但价格仍高'
    advice = '警惕空房风险，建议主动降价或推出促销套餐，避免后期被动甩房。'
  } else if (isFalling) {
    status = '需求走弱'
    statusClass = 'cool'
    signal = '商旅需求持续下降'
    advice = '进入弱势周期，保守定价策略，优先保证入住率。'
  } else {
    status = '平稳运行'
    statusClass = 'neutral'
    signal = '暂无明确方向'
    advice = '维持现有价格策略，密切观察未来2-3天变化。'
  }

  result.value = { status, statusClass, signal, advice }
}
</script>

<style scoped>
.tmc-trend {
  padding: 1rem;
  max-width: 600px;
}

h2 {
  margin-bottom: 0.5rem;
}

.desc {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.input-section {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 0.95rem;
}

.trend-select {
  display: flex;
  gap: 0.5rem;
}

.trend-select button {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.trend-select button.active {
  background: #0ea5e9;
  border-color: #0ea5e9;
  color: white;
}

.analyze-btn {
  width: 100%;
  padding: 0.75rem;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.analyze-btn:hover {
  background: #0284c7;
}

.result-section {
  display: grid;
  gap: 1rem;
}

.status-card {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.status-card.hot {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
}

.status-card.warm {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
}

.status-card.warning {
  background: linear-gradient(135deg, #ca8a04 0%, #a16207 100%);
}

.status-card.cool {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
}

.status-card.neutral {
  background: #475569;
}

.status-card h3 {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.status {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.signal {
  font-size: 0.9rem;
  opacity: 0.9;
}

.insight-card {
  background: #1e293b;
  padding: 1.25rem;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
}

.insight-card h4 {
  margin-bottom: 0.5rem;
  color: #38bdf8;
}

.insight-card p {
  color: #cbd5e1;
  line-height: 1.6;
}
</style>

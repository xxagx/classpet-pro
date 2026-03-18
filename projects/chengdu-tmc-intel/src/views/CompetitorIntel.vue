<template>
  <div class="comp-intel">
    <h2>🔥 竞品热度预警</h2>
    <p class="desc">监测非样本竞品价格行为，识别市场转折信号</p>

    <div class="input-section">
      <h3>未来14天价格数据录入</h3>
      
      <div class="metrics-grid">
        <div class="metric-box">
          <label>调价频率（次/周）</label>
          <input v-model.number="form.priceChanges" type="number" placeholder="0-10" />
        </div>
        
        <div class="metric-box">
          <label>涨价后回调比例</label>
          <select v-model="form.callbackRate">
            <option value="none">无回调</option>
            <option value="low">少量回调(<30%)</option>
            <option value="high">大量回调(>50%)</option>
          </select>
        </div>
        
        <div class="metric-box">
          <label>D-3 关房情况</label>
          <select v-model="form.closeToArrival">
            <option value="none">无关房</option>
            <option value="partial">部分房型关房</option>
            <option value="full">大面积关房</option>
          </select>
        </div>
        
        <div class="metric-box">
          <label>价格曲线斜率</label>
          <select v-model="form.priceSlope">
            <option value="steep-up">陡峭上升</option>
            <option value="gradual-up">温和上升</option>
            <option value="flat">平稳</option>
            <option value="gradual-down">温和下降</option>
            <option value="steep-down">陡峭下降</option>
          </select>
        </div>
      </div>

      <button class="analyze-btn" @click="analyze">生成预警分析</button>
    </div>

    <div v-if="result" class="result-section">
      <div class="pressure-gauge" :class="result.pressureClass">
        <div class="gauge-label">供需压力等级</div>
        <div class="gauge-value">{{ result.pressure }}</div>
        <div class="gauge-desc">{{ result.pressureDesc }}</div>
      </div>

      <div v-if="result.turningSignal" class="turning-signal" :class="result.signalClass">
        <div class="signal-icon">⚠️</div>
        <div class="signal-content">
          <h4>转折信号 detected</h4>
          <p>{{ result.turningSignal }}</p>
        </div>
      </div>

      <div class="logic-card">
        <h4>📊 判断依据</h4>
        <ul>
          <li v-for="(item, i) in result.logic" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div class="action-card">
        <h4>🎯 建议动作</h4>
        <p>{{ result.action }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  priceChanges: null,
  callbackRate: 'none',
  closeToArrival: 'none',
  priceSlope: 'flat'
})

const result = ref(null)

function analyze() {
  let pressure = ''
  let pressureClass = ''
  let pressureDesc = ''
  let turningSignal = ''
  let signalClass = ''
  let logic = []
  let action = ''

  // 判断逻辑
  const frequentChanges = form.priceChanges >= 5
  const noCallback = form.callbackRate === 'none'
  const highCallback = form.callbackRate === 'high'
  const hasCloseToArrival = form.closeToArrival !== 'none'
  const steepUp = form.priceSlope === 'steep-up'
  const gradualUp = form.priceSlope === 'gradual-up'
  const steepDown = form.priceSlope === 'steep-down'

  // 需求真实增强
  if (frequentChanges && noCallback && (steepUp || gradualUp)) {
    pressure = '紧张'
    pressureClass = 'high'
    pressureDesc = '需求真实增强，竞品信心充足'
    logic.push('频繁调价且无回调 → 需求支撑强劲')
    logic.push('价格曲线上行 → 市场预期乐观')
    action = '跟进提价，但保留部分弹性房型。关注是否有过热风险。'
    
    if (hasCloseToArrival) {
      turningSignal = '高压预警：大面积关房+持续涨价，市场可能进入过热阶段'
      signalClass = 'danger'
    }
  }
  // 试探性涨价
  else if (frequentChanges && highCallback) {
    pressure = '平衡偏紧'
    pressureClass = 'medium'
    pressureDesc = '试探性涨价，需求支撑不稳'
    logic.push('频繁调价但大量回调 → 涨价遇阻')
    logic.push('市场对高价接受度有限')
    action = '谨慎跟涨，优先保证入住率。观察竞品是否会放弃涨价策略。'
  }
  // 弱势阶段
  else if (steepDown || (form.priceSlope === 'gradual-down' && !frequentChanges)) {
    pressure = '宽松'
    pressureClass = 'low'
    pressureDesc = '需求走弱，价格承压'
    logic.push('价格曲线下行 → 市场预期转弱')
    logic.push('调价意愿低 → 缺乏上涨动力')
    action = '主动降价抢客，或推出促销套餐。避免被动跟随降价。'
    
    if (form.priceSlope === 'steep-down') {
      turningSignal = '下行加速：价格快速下探，可能进入价格战'
      signalClass = 'warning'
    }
  }
  // 提前升温信号
  else if (gradualUp && !frequentChanges && form.closeToArrival === 'partial') {
    pressure = '平衡'
    pressureClass = 'medium'
    pressureDesc = '潜在升温，尚未全面传导'
    logic.push('价格温和抬升 → 需求开始积聚')
    logic.push('部分关房 → 局部区域紧张')
    action = '保持观望，准备提价预案。重点关注D-7到D-3的变化。'
    turningSignal = '升温前兆：价格稳定抬升+局部关房，建议提前布局'
    signalClass = 'info'
  }
  // 默认
  else {
    pressure = '平衡'
    pressureClass = 'neutral'
    pressureDesc = '暂无明确方向'
    logic.push('各项指标处于常态区间')
    action = '维持现有策略，密切监控未来3天变化。'
  }

  result.value = {
    pressure,
    pressureClass,
    pressureDesc,
    turningSignal,
    signalClass,
    logic,
    action
  }
}
</script>

<style scoped>
.comp-intel {
  padding: 1rem;
  max-width: 700px;
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

.input-section h3 {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #38bdf8;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-box label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

.metric-box input,
.metric-box select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
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

.result-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pressure-gauge {
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.pressure-gauge.high {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
}

.pressure-gauge.medium {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
}

.pressure-gauge.low {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
}

.pressure-gauge.neutral {
  background: #475569;
}

.gauge-label {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.gauge-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.gauge-desc {
  font-size: 0.9rem;
  opacity: 0.9;
}

.turning-signal {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
}

.turning-signal.danger {
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.4);
}

.turning-signal.warning {
  background: rgba(202, 138, 4, 0.2);
  border: 1px solid rgba(202, 138, 4, 0.4);
}

.turning-signal.info {
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid rgba(14, 165, 233, 0.4);
}

.signal-icon {
  font-size: 1.5rem;
}

.signal-content h4 {
  margin-bottom: 0.25rem;
  color: #e2e8f0;
}

.signal-content p {
  font-size: 0.9rem;
  color: #94a3b8;
}

.logic-card,
.action-card {
  background: #1e293b;
  padding: 1.25rem;
  border-radius: 8px;
}

.logic-card h4,
.action-card h4 {
  margin-bottom: 0.75rem;
  color: #38bdf8;
}

.logic-card ul {
  list-style: none;
  padding: 0;
}

.logic-card li {
  padding: 0.4rem 0;
  padding-left: 1.2rem;
  position: relative;
  color: #cbd5e1;
}

.logic-card li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #0ea5e9;
}

.action-card p {
  color: #cbd5e1;
  line-height: 1.6;
}
</style>

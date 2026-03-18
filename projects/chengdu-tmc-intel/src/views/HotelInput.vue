<template>
  <div class="hotel-input">
    <h2>🏨 酒店数据录入</h2>
    
    <div class="section">
      <h3>基础信息</h3>
      <div class="form-row">
        <label>酒店名称</label>
        <input v-model="form.name" placeholder="如：成都太古里希尔顿" />
      </div>
      <div class="form-row">
        <label>商圈</label>
        <select v-model="form.district">
          <option value="">请选择</option>
          <option value="春熙路/太古里">春熙路/太古里</option>
          <option value="高新南区">高新南区</option>
          <option value="天府新区">天府新区</option>
          <option value="火车南站">火车南站</option>
          <option value="双流机场">双流机场</option>
          <option value="世纪城会展">世纪城会展</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div class="form-row">
        <label>星级</label>
        <select v-model="form.star">
          <option value="">请选择</option>
          <option value="5">五星级</option>
          <option value="4">四星级</option>
          <option value="3">三星级</option>
          <option value="精品">精品/设计酒店</option>
        </select>
      </div>
      <div class="form-row">
        <label>客房总数</label>
        <input v-model.number="form.totalRooms" type="number" placeholder="200" />
      </div>
    </div>

    <div class="section">
      <h3>本周经营数据（{{ currentWeek }}）</h3>
      <div class="form-row">
        <label>本周平均入住率 (%)</label>
        <input v-model.number="form.occupancyRate" type="number" min="0" max="100" placeholder="75" />
      </div>
      <div class="form-row">
        <label>平均房价 (ADR)</label>
        <input v-model.number="form.adr" type="number" placeholder="580" />
      </div>
    </div>

    <div class="section">
      <h3>会场与团队（关键数据）</h3>
      <div class="form-row">
        <label>本周会场使用场次</label>
        <input v-model.number="form.meetingRoomsUsed" type="number" placeholder="5" />
      </div>
      <div class="form-row">
        <label>团队用房间夜数</label>
        <input v-model.number="form.groupRoomNights" type="number" placeholder="120" />
      </div>
      <div class="form-row">
        <label>下周已知预订趋势</label>
        <select v-model="form.nextWeekTrend">
          <option value="">请选择</option>
          <option value="up">明显上涨 📈</option>
          <option value="stable">基本持平 ➡️</option>
          <option value="down">明显下降 📉</option>
        </select>
      </div>
    </div>

    <div class="section">
      <h3>市场观察（选填）</h3>
      <div class="form-row">
        <label>本周主要客源类型</label>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="form.sourceTypes" value="商务散客" /> 商务散客</label>
          <label><input type="checkbox" v-model="form.sourceTypes" value="会议团队" /> 会议团队</label>
          <label><input type="checkbox" v-model="form.sourceTypes" value="旅游团" /> 旅游团</label>
          <label><input type="checkbox" v-model="form.sourceTypes" value="长住客" /> 长住客</label>
        </div>
      </div>
      <div class="form-row">
        <label>特殊事件备注</label>
        <textarea v-model="form.notes" rows="3" placeholder="如：附近展会、大型会议、突发情况等"></textarea>
      </div>
    </div>

    <button class="submit-btn" @click="submit" :disabled="!isValid">
      {{ isEdit ? '更新数据' : '提交数据' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '../stores/data.js'

const store = useDataStore()

const currentWeek = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const week = Math.ceil((now - new Date(year, 0, 1)) / 604800000)
  return `${year}年第${week}周`
})

const form = ref({
  name: '',
  district: '',
  star: '',
  totalRooms: null,
  occupancyRate: null,
  adr: null,
  meetingRoomsUsed: null,
  groupRoomNights: null,
  nextWeekTrend: '',
  sourceTypes: [],
  notes: ''
})

const isEdit = computed(() => {
  return store.hotels.some(h => h.name === form.value.name)
})

const isValid = computed(() => {
  return form.value.name && form.value.district && form.value.occupancyRate !== null
})

function submit() {
  store.addHotelReport({
    ...form.value,
    week: currentWeek.value,
    submittedAt: new Date().toISOString()
  })
  alert('数据已提交！')
  // 重置表单
  form.value = {
    name: '', district: '', star: '', totalRooms: null,
    occupancyRate: null, adr: null, meetingRoomsUsed: null,
    groupRoomNights: null, nextWeekTrend: '', sourceTypes: [], notes: ''
  }
}
</script>

<style scoped>
.hotel-input {
  max-width: 600px;
  margin: 0 auto;
}

.section {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section h3 {
  margin-top: 0;
  color: #2563eb;
  font-size: 16px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.form-row {
  margin-bottom: 15px;
}

.form-row label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
}

.form-row input,
.form-row select,
.form-row textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>

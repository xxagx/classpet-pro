import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDataStore = defineStore('data', () => {
  // 酒店列表
  const hotels = ref([
    { id: 1, name: '示例酒店-高新区', district: '高新南区', tier: '商务四星', rooms: 200 },
  ])

  // 周数据填报
  const weeklyData = ref([
    {
      hotelId: 1,
      week: '2026-W09',
      meetingRoomsUsed: 15,      // 会场使用场次
      groupRooms: 80,            // 团队用房数
      occupancyRate: 75,         // 整体入住率
      businessTravelers: 60,     // 商旅客人占比估计
      avgRate: 450,              // 平均房价
      notes: '糖酒会预热期'
    }
  ])

  // 添加酒店
  const addHotel = (hotel) => {
    hotels.value.push({
      id: Date.now(),
      ...hotel
    })
  }

  // 添加周报
  const addWeeklyReport = (report) => {
    weeklyData.value.push({
      ...report,
      submittedAt: new Date().toISOString()
    })
  }

  // 按区域聚合的趋势数据
  const districtTrends = computed(() => {
    const districts = {}
    weeklyData.value.forEach(d => {
      const hotel = hotels.value.find(h => h.id === d.hotelId)
      if (!hotel) return
      
      if (!districts[hotel.district]) {
        districts[hotel.district] = []
      }
      districts[hotel.district].push({
        week: d.week,
        occupancyRate: d.occupancyRate,
        businessTravelRatio: d.businessTravelers,
        avgRate: d.avgRate
      })
    })
    return districts
  })

  // 商旅热度指数（简单算法）
  const heatIndex = computed(() => {
    return weeklyData.value.map(d => {
      const hotel = hotels.value.find(h => h.id === d.hotelId)
      return {
        hotelName: hotel?.name || '未知',
        district: hotel?.district || '未知',
        week: d.week,
        score: Math.round((d.occupancyRate * 0.4 + d.businessTravelers * 0.4 + (d.avgRate / 10) * 0.2)),
        trend: d.notes
      }
    }).sort((a, b) => b.score - a.score)
  })

  return {
    hotels,
    weeklyData,
    districtTrends,
    heatIndex,
    addHotel,
    addWeeklyReport
  }
})

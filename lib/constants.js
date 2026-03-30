export const TIME_SLOTS = ['10:00', '12:00', '14:00', '16:00', '18:00']
export const MAX_BOOKINGS_PER_DAY = 5

export const servicePriceMap = {
  basic: 35000,
  standard: 70000,
  deep: 120000
}

export const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'done', label: 'Done' }
]

export const services = [
  {
    id: 'basic',
    name: 'BASIC CLEAN',
    priceLabel: '35,000₮',
    duration: '⏱ Хугацаа: 20–30 мин',
    audience: '👤 Тохиромжтой: Оффис / энгийн хэрэглэгч',
    features: [
      'Тоос үлээлгэх (CPU, GPU, PSU, case)',
      'Case гадаргуу, шил цэвэрлэх',
      'Портууд цэвэрлэх',
      'PC угсарч тест хийх'
    ]
  },
  {
    id: 'standard',
    name: 'STANDARD CLEAN',
    priceLabel: '70,000₮',
    duration: '⏱ Хугацаа: 45–60 мин',
    audience: '👤 Тохиромжтой: Gaming PC',
    badge: '🔥 Most Popular',
    popular: true,
    features: [
      'Basic бүгд',
      'CPU cooler салгаж цэвэрлэх',
      'Thermal paste солих (MX-4 / MX-6)',
      'Cable management',
      'Агаарын урсгал сайжруулах'
    ]
  },
  {
    id: 'deep',
    name: 'DEEP CLEAN',
    priceLabel: '120,000₮',
    duration: '⏱ Хугацаа: 1.5–2 цаг',
    audience: '👤 Тохиромжтой: High-end / халдаг PC',
    badge: '💎 Pro',
    features: [
      'Standard бүгд',
      'GPU задлаж цэвэрлэх',
      'GPU thermal paste & pad солих',
      'PSU дотор цэвэрлэх',
      'Бүх fan, cooler нарийн цэвэрлэх',
      'CPU/GPU температурын тайлан'
    ]
  }
]

<template>
  <span :class="['animated-number', { 'popping': isPopping }]">{{ displayValue }}</span>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  value: {
    type: [String, Number],
    required: true
  },
  minInterval: {
    type: Number,
    default: 2000
  },
  maxInterval: {
    type: Number,
    default: 5000
  },
  maxIncrement: {
    type: Number,
    default: 3
  }
})

const displayValue = ref(props.value)
const currentValue = ref(typeof props.value === 'number' ? props.value : parseInt(props.value.toString().replace(/,/g, '')))
const isPopping = ref(false)

const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const updateDisplay = () => {
  displayValue.value = formatNumber(currentValue.value)
}

const pop = () => {
  isPopping.value = true
  setTimeout(() => {
    isPopping.value = false
  }, 200)
}

const increment = () => {
  const amount = Math.floor(Math.random() * props.maxIncrement) + 1
  currentValue.value += amount
  updateDisplay()
  pop()
  
  const nextInterval = Math.floor(Math.random() * (props.maxInterval - props.minInterval)) + props.minInterval
  setTimeout(increment, nextInterval)
}

onMounted(() => {
  updateDisplay()
  setTimeout(increment, Math.random() * 2000 + 1000)
})
</script>

<style scoped>
.animated-number {
  display: inline-block;
  transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animated-number.popping {
  transform: scale(1.15);
  color: #C8AA6E;
  font-weight: bold;
}
</style>

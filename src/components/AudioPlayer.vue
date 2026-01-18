<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { storeToRefs } from 'pinia'
import { useAudioPreview } from '@/composables/useAudioPreview'
import { useAudioFile } from '@/composables/useAudioFile'

const store = useAudioStore()
const { isPlaying, currentTime, duration, audioBuffer, params } = storeToRefs(store)
const { togglePlay, seek } = useAudioPreview()
const { formatDuration } = useAudioFile()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const progressRef = ref<HTMLDivElement | null>(null)
let animationId: number | null = null
let canvasWidth = 0
let canvasHeight = 0

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function handleProgressClick(e: MouseEvent) {
  if (!progressRef.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const newTime = percent * duration.value
  seek(Math.max(0, Math.min(newTime, duration.value)))
}

function drawWaveform() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvasWidth
  const height = canvasHeight

  // Light background
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, width, height)

  // Always draw static waveform as base
  drawStaticWaveform(ctx, width, height)

  // If playing, schedule next frame
  if (isPlaying.value) {
    animationId = requestAnimationFrame(drawWaveform)
  }
}

function drawStaticWaveform(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const buffer = audioBuffer.value
  if (!buffer) return

  const data = buffer.getChannelData(0)
  const step = Math.ceil(data.length / width)
  const padding = height * 0.05

  // Draw waveform centered
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
  gradient.addColorStop(0, '#a0e7ff')
  gradient.addColorStop(1, '#ff85a1')
  ctx.strokeStyle = gradient
  ctx.lineWidth = 2

  ctx.beginPath()

  for (let i = 0; i < width; i++) {
    let min = 1.0
    let max = -1.0
    for (let j = 0; j < step; j++) {
      const datum = data[i * step + j]
      if (datum !== undefined) {
        min = Math.min(min, datum)
        max = Math.max(max, datum)
      }
    }
    const yMin = padding + (1 - max) * (height - padding * 2) / 2
    const yMax = padding + (1 - min) * (height - padding * 2) / 2

    ctx.moveTo(i, yMin)
    ctx.lineTo(i, yMax)
  }

  ctx.stroke()

  // Progress overlay
  if (progress.value > 0) {
    const progressWidth = (progress.value / 100) * width
    const overlayGradient = ctx.createLinearGradient(0, 0, progressWidth, 0)
    overlayGradient.addColorStop(0, 'rgba(255, 133, 161, 0.3)')
    overlayGradient.addColorStop(1, 'rgba(160, 231, 255, 0.3)')
    ctx.fillStyle = overlayGradient
    ctx.fillRect(0, 0, progressWidth, height)
  }
}

function setupCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvasWidth = rect.width
  canvasHeight = rect.height

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }

  drawWaveform()
}

onMounted(() => {
  setupCanvas()
  window.addEventListener('resize', setupCanvas)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', setupCanvas)
})

watch([isPlaying, audioBuffer], () => {
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null
  drawWaveform()
})

watch(currentTime, () => {
  if (!isPlaying.value) drawWaveform()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Waveform -->
    <div class="waveform h-20">
      <canvas ref="canvasRef" class="w-full h-full" />
    </div>

    <!-- Progress -->
    <div
      ref="progressRef"
      class="progress-bar cursor-pointer"
      @click="handleProgressClick"
    >
      <div class="progress-fill" :style="{ width: `${progress}%` }" />
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="play-btn"
          :disabled="!audioBuffer"
          @click="togglePlay"
        >
          <span v-if="!isPlaying">▶</span>
          <span v-else>⏸</span>
        </button>

        <span class="text-text-muted text-sm">
          {{ formatDuration(currentTime) }} / {{ formatDuration(duration) }}
        </span>
      </div>

      <span class="value-badge">{{ params.speed.toFixed(2) }}x</span>
    </div>
  </div>
</template>

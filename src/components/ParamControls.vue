<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { storeToRefs } from 'pinia'

const store = useAudioStore()
const { params } = storeToRefs(store)

const showAdvanced = ref(false)

const speed = computed({
  get: () => params.value.speed,
  set: (value: number) => store.setParams({ speed: value }),
})

const pitch = computed({
  get: () => params.value.pitch,
  set: (value: number) => store.setParams({ pitch: value }),
})

const bass = computed({
  get: () => params.value.bass,
  set: (value: number) => store.setParams({ bass: value }),
})

const bassEnabled = computed({
  get: () => params.value.bass !== 0,
  set: (enabled: boolean) => store.setParams({ bass: enabled ? 3 : 0 }),
})
</script>

<template>
  <div class="space-y-5">
    <!-- Speed -->
    <div>
      <label class="flex items-center justify-between mb-3 font-semibold text-text">
        <span>⚡ Speed</span>
        <span class="value-badge">{{ speed.toFixed(2) }}x</span>
      </label>
      <input v-model.number="speed" type="range" min="0.5" max="2.0" step="0.05" />
    </div>

    <!-- Bass toggle -->
    <div class="toggle-container">
      <span class="font-semibold text-text">🔥 Bass Boost</span>
      <label class="switch">
        <input v-model="bassEnabled" type="checkbox" />
        <span class="switch-slider" />
      </label>
    </div>

    <!-- Advanced toggle -->
    <button
      class="btn-ghost text-sm w-full text-center"
      @click="showAdvanced = !showAdvanced"
    >
      {{ showAdvanced ? '▲ Hide options' : '▼ More options' }}
    </button>

    <!-- Advanced -->
    <div v-if="showAdvanced" class="space-y-5 pt-2">
      <!-- Pitch -->
      <div>
        <label class="flex items-center justify-between mb-3 font-semibold text-text">
          <span>🎵 Pitch</span>
          <span class="value-badge">{{ pitch > 0 ? '+' : '' }}{{ pitch }} st</span>
        </label>
        <input v-model.number="pitch" type="range" min="-12" max="12" step="1" />
        <p class="text-text-light text-xs mt-2">Applied to export only</p>
      </div>

      <!-- Bass level (if enabled) -->
      <div v-if="bassEnabled">
        <label class="flex items-center justify-between mb-3 font-semibold text-text">
          <span>🔊 Bass Level</span>
          <span class="value-badge">{{ bass > 0 ? '+' : '' }}{{ bass }} dB</span>
        </label>
        <input v-model.number="bass" type="range" min="1" max="12" step="1" />
      </div>
    </div>
  </div>
</template>

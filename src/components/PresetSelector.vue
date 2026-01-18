<script setup lang="ts">
import { useAudioStore } from '@/stores/audio'
import { storeToRefs } from 'pinia'
import { PRESETS, type PresetId } from '@/types/presets'

const store = useAudioStore()
const { activePresetId, isCustomPreset } = storeToRefs(store)

function selectPreset(id: PresetId) {
  store.setPreset(id)
}

function isActive(id: string) {
  if (id === 'custom') return isCustomPreset.value
  return activePresetId.value === id && !isCustomPreset.value
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="preset in PRESETS"
      :key="preset.id"
      class="preset-btn"
      :class="{ active: isActive(preset.id) }"
      @click="selectPreset(preset.id as PresetId)"
    >
      {{ preset.name }}
    </button>
  </div>
</template>

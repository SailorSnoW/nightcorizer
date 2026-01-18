<script setup lang="ts">
import { ref } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { storeToRefs } from 'pinia'
import { useAudioExport } from '@/composables/useAudioExport'
import type { ExportFormat } from '@/types/audio'

const store = useAudioStore()
const { exportFormat, exportProgress, isExporting } = storeToRefs(store)
const { exportAudio } = useAudioExport()

const formats: { id: ExportFormat; label: string; desc: string }[] = [
  { id: 'mp3', label: 'MP3', desc: 'Smaller file size' },
  { id: 'flac', label: 'FLAC', desc: 'Lossless quality' },
]

const exportError = ref<string | null>(null)

function selectFormat(format: ExportFormat) {
  store.setExportFormat(format)
}

async function handleExport() {
  exportError.value = null
  try {
    await exportAudio(exportFormat.value)
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : 'Export error'
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Format -->
    <div class="flex gap-3">
      <button
        v-for="format in formats"
        :key="format.id"
        class="format-btn flex-1"
        :class="{ active: exportFormat === format.id }"
        :disabled="isExporting"
        @click="selectFormat(format.id)"
      >
        <p class="font-semibold text-text">{{ format.label }}</p>
        <p class="text-text-light text-xs mt-1">{{ format.desc }}</p>
      </button>
    </div>

    <!-- Progress -->
    <div v-if="exportProgress" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-text-muted">{{ exportProgress.message }}</span>
        <span v-if="exportProgress.stage !== 'error'" class="font-semibold text-primary">
          {{ exportProgress.progress }}%
        </span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :class="{
            '!bg-red-400': exportProgress.stage === 'error',
            '!bg-green-400': exportProgress.stage === 'complete'
          }"
          :style="{ width: `${exportProgress.progress}%` }"
        />
      </div>
    </div>

    <!-- Error -->
    <p v-if="exportError" class="text-primary text-sm text-center">{{ exportError }}</p>

    <!-- Export button -->
    <button
      class="btn-primary w-full"
      :disabled="isExporting"
      @click="handleExport"
    >
      <span v-if="isExporting">⏳ Exporting...</span>
      <span v-else>✨ GENERATE MIX!</span>
    </button>
  </div>
</template>

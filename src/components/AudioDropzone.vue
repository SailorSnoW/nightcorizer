<script setup lang="ts">
import { ref } from 'vue'
import { useAudioFile } from '@/composables/useAudioFile'
import { useAudioStore } from '@/stores/audio'

const store = useAudioStore()
const { loadFile, supportedExtensions, formatFileSize, formatDuration } = useAudioFile()

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

async function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.[0]) await loadFile(files[0])
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) await loadFile(input.files[0])
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function clearFile() {
  store.reset()
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <div>
    <input
      ref="fileInputRef"
      type="file"
      :accept="supportedExtensions.join(',')"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Loading -->
    <div v-if="store.isLoading" class="py-8 text-center text-text-muted">
      <div class="inline-block animate-spin text-2xl mb-2">🎵</div>
      <p>Loading...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="py-6 text-center">
      <p class="text-primary mb-3">{{ store.error }}</p>
      <button class="btn-ghost text-sm" @click="store.setError(null)">try again</button>
    </div>

    <!-- File loaded -->
    <div v-else-if="store.hasFile && store.fileInfo" class="flex items-center gap-3">
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-text truncate">{{ store.fileName }}</p>
        <div class="flex flex-wrap gap-2 mt-2">
          <span class="file-badge">🎵 {{ formatDuration(store.fileInfo.duration) }}</span>
          <span class="file-badge">📁 {{ formatFileSize(store.fileInfo.size) }}</span>
        </div>
      </div>
      <button
        class="p-2 text-text-muted hover:text-primary transition-colors"
        @click="clearFile"
      >
        ✕
      </button>
    </div>

    <!-- Dropzone -->
    <div
      v-else
      class="dropzone py-10 text-center cursor-pointer"
      :class="{ 'drag-over': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop="handleDrop"
      @click="openFilePicker"
    >
      <p class="text-primary font-semibold">
        📁 Choose a file (MP3, FLAC...)
      </p>
      <p class="text-text-light text-sm mt-1">or drag and drop here</p>
    </div>
  </div>
</template>

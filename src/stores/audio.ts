import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NightcoreParams, ExportFormat, ExportProgress, AudioFileInfo } from '@/types/audio'
import { PRESETS, type PresetId } from '@/types/presets'

export const useAudioStore = defineStore('audio', () => {
  // File state
  const file = ref<File | null>(null)
  const fileInfo = ref<AudioFileInfo | null>(null)
  const audioBuffer = ref<AudioBuffer | null>(null)

  // Playback state
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const analyserData = ref<Uint8Array>(new Uint8Array(0))

  // Loading & errors
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Nightcore parameters
  const params = ref<NightcoreParams>({
    speed: 1.25,
    pitch: 4,
    bass: 3,
  })
  const activePresetId = ref<PresetId>('classic')

  // Export state
  const exportFormat = ref<ExportFormat>('mp3')
  const exportProgress = ref<ExportProgress | null>(null)
  const isExporting = ref(false)

  // Getters
  const hasFile = computed(() => file.value !== null)
  const fileName = computed(() => file.value?.name ?? '')
  const duration = computed(() => audioBuffer.value?.duration ?? 0)

  const isCustomPreset = computed(() => {
    if (activePresetId.value === 'custom') return true

    const preset = PRESETS.find((p) => p.id === activePresetId.value)
    if (!preset) return true

    return (
      params.value.speed !== preset.params.speed ||
      params.value.pitch !== preset.params.pitch ||
      params.value.bass !== preset.params.bass
    )
  })

  // Actions
  function setFile(newFile: File) {
    file.value = newFile
    error.value = null
  }

  function setFileInfo(info: AudioFileInfo) {
    fileInfo.value = info
  }

  function setAudioBuffer(buffer: AudioBuffer) {
    audioBuffer.value = buffer
  }

  function setPlaying(playing: boolean) {
    isPlaying.value = playing
  }

  function setCurrentTime(time: number) {
    currentTime.value = time
  }

  function setAnalyserData(data: Uint8Array) {
    analyserData.value = data
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(err: string | null) {
    error.value = err
  }

  function setParams(newParams: Partial<NightcoreParams>) {
    params.value = { ...params.value, ...newParams }
    // Mark as custom if params don't match active preset
    if (isCustomPreset.value && activePresetId.value !== 'custom') {
      activePresetId.value = 'custom'
    }
  }

  function setPreset(presetId: PresetId) {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (preset) {
      activePresetId.value = presetId
      if (presetId !== 'custom') {
        params.value = { ...preset.params }
      }
    }
  }

  function setExportFormat(format: ExportFormat) {
    exportFormat.value = format
  }

  function setExportProgress(progress: ExportProgress | null) {
    exportProgress.value = progress
  }

  function setExporting(exporting: boolean) {
    isExporting.value = exporting
  }

  function reset() {
    file.value = null
    fileInfo.value = null
    audioBuffer.value = null
    isPlaying.value = false
    currentTime.value = 0
    isLoading.value = false
    error.value = null
    exportProgress.value = null
    isExporting.value = false
  }

  return {
    // File state
    file,
    fileInfo,
    audioBuffer,
    // Playback state
    isPlaying,
    currentTime,
    analyserData,
    // Loading & errors
    isLoading,
    error,
    // Params
    params,
    activePresetId,
    // Export
    exportFormat,
    exportProgress,
    isExporting,
    // Getters
    hasFile,
    fileName,
    duration,
    isCustomPreset,
    // Actions
    setFile,
    setFileInfo,
    setAudioBuffer,
    setPlaying,
    setCurrentTime,
    setAnalyserData,
    setLoading,
    setError,
    setParams,
    setPreset,
    setExportFormat,
    setExportProgress,
    setExporting,
    reset,
  }
})

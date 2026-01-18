import { useAudioStore } from '@/stores/audio'
import type { AudioFileInfo } from '@/types/audio'

const SUPPORTED_FORMATS = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/mp4',
  'audio/webm',
]

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.webm']

export function useAudioFile() {
  const store = useAudioStore()
  let audioContext: AudioContext | null = null

  function isSupported(file: File): boolean {
    if (SUPPORTED_FORMATS.includes(file.type)) {
      return true
    }
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    return SUPPORTED_EXTENSIONS.includes(ext)
  }

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    return audioContext
  }

  async function loadFile(file: File): Promise<void> {
    if (!isSupported(file)) {
      store.setError(`Unsupported file format. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`)
      return
    }

    store.setLoading(true)
    store.setError(null)

    try {
      store.setFile(file)

      const arrayBuffer = await file.arrayBuffer()
      const ctx = getAudioContext()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      store.setAudioBuffer(audioBuffer)

      const info: AudioFileInfo = {
        name: file.name,
        size: file.size,
        type: file.type || 'audio/unknown',
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
      }
      store.setFileInfo(info)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decode audio file'
      store.setError(message)
      store.reset()
    } finally {
      store.setLoading(false)
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return {
    loadFile,
    isSupported,
    formatDuration,
    formatFileSize,
    supportedExtensions: SUPPORTED_EXTENSIONS,
  }
}

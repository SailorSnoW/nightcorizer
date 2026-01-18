export interface AudioFileInfo {
  name: string
  size: number
  type: string
  duration: number
  sampleRate: number
  numberOfChannels: number
}

export interface NightcoreParams {
  speed: number // 0.5 - 2.0, default 1.25
  pitch: number // -12 to +12 semitones, default +4
  bass: number // -12 to +12 dB, default +3
}

export type ExportFormat = 'mp3' | 'flac'

export interface ExportOptions {
  format: ExportFormat
  quality: number // 0-10 for MP3 (VBR), compression level for FLAC
}

export interface ExportProgress {
  stage: 'initializing' | 'processing' | 'encoding' | 'complete' | 'error'
  progress: number // 0-100
  message: string
}

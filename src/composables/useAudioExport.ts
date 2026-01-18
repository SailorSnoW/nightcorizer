import { useAudioStore } from '@/stores/audio'
import { storeToRefs } from 'pinia'
import { getFFmpeg } from '@/utils/ffmpeg'
import type { ExportFormat } from '@/types/audio'
import { fetchFile } from '@ffmpeg/util'

export function useAudioExport() {
  const store = useAudioStore()
  const { file, params } = storeToRefs(store)

  function buildFilterChain(): string {
    const filters: string[] = []
    const { speed, pitch, bass } = params.value

    // Pitch shift using asetrate + atempo to maintain duration
    // asetrate changes sample rate (affects pitch), atempo compensates speed
    if (pitch !== 0) {
      // Convert semitones to frequency ratio
      const pitchRatio = Math.pow(2, pitch / 12)
      // We need to adjust the sample rate to change pitch
      // Then use atempo to compensate for the speed change
      filters.push(`asetrate=44100*${pitchRatio.toFixed(6)}`)
      filters.push(`aresample=44100`)
      // Compensate for pitch-induced speed change
      filters.push(`atempo=${(1 / pitchRatio).toFixed(6)}`)
    }

    // Speed change
    if (speed !== 1.0) {
      // atempo only supports 0.5-2.0, chain multiple if needed
      let remainingSpeed = speed
      while (remainingSpeed > 2.0) {
        filters.push('atempo=2.0')
        remainingSpeed /= 2.0
      }
      while (remainingSpeed < 0.5) {
        filters.push('atempo=0.5')
        remainingSpeed /= 0.5
      }
      if (remainingSpeed !== 1.0) {
        filters.push(`atempo=${remainingSpeed.toFixed(6)}`)
      }
    }

    // Bass boost using lowshelf filter
    if (bass !== 0) {
      filters.push(`bass=g=${bass}:f=200`)
    }

    return filters.length > 0 ? filters.join(',') : 'anull'
  }

  function getOutputFilename(format: ExportFormat): string {
    const baseName = file.value?.name.replace(/\.[^.]+$/, '') ?? 'nightcore'
    return `${baseName}_nightcore.${format}`
  }

  async function exportAudio(format: ExportFormat): Promise<void> {
    if (!file.value) {
      throw new Error('No file loaded')
    }

    store.setExporting(true)
    store.setExportProgress({
      stage: 'initializing',
      progress: 0,
      message: 'Loading FFmpeg...',
    })

    try {
      const ffmpeg = await getFFmpeg()

      // Set up progress handler
      ffmpeg.on('progress', ({ progress }) => {
        store.setExportProgress({
          stage: 'processing',
          progress: Math.round(progress * 100),
          message: `Processing: ${Math.round(progress * 100)}%`,
        })
      })

      store.setExportProgress({
        stage: 'processing',
        progress: 0,
        message: 'Reading input file...',
      })

      // Write input file to FFmpeg virtual filesystem
      const inputFileName = 'input' + getFileExtension(file.value.name)
      await ffmpeg.writeFile(inputFileName, await fetchFile(file.value))

      const outputFileName = getOutputFilename(format)
      const filterChain = buildFilterChain()

      store.setExportProgress({
        stage: 'processing',
        progress: 10,
        message: 'Applying nightcore effects...',
      })

      // Build FFmpeg command
      const args = ['-i', inputFileName, '-af', filterChain]

      if (format === 'mp3') {
        args.push('-c:a', 'libmp3lame', '-q:a', '2') // VBR quality 2 (~190kbps)
      } else {
        // FLAC
        args.push('-c:a', 'flac', '-compression_level', '8')
      }

      args.push('-y', outputFileName)

      await ffmpeg.exec(args)

      store.setExportProgress({
        stage: 'encoding',
        progress: 90,
        message: 'Preparing download...',
      })

      // Read output file
      const data = await ffmpeg.readFile(outputFileName)
      const blobData = data instanceof Uint8Array ? data : new TextEncoder().encode(data)
      // Create a new Uint8Array with a standard ArrayBuffer to avoid SharedArrayBuffer issues
      const safeData = new Uint8Array(blobData)
      const blob = new Blob([safeData], {
        type: format === 'mp3' ? 'audio/mpeg' : 'audio/flac',
      })

      // Trigger download
      downloadBlob(blob, outputFileName)

      // Cleanup
      await ffmpeg.deleteFile(inputFileName)
      await ffmpeg.deleteFile(outputFileName)

      store.setExportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Export complete!',
      })

      // Clear progress after a delay
      setTimeout(() => {
        store.setExportProgress(null)
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed'
      store.setExportProgress({
        stage: 'error',
        progress: 0,
        message,
      })
      throw error
    } finally {
      store.setExporting(false)
    }
  }

  return {
    exportAudio,
    buildFilterChain,
  }
}

function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/)
  return match?.[0] ?? '.mp3'
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

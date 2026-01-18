import { watch, onUnmounted } from 'vue'
import { useAudioStore } from '@/stores/audio'
import { storeToRefs } from 'pinia'

interface AudioNodes {
  source: AudioBufferSourceNode | null
  gain: GainNode
  bassFilter: BiquadFilterNode
  analyser: AnalyserNode
}

export function useAudioPreview() {
  const store = useAudioStore()
  const { audioBuffer, params, isPlaying } = storeToRefs(store)

  let audioContext: AudioContext | null = null
  let nodes: AudioNodes | null = null
  let startTime = 0
  let pausedAt = 0
  let animationFrameId: number | null = null

  function getAudioContext(): AudioContext {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    return audioContext
  }

  function createNodes(): AudioNodes {
    const ctx = getAudioContext()

    const gain = ctx.createGain()
    gain.gain.value = 1.0

    const bassFilter = ctx.createBiquadFilter()
    bassFilter.type = 'lowshelf'
    bassFilter.frequency.value = 200
    bassFilter.gain.value = params.value.bass

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.8

    // Connect: source → gain → bassFilter → analyser → destination
    gain.connect(bassFilter)
    bassFilter.connect(analyser)
    analyser.connect(ctx.destination)

    return { source: null, gain, bassFilter, analyser }
  }

  function createSource(): AudioBufferSourceNode | null {
    if (!audioBuffer.value || !nodes) return null

    const ctx = getAudioContext()
    const source = ctx.createBufferSource()
    source.buffer = audioBuffer.value
    source.playbackRate.value = params.value.speed
    source.connect(nodes.gain)

    source.onended = () => {
      if (isPlaying.value) {
        // Track ended naturally
        store.setPlaying(false)
        store.setCurrentTime(0)
        pausedAt = 0
      }
    }

    return source
  }

  function updateAnalyser() {
    if (!nodes || !isPlaying.value) {
      animationFrameId = null
      return
    }

    const dataArray = new Uint8Array(nodes.analyser.frequencyBinCount)
    nodes.analyser.getByteFrequencyData(dataArray)
    store.setAnalyserData(dataArray)

    // Update current time
    if (audioContext && nodes.source) {
      const elapsed = (audioContext.currentTime - startTime) * params.value.speed
      const currentPos = pausedAt + elapsed
      store.setCurrentTime(Math.min(currentPos, store.duration))
    }

    animationFrameId = requestAnimationFrame(updateAnalyser)
  }

  async function play() {
    if (!audioBuffer.value) return

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    if (!nodes) {
      nodes = createNodes()
    }

    // Stop previous source if exists
    if (nodes.source) {
      nodes.source.onended = null
      nodes.source.stop()
      nodes.source.disconnect()
    }

    nodes.source = createSource()
    if (!nodes.source) return

    startTime = ctx.currentTime
    nodes.source.start(0, pausedAt)
    store.setPlaying(true)

    animationFrameId = requestAnimationFrame(updateAnalyser)
  }

  function pause() {
    if (!nodes?.source || !audioContext) return

    const elapsed = (audioContext.currentTime - startTime) * params.value.speed
    pausedAt = pausedAt + elapsed

    nodes.source.onended = null
    nodes.source.stop()
    nodes.source.disconnect()
    nodes.source = null

    store.setPlaying(false)

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      void play()
    }
  }

  function seek(time: number) {
    const wasPlaying = isPlaying.value
    if (wasPlaying) {
      pause()
    }
    pausedAt = time
    store.setCurrentTime(time)
    if (wasPlaying) {
      void play()
    }
  }

  function stop() {
    pause()
    pausedAt = 0
    store.setCurrentTime(0)
  }

  // Watch for parameter changes
  watch(
    () => params.value.bass,
    (newBass) => {
      if (nodes) {
        nodes.bassFilter.gain.value = newBass
      }
    }
  )

  watch(
    () => params.value.speed,
    (newSpeed) => {
      if (nodes?.source) {
        nodes.source.playbackRate.value = newSpeed
      }
    }
  )

  // Note: Pitch shifting in real-time is complex and would require
  // SoundTouch.js with ScriptProcessorNode/AudioWorklet.
  // For MVP, pitch is applied only during export with FFmpeg.
  // The preview will demonstrate speed + bass changes.

  // Cleanup when audio buffer changes (new file loaded)
  watch(audioBuffer, () => {
    stop()
    if (nodes) {
      nodes.gain.disconnect()
      nodes.bassFilter.disconnect()
      nodes.analyser.disconnect()
      nodes = null
    }
  })

  onUnmounted(() => {
    stop()
    if (nodes) {
      nodes.gain.disconnect()
      nodes.bassFilter.disconnect()
      nodes.analyser.disconnect()
    }
    if (audioContext) {
      void audioContext.close()
    }
  })

  return {
    play,
    pause,
    togglePlay,
    seek,
    stop,
  }
}

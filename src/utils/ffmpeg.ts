import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = loadFFmpeg()
  return loadPromise
}

async function loadFFmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg()

  // Load FFmpeg WASM from CDN
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  ffmpegInstance = ffmpeg
  return ffmpeg
}

export function isFFmpegLoaded(): boolean {
  return ffmpegInstance?.loaded ?? false
}

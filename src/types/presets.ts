import type { NightcoreParams } from './audio'

export interface NightcorePreset {
  id: string
  name: string
  description: string
  params: NightcoreParams
}

export const PRESETS: readonly NightcorePreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The traditional nightcore sound',
    params: { speed: 1.25, pitch: 4, bass: 3 },
  },
  {
    id: 'extreme',
    name: 'Extreme',
    description: 'Faster and higher pitched',
    params: { speed: 1.35, pitch: 6, bass: 6 },
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Subtle nightcore effect',
    params: { speed: 1.15, pitch: 2, bass: 0 },
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Your own settings',
    params: { speed: 1.0, pitch: 0, bass: 0 },
  },
] as const

export type PresetId = (typeof PRESETS)[number]['id']

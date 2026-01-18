<script setup lang="ts">
import { ref } from 'vue'
import { useAudioStore } from '@/stores/audio'
import AudioDropzone from '@/components/AudioDropzone.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import ParamControls from '@/components/ParamControls.vue'
import PresetSelector from '@/components/PresetSelector.vue'
import ExportPanel from '@/components/ExportPanel.vue'

const audioStore = useAudioStore()
const showFaq = ref(false)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 relative z-10">
    <!-- Main container -->
    <div class="glass-card w-full max-w-lg p-6 sm:p-8">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="title-kawaii text-3xl sm:text-4xl mb-2">
          ミ Nightcorizer
        </h1>
        <p class="text-text-muted">
          Turn your music into 2010s nightcore style, easily ✨
        </p>
      </header>

      <!-- Content -->
      <main class="space-y-5">
        <!-- Dropzone -->
        <div class="glass-inner p-4 fade-in">
          <AudioDropzone />
        </div>

        <!-- Player -->
        <div v-if="audioStore.hasFile" class="glass-inner p-4 fade-in">
          <AudioPlayer />
        </div>

        <!-- Presets -->
        <div v-if="audioStore.hasFile" class="fade-in">
          <PresetSelector />
        </div>

        <!-- Controls -->
        <div v-if="audioStore.hasFile" class="glass-inner p-4 fade-in">
          <ParamControls />
        </div>

        <!-- Export -->
        <div v-if="audioStore.hasFile" class="fade-in">
          <ExportPanel />
        </div>
      </main>

      <!-- Footer -->
      <footer class="mt-8 text-center">
        <p class="text-text-muted text-sm">
          made with <span class="text-primary">♥</span> by
          <a href="https://snxw.moe" target="_blank" rel="noopener">snxw.moe</a>
        </p>

        <div class="flex items-center justify-center gap-4 mt-4">
          <button
            class="btn-ghost text-xs"
            @click="showFaq = !showFaq"
          >
            {{ showFaq ? 'hide' : 'how does it work?' }}
          </button>
          <span class="text-text-light">·</span>
          <a
            href="https://github.com/SailorSnoW/nightcorizer"
            target="_blank"
            rel="noopener"
            class="btn-ghost text-xs inline-flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        <div v-if="showFaq" class="faq mt-4 text-left glass-inner p-4 fade-in">
          <div class="mb-3">
            <h3>What is it?</h3>
            <p>Nightcore = sped-up music with higher pitch. Classic anime/otaku style!</p>
          </div>
          <div class="mb-3">
            <h3>Privacy</h3>
            <p>100% local. Your files stay on your device.</p>
          </div>
          <div class="mb-3">
            <h3>Formats</h3>
            <p>Input: MP3, WAV, FLAC, OGG. Output: MP3 or FLAC.</p>
          </div>
          <div>
            <h3>Presets</h3>
            <p>Classic (1.25x, +4st) · Extreme (1.35x, +6st) · Soft (1.15x, +2st)</p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

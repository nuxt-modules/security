<script setup>
const title = 'Playground'
const description
  = 'Play online with our interactive Nuxt Security playground.'
useSeoMeta({
  titleTemplate: '%s - Nuxt Security',
  title,
  ogTitle: 'Nuxt Security Playground',
  description,
})
</script>

<template>
  <div class="h-[calc(100vh-var(--header-height))] flex dark:bg-gray-950">
    <ClientOnly>
      <iframe
        class="dark:bg-gray-950"
        :src="`https://stackblitz.com/github/nuxt-modules/security?embed=1&file=.stackblitz%2Fnuxt.config.ts&theme=${$colorMode.preference}`"
        width="100%"
        height="100%"
      />
    </ClientOnly>
  </div>
</template>

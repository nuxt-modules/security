<script setup lang="ts">
definePageMeta({
  colorMode: 'dark',
})

const seo = {
  title: 'Nuxt Security',
  description: 'Automatically configure your app to follow OWASP security patterns and principles by using HTTP Headers and Middleware.',
  cover: 'https://security.nuxtjs.org/preview.png'
}

const source = ref('npx nuxi@latest module add security')
const { copy, copied } = useClipboard({ source })

useSeoMeta({
  title: seo.title,
  ogTitle: seo.title,
  description: seo.description,
  ogDescription: seo.description,
  ogImage: seo.cover,
  twitterImage: seo.cover,
})

const items =
  [{
    title: 'Security response headers',
    icon: 'heroicons-outline:desktop-computer',
    description: 'Add security headers that will make your application more secure by default (including Content Security Policy (CSP) for SSG apps).',
    to: '/headers/csp'
  },
  {
    title: 'Request Size & Rate Limiters',
    icon: 'streamline:interface-alert-warning-triangle-frame-alert-warning-triangle-exclamation-caution',
    description: 'Limit the amount of incoming requests and their size to protect your application against disruptions.',
    to: '/middleware/rate-limiter'
  },
  {
    title: 'Cross Site Scripting (XSS) Validation',
    icon: 'streamline:programming-script-2-language-programming-code',
    description: 'Validate `GET` & `POST` requests against malicious code sent in query or body.',
    to: '/middleware/xss-validator'
  },
  {
    title: 'Cross-Origin Resource Sharing (CORS) support',
    icon: 'carbon:software-resource-cluster',
    description: 'Permit from what origins (domain, scheme, or port) a browser can load resources.',
    to: '/middleware/cors-handler'
  },
  {
    title: 'Allowed HTTP Methods',
    icon: 'material-symbols:checklist-rtl',
    description: 'Reject requests that do not match allow list of HTTP methods.',
    to: '/middleware/allowed-methods-restricter'
  },
  {
    title: 'Cross Site Request Forgery (CSRF) protection',
    icon: 'system-uicons:files-stack',
    description: 'Protect against unwanted state change by unaware users.',
    to: '/middleware/csrf'
  }]
</script>

<template>
  <section>
    <span class="gradient" />
    <ULandingHero
      orientation="horizontal"
      :ui="{ container: 'flex lg:gap-12' }"
    >
      <Illustration />
      <template #title>
        <h1>More Secure <span class="text-primary-400">Nuxt Apps</span><br> by default</h1>
      </template>
      <template #description>
        {{ seo.description }}
      </template>
      <template #links>
        <UButton
          to="/getting-started/installation"
          icon="i-ph-rocket-launch-duotone"
          size="xl"
        >
          Get Started
        </UButton>
        <UInput
          aria-label="Copy code to get started"
          :model-value="source"
          name="get-started"
          disabled
          autocomplete="off"
          size="xl"
          :ui="{ base: 'disabled:cursor-default', icon: { trailing: { pointer: '' } } }"
        >
          <template #leading>
            <UIcon name="i-ph-terminal" />
          </template>
          <template #trailing>
            <UButton
              aria-label="Copy Code"
              :color="copied ? 'green' : 'gray'"
              variant="ghost"
              :padded="false"
              :icon="copied ? 'i-ph-check-square-duotone' : 'i-ph-copy-duotone'"
              @click="copy(source)"
            />
          </template>
        </UInput>
      </template>
    </ULandingHero>



    <ULandingSection style="padding-top: 0px">
      <template #title>
        Protect your app with <br> <span class="text-primary-400">no configuration</span>
      </template>

      <UPageGrid>
        <ULandingCard
          v-for="(item, index) of items"
          :key="index"
          v-bind="item"
        />
      </UPageGrid>
    </ULandingSection>

    <ULandingSection align="left">
      <template #title>
        Discover how it helps ship<br><span class="text-primary-400">secure applications</span>
      </template>
      <template #description>
        Nuxt Security solves several security issues automatically by implementing Headers and Middleware accordingly to
        OWASP & OWASP Top 10 documents. For others, it provides optional middleware that will help you handle more
        advanced cases like Cross Site Request Forgery.
      </template>
      <template #links>
        <UButton
          to="/getting-started/installation"
          icon="i-ph-rocket-launch-duotone"
          size="xl"
        >
          Get Started
        </UButton>
      </template>

      <div>
        <iframe
          width="100%"
          height="315"
          src="https://www.youtube-nocookie.com/embed/sJVeU0KGmv4"
          title="Nuxt Security"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </div>
    </ULandingSection>
  </section>
</template>

<style scoped lang="postcss">
.gradient {
  position: fixed;
  top: 25vh;
  width: 100%;
  height: 30vh;
  background: radial-gradient(50% 50% at 50% 50%,
      #00dc82 0%,
      rgba(0, 220, 130, 0) 100%);
  filter: blur(180px);
  opacity: 0.6;
  z-index: -1;
}

.prose {
  @apply text-white;

  :where(:deep(code)) {
    @apply text-gray-200;
  }
}
</style>

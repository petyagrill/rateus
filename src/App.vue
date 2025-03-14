<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// Import layouts
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import SurveyLayout from '@/layouts/SurveyLayout.vue'

export default {
  name: 'App',
  components: {
    DefaultLayout,
    AuthLayout,
    SurveyLayout
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    // Compute the current layout based on the route meta
    const layout = computed(() => {
      const layoutName = route.meta.layout || 'default'
      return {
        'default': DefaultLayout,
        'auth': AuthLayout,
        'survey': SurveyLayout
      }[layoutName]
    })

    onMounted(async () => {
      // Check authentication status on app load
      if (localStorage.getItem('auth_token')) {
        try {
          await authStore.getUserProfile()
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
          localStorage.removeItem('auth_token')
          if (!route.meta.public) {
            router.push('/login')
          }
        }
      } else if (!route.meta.public) {
        router.push('/login')
      }
    })

    return {
      layout
    }
  }
}
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
  color: #333;
  background-color: #f8f9fa;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.router-link-active {
  font-weight: bold;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>
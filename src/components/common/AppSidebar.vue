<template>
  <aside class="sidebar">
    <div class="px-3 py-4">
      <div class="d-flex align-items-center justify-content-between mb-4 d-md-none">
        <h5 class="mb-0">Menu</h5>
        <button @click="closeSidebar" class="btn btn-sm">
          <i class="bi bi-x fs-4"></i>
        </button>
      </div>

      <div class="mb-4">
        <router-link
          to="/surveys/create"
          class="btn btn-primary w-100"
        >
          <i class="bi bi-plus-circle me-2"></i>
          New Survey
        </router-link>
      </div>

      <nav class="nav flex-column">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'active': isActive(item.path) }"
        >
          <i :class="item.icon"></i>
          {{ item.label }}
        </router-link>
      </nav>

      <div class="mt-4 pt-4 border-top">
        <h6 class="text-muted text-uppercase small fw-bold px-3 mb-3">Recent Surveys</h6>
        <div v-if="recentSurveys.length === 0" class="text-center py-3">
          <small class="text-muted">No recent surveys</small>
        </div>
        <div v-else>
          <router-link
            v-for="survey in recentSurveys"
            :key="survey.id"
            :to="`/surveys/${survey.id}`"
            class="d-block p-2 text-decoration-none text-dark rounded mb-2 sidebar-survey"
          >
            <div class="d-flex align-items-center">
              <div class="survey-icon me-2">
                <i class="bi bi-clipboard-data"></i>
              </div>
              <div class="text-truncate">
                <div class="text-truncate fw-medium small">{{ survey.title }}</div>
                <div class="text-muted x-small">{{ formatDate(survey.updated_at) }}</div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'AppSidebar',
  emits: ['close'],
  setup(props, { emit }) {
    const route = useRoute()

    const navItems = [
      { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
      { path: '/surveys', label: 'My Surveys', icon: 'bi bi-clipboard-data' },
      { path: '/responses', label: 'Responses', icon: 'bi bi-bar-chart' },
      { path: '/analytics', label: 'Analytics', icon: 'bi bi-graph-up' },
      { path: '/integrations', label: 'Integrations', icon: 'bi bi-gear' },
      { path: '/help', label: 'Help & Support', icon: 'bi bi-question-circle' }
    ]

    // Mock data - would come from a survey store in real app
    const recentSurveys = ref([
      { id: 1, title: 'Customer Satisfaction Q1', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      { id: 2, title: 'Product Feedback Survey', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
      { id: 3, title: 'Website UX Evaluation', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8) }
    ])

    const isActive = (path) => {
      if (path === '/dashboard' && route.path === '/') {
        return true
      }
      return route.path.startsWith(path)
    }

    const closeSidebar = () => {
      emit('close')
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }

    return {
      navItems,
      recentSurveys,
      isActive,
      closeSidebar,
      formatDate
    }
  }
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

.survey-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #f0f7ff;
  color: #4361ee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-survey:hover {
  background-color: #f0f7ff;
}

.x-small {
  font-size: 0.7rem;
}

@media (max-width: 767.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    z-index: 1030;
    background-color: white;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }

  .sidebar.show {
    transform: translateX(0);
  }
}
</style>
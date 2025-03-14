<template>
  <div class="survey-layout">
    <div class="survey-layout-header">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center py-3">
          <div>
            <img
              v-if="survey && survey.logo_url"
              :src="survey.logo_url"
              :alt="survey.title + ' logo'"
              class="survey-logo"
            >
            <h5 v-else class="mb-0">{{ survey?.organization_name || 'RateUS Survey' }}</h5>
          </div>
          <div class="survey-progress" v-if="showProgress && survey && survey.total_steps > 1">
            <span>{{ currentStep }} / {{ survey.total_steps }}</span>
            <div class="progress mt-1" style="height: 8px;">
              <div
                class="progress-bar"
                :style="{ width: `${(currentStep / survey.total_steps) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="survey-layout-content">
      <div class="container py-4">
        <slot />
      </div>
    </div>

    <div class="survey-layout-footer">
      <div class="container">
        <div class="text-center py-3">
          <small class="text-muted">
            Powered by <a href="/" target="_blank" class="text-decoration-none">RateUS</a>
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'SurveyLayout',
  props: {
    survey: {
      type: Object,
      default: () => ({})
    },
    currentStep: {
      type: Number,
      default: 1
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const route = useRoute()
    const surveyId = computed(() => route.params.surveyId)

    return {
      surveyId
    }
  }
}
</script>

<style scoped>
.survey-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.survey-layout-header {
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.survey-layout-content {
  flex: 1;
}

.survey-layout-footer {
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}

.survey-logo {
  max-height: 40px;
}

.survey-progress {
  max-width: 200px;
  width: 100%;
}

.progress-bar {
  background-color: #4361ee;
}
</style>
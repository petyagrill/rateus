<template>
  <div class="survey-thank-you-view">
    <div class="thank-you-container text-center">
      <div class="thank-you-icon mb-4">
        <i class="bi bi-check-circle-fill"></i>
      </div>

      <h1 class="thank-you-title mb-3">Thank You!</h1>

      <p class="thank-you-message lead mb-5">
        {{ survey.settings?.thankYouMessage || 'Your feedback has been submitted successfully.' }}
      </p>

      <div v-if="survey.settings?.showShareOptions" class="share-options mb-4">
        <p class="mb-3">Share your experience with others:</p>
        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-outline-primary">
            <i class="bi bi-facebook me-2"></i> Facebook
          </button>
          <button class="btn btn-outline-info">
            <i class="bi bi-twitter me-2"></i> Twitter
          </button>
          <button class="btn btn-outline-primary">
            <i class="bi bi-linkedin me-2"></i> LinkedIn
          </button>
        </div>
      </div>

      <div v-if="!autoRedirecting">
        <a
          v-if="survey.settings?.redirectUrl"
          :href="survey.settings.redirectUrl"
          class="btn btn-primary"
        >
          Continue
        </a>
        <button v-else class="btn btn-primary" @click="startNewSurvey">
          Start a New Survey
        </button>
      </div>

      <div v-else class="redirect-message mt-3">
        <p class="text-muted">
          <small>
            Redirecting in {{ redirectCountdown }} seconds...
            <button
              @click="cancelRedirect"
              class="btn btn-link btn-sm text-decoration-none p-0 ms-2"
            >
              Cancel
            </button>
          </small>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'SurveyThankYouView',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const surveyId = computed(() => route.params.surveyId)
    const redirectCountdown = ref(5)
    const redirectTimer = ref(null)
    const autoRedirecting = ref(false)

    // Mock survey data (in a real app, you might fetch this from the store)
    const survey = ref({
      id: surveyId.value,
      settings: {
        thankYouMessage: 'Thank you for taking the time to complete our survey. Your feedback is valuable to us and will help us improve our services.',
        redirectUrl: '',
        showShareOptions: true
      }
    })

    // Start redirect countdown
    const startRedirectCountdown = () => {
      if (survey.value.settings.redirectUrl) {
        autoRedirecting.value = true

        redirectTimer.value = setInterval(() => {
          redirectCountdown.value--

          if (redirectCountdown.value <= 0) {
            clearInterval(redirectTimer.value)
            window.location.href = survey.value.settings.redirectUrl
          }
        }, 1000)
      }
    }

    // Cancel the redirect
    const cancelRedirect = () => {
      if (redirectTimer.value) {
        clearInterval(redirectTimer.value)
        autoRedirecting.value = false
      }
    }

    // Start a new survey (reset)
    const startNewSurvey = () => {
      router.push(`/s/${surveyId.value}`)
    }

    onMounted(() => {
      // Start redirect countdown after a delay
      setTimeout(startRedirectCountdown, 1000)
    })

    onBeforeUnmount(() => {
      cancelRedirect()
    })

    return {
      survey,
      redirectCountdown,
      autoRedirecting,
      cancelRedirect,
      startNewSurvey
    }
  }
}
</script>

<style scoped>
.survey-thank-you-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.thank-you-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.thank-you-icon {
  font-size: 4rem;
  color: #4361ee;
}

.thank-you-title {
  font-weight: 600;
  color: #333;
}

.thank-you-message {
  color: #6c757d;
}

@media (max-width: 767.98px) {
  .thank-you-container {
    padding: 2rem 1.5rem;
  }

  .thank-you-icon {
    font-size: 3rem;
  }
}
</style>
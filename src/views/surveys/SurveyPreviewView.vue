<template>
  <div class="survey-preview-view">
    <div class="preview-header bg-light">
      <div class="container-fluid py-3">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <router-link :to="`/surveys/${surveyId}/edit`" class="btn btn-sm btn-link p-0 me-3">
              <i class="bi bi-arrow-left"></i> Back to Editor
            </router-link>
            <h5 class="mb-0">Preview: {{ survey.title }}</h5>
          </div>
          <div class="preview-controls">
            <div class="btn-group me-2">
              <button
                v-for="device in previewDevices"
                :key="device.id"
                class="btn btn-sm"
                :class="currentDevice === device.id ? 'btn-primary' : 'btn-outline-primary'"
                @click="currentDevice = device.id"
                :title="device.label"
              >
                <i :class="`bi ${device.icon}`"></i>
              </button>
            </div>
            <div class="form-check form-switch d-inline-block align-middle ms-2">
              <input
                class="form-check-input"
                type="checkbox"
                id="darkModeSwitch"
                v-model="darkMode"
              >
              <label class="form-check-label small" for="darkModeSwitch">Dark</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-container py-4" :class="{ 'bg-dark': darkMode }">
      <div class="device-wrapper" :class="currentDevice">
        <div class="device-frame">
          <div class="device-content" :class="{ 'dark-mode': darkMode }">
            <!-- Loading state -->
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3 text-muted">Loading survey...</p>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="alert alert-danger mx-3 my-4">
              <h4 class="alert-heading">Error</h4>
              <p>{{ error }}</p>
              <hr>
              <p class="mb-0">
                <button class="btn btn-sm btn-outline-danger" @click="fetchSurvey">
                  <i class="bi bi-arrow-repeat me-1"></i> Try Again
                </button>
              </p>
            </div>

            <!-- Survey preview content -->
            <div v-else class="survey-container">
              <div class="survey-preview-content">
                <!-- Survey Header -->
                <div v-if="!currentStep || currentStepIndex === 0" class="survey-header text-center mb-4">
                  <h1 class="survey-title">{{ survey.title }}</h1>
                  <p v-if="survey.description" class="survey-description lead">
                    {{ survey.description }}
                  </p>
                </div>

                <!-- Progress indicator -->
                <div v-if="survey.settings?.showProgressBar && survey.steps.length > 1" class="progress-container mb-4">
                  <div class="d-flex justify-content-between mb-2 small">
                    <span>Progress</span>
                    <span>{{ currentStepIndex + 1 }} of {{ survey.steps.length }}</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div
                      class="progress-bar bg-primary"
                      :style="{
                        width: `${((currentStepIndex + 1) / survey.steps.length) * 100}%`
                      }"
                    ></div>
                  </div>
                </div>

                <!-- Step Header if enabled -->
                <div v-if="currentStep && survey.settings?.showStepTitles" class="step-header mb-4">
                  <h3 class="step-title">{{ currentStep.title }}</h3>
                  <p v-if="currentStep.description" class="step-description text-muted">
                    {{ currentStep.description }}
                  </p>
                </div>

                <!-- Survey Questions -->
                <div v-if="currentStep" class="survey-questions">
                  <div v-for="question in currentStep.questions" :key="question.id" class="mb-4">
                    <component
                      :is="getFieldComponent(question.type)"
                      :field="question"
                      :is-preview="true"
                      v-model="responses[question.id]"
                    />
                  </div>
                </div>

                <!-- Survey Buttons -->
                <div class="survey-buttons d-flex mt-4">
                  <button
                    v-if="currentStepIndex > 0 && survey.settings?.allowPrevious"
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="previousStep"
                  >
                    <i class="bi bi-arrow-left me-2"></i> Previous
                  </button>

                  <button
                    type="button"
                    class="btn btn-primary ms-auto"
                    @click="nextStep"
                  >
                    {{ isLastStep ? 'Submit' : 'Next' }}
                    <i v-if="!isLastStep" class="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>

              <!-- Thank you screen -->
              <div v-if="showThankYou" class="survey-thank-you text-center py-5">
                <div class="thank-you-icon mb-4">
                  <i class="bi bi-check-circle-fill"></i>
                </div>

                <h2>Thank You!</h2>
                <p class="lead mb-5">
                  {{ survey.settings?.thankYouMessage || 'Your feedback has been submitted successfully.' }}
                </p>

                <button @click="resetPreview" class="btn btn-primary">
                  <i class="bi bi-arrow-repeat me-1"></i> Restart Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSurveyStore } from '@/store/survey'

// Import field components
import TextField from '@/components/survey/fields/TextField.vue'
import TextareaField from '@/components/survey/fields/TextareaField.vue'
import RadioField from '@/components/survey/fields/RadioField.vue'
import CheckboxField from '@/components/survey/fields/CheckboxField.vue'
import DropdownField from '@/components/survey/fields/DropdownField.vue'
import RatingField from '@/components/survey/fields/RatingField.vue'
import NPSField from '@/components/survey/fields/NPSField.vue'
import FileField from '@/components/survey/fields/FileField.vue'

export default {
  name: 'SurveyPreviewView',
  components: {
    TextField,
    TextareaField,
    RadioField,
    CheckboxField,
    DropdownField,
    RatingField,
    NPSField,
    FileField
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const surveyStore = useSurveyStore()

    const surveyId = computed(() => route.params.id)
    const isLoading = ref(true)
    const error = ref(null)

    // Preview settings
    const currentDevice = ref('desktop')
    const darkMode = ref(false)
    const previewDevices = [
      { id: 'desktop', label: 'Desktop', icon: 'bi-display' },
      { id: 'tablet', label: 'Tablet', icon: 'bi-tablet' },
      { id: 'mobile', label: 'Mobile', icon: 'bi-phone' }
    ]

    // Survey data
    const survey = ref({
      id: null,
      title: '',
      description: '',
      settings: {
        showProgressBar: true,
        allowPrevious: true,
        showStepTitles: true,
        thankYouMessage: 'Thank you for completing our survey!'
      },
      steps: []
    })

    // Navigation state
    const currentStepIndex = ref(0)
    const currentStep = computed(() => {
      if (!survey.value.steps || survey.value.steps.length === 0) return null
      return survey.value.steps[currentStepIndex.value]
    })

    const isLastStep = computed(() => {
      return currentStepIndex.value === survey.value.steps.length - 1
    })

    // Thank you screen
    const showThankYou = ref(false)

    // Response data
    const responses = ref({})

    // Fetch survey data
    const fetchSurvey = async () => {
      isLoading.value = true
      error.value = null

      try {
        // In a real app, this would be an API call
        const surveyData = await surveyStore.fetchSurvey(surveyId.value)
        survey.value = surveyData

        // Initialize response object with empty values
        resetResponses()
      } catch (err) {
        console.error('Failed to fetch survey:', err)
        error.value = 'Failed to load survey. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    // Reset responses to initial state
    const resetResponses = () => {
      const initialResponses = {}

      survey.value.steps.forEach(step => {
        step.questions.forEach(question => {
          initialResponses[question.id] = null
        })
      })

      responses.value = initialResponses
    }

    // Navigation methods
    const nextStep = () => {
      if (isLastStep.value) {
        showThankYou.value = true
      } else {
        currentStepIndex.value++
        window.scrollTo(0, 0)
      }
    }

    const previousStep = () => {
      if (currentStepIndex.value > 0) {
        currentStepIndex.value--
        window.scrollTo(0, 0)
      }
    }

    // Reset the preview
    const resetPreview = () => {
      resetResponses()
      currentStepIndex.value = 0
      showThankYou.value = false
    }

    // Get component for question type
    const getFieldComponent = (type) => {
      const componentMap = {
        'text': TextField,
        'textarea': TextareaField,
        'radio': RadioField,
        'checkbox': CheckboxField,
        'dropdown': DropdownField,
        'rating': RatingField,
        'nps': NPSField,
        'file': FileField,
        'email': TextField,
        'number': TextField,
        'phone': TextField,
        'date': TextField
      }

      return componentMap[type] || TextField
    }

    // Initialize component
    onMounted(() => {
      fetchSurvey()
    })

    return {
      surveyId,
      survey,
      isLoading,
      error,
      currentStepIndex,
      currentStep,
      isLastStep,
      showThankYou,
      responses,
      currentDevice,
      darkMode,
      previewDevices,
      fetchSurvey,
      nextStep,
      previousStep,
      resetPreview,
      getFieldComponent
    }
  }
}
</script>

<style scoped>
.survey-preview-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.preview-container {
  display: flex;
  justify-content: center;
  flex: 1;
  transition: background-color 0.3s ease;
}

.device-wrapper {
  width: 100%;
  max-width: 100%;
  transition: all 0.3s ease;
}

/* Desktop preview */
.device-wrapper.desktop {
  max-width: 1000px;
}

/* Tablet preview */
.device-wrapper.tablet {
  max-width: 768px;
}

/* Mobile preview */
.device-wrapper.mobile {
  max-width: 375px;
}

.device-frame {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 700px;
  max-height: 80vh;
  overflow: hidden;
  transition: all 0.3s ease;
}

.device-content {
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
  transition: background-color 0.3s ease;
}

.device-content.dark-mode {
  background-color: #212529;
  color: #f8f9fa;
}

.survey-container {
  max-width: 650px;
  margin: 0 auto;
  padding: 2rem;
}

.survey-preview-content {
  transition: opacity 0.3s ease;
}

.survey-buttons {
  margin-top: 2rem;
}

.thank-you-icon {
  font-size: 4rem;
  color: #4361ee;
}

/* Dark mode styles */
.device-content.dark-mode .survey-description,
.device-content.dark-mode .step-description {
  color: #adb5bd !important;
}

.device-content.dark-mode .progress {
  background-color: #343a40;
}

.device-content.dark-mode .btn-outline-secondary {
  color: #adb5bd;
  border-color: #495057;
}

.device-content.dark-mode .btn-outline-secondary:hover {
  background-color: #495057;
  color: #f8f9fa;
}

@media (max-width: 768px) {
  .device-wrapper.desktop,
  .device-wrapper.tablet {
    max-width: 100%;
  }

  .device-frame {
    border: none;
    border-radius: 0;
    box-shadow: none;
    height: auto;
    max-height: none;
  }

  .survey-container {
    padding: 1rem;
  }
}
</style>
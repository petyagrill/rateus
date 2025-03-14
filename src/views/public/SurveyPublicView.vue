<template>
  <div class="survey-public-view">
    <div class="survey-container">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading survey...</p>
      </div>

      <div v-else-if="error" class="text-center py-5">
        <i class="bi bi-exclamation-circle text-danger fs-1 mb-3"></i>
        <h4>{{ error }}</h4>
        <p class="text-muted">The requested survey could not be loaded.</p>
      </div>

      <div v-else>
        <!-- Survey header -->
        <div class="survey-header mb-5 text-center">
          <h1 class="survey-title mb-3">{{ survey.title }}</h1>
          <p v-if="survey.description" class="survey-description lead">
            {{ survey.description }}
          </p>
        </div>

        <!-- Progress indicator -->
        <div
          v-if="survey.settings?.showProgressBar && survey.steps.length > 1"
          class="survey-progress mb-4"
        >
          <div class="d-flex justify-content-between mb-2 small">
            <span>Progress</span>
            <span>{{ currentStepIndex + 1 }} of {{ survey.steps.length }}</span>
          </div>
          <div class="progress" style="height: 8px;">
            <div
              class="progress-bar"
              :style="{
                width: `${((currentStepIndex + 1) / survey.steps.length) * 100}%`
              }"
            ></div>
          </div>
        </div>

        <!-- Current step title and description -->
        <div v-if="survey.settings?.showStepTitles && currentStep" class="step-header mb-4">
          <h3 class="step-title">{{ currentStep.title }}</h3>
          <p v-if="currentStep.description" class="step-description text-muted">
            {{ currentStep.description }}
          </p>
        </div>

        <!-- Survey form -->
        <form @submit.prevent="submitStep">
          <div v-if="currentStep">
            <div v-for="question in currentStep.questions" :key="question.id" class="mb-4">
              <component
                :is="getFieldComponent(question.type)"
                :field="question"
                v-model="responses[question.id]"
                :error-message="errors[question.id]"
                :is-preview="true"
                @focus="clearError(question.id)"
              />
            </div>
          </div>

          <!-- Navigation buttons -->
          <div class="survey-navigation d-flex mt-5">
            <button
              v-if="currentStepIndex > 0 && survey.settings?.allowPrevious"
              type="button"
              class="btn btn-outline-secondary"
              @click="previousStep"
              :disabled="isSubmitting"
            >
              <i class="bi bi-arrow-left me-2"></i> Previous
            </button>

            <div class="ms-auto">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isLastStep ? 'Submit' : 'Next' }}
                <i v-if="!isLastStep" class="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResponseStore } from '@/store/response'

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
  name: 'SurveyPublicView',
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
    const responseStore = useResponseStore()

    const surveyId = computed(() => route.params.surveyId)
    const isLoading = ref(true)
    const isSubmitting = ref(false)
    const error = ref('')

    // Survey data
    const survey = ref({
      id: null,
      title: '',
      description: '',
      settings: {},
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

    // Form data and validation
    const responses = ref({})
    const errors = ref({})

    // Fetch survey data
    const fetchSurvey = async () => {
      isLoading.value = true
      error.value = ''

      try {
        // In a real application, this would be an API call
        // const response = await axios.get(`/surveys/public/${surveyId.value}`)
        // survey.value = response.data.survey

        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        survey.value = {
          id: surveyId.value,
          title: 'Customer Satisfaction Survey',
          description: 'Please take a moment to share your experience with our products and services.',
          settings: {
            showProgressBar: true,
            allowPrevious: true,
            showStepTitles: true,
            thankYouMessage: 'Thank you for completing our survey!'
          },
          steps: [
            {
              id: 1,
              title: 'About You',
              description: 'Tell us a bit about yourself',
              questions: [
                {
                  id: 'q1',
                  type: 'text',
                  label: 'What is your name?',
                  placeholder: 'Enter your full name',
                  required: true
                },
                {
                  id: 'q2',
                  type: 'email',
                  label: 'What is your email address?',
                  placeholder: 'Enter your email',
                  required: true
                },
                {
                  id: 'q3',
                  type: 'dropdown',
                  label: 'How long have you been our customer?',
                  required: true,
                  settings: {
                    options: [
                      { id: 1, value: 'Less than 1 year', label: 'Less than 1 year' },
                      { id: 2, value: '1-3 years', label: '1-3 years' },
                      { id: 3, value: '3-5 years', label: '3-5 years' },
                      { id: 4, value: 'More than 5 years', label: 'More than 5 years' }
                    ]
                  }
                }
              ]
            },
            {
              id: 2,
              title: 'Product Experience',
              description: 'Tell us about your experience with our products',
              questions: [
                {
                  id: 'q4',
                  type: 'rating',
                  label: 'How would you rate the quality of our products?',
                  required: true,
                  settings: {
                    min: 1,
                    max: 5,
                    step: 1,
                    showLabels: true,
                    minLabel: 'Poor',
                    maxLabel: 'Excellent'
                  }
                },
                {
                  id: 'q5',
                  type: 'textarea',
                  label: 'What do you like most about our products?',
                  placeholder: 'Share your thoughts...',
                  required: false
                },
                {
                  id: 'q6',
                  type: 'textarea',
                  label: 'What improvements would you suggest for our products?',
                  placeholder: 'Share your suggestions...',
                  required: false
                }
              ]
            },
            {
              id: 3,
              title: 'Overall Experience',
              description: 'Please provide your overall feedback',
              questions: [
                {
                  id: 'q7',
                  type: 'nps',
                  label: 'How likely are you to recommend our company to your friends and colleagues?',
                  required: true,
                  settings: {
                    showLabels: true,
                    detractorLabel: 'Not at all likely',
                    promoterLabel: 'Extremely likely',
                    showFollowUp: true
                  }
                },
                {
                  id: 'q8',
                  type: 'textarea',
                  label: 'Do you have any other comments, questions, or concerns?',
                  placeholder: 'Share any additional feedback...',
                  required: false
                }
              ]
            }
          ]
        }

        // Initialize response object with empty values
        survey.value.steps.forEach(step => {
          step.questions.forEach(question => {
            responses.value[question.id] = null
          })
        })

      } catch (err) {
        console.error('Failed to fetch survey:', err)
        error.value = 'Survey not found or unavailable'
      } finally {
        isLoading.value = false
      }
    }

    // Go to the next step
    const nextStep = () => {
      if (currentStepIndex.value < survey.value.steps.length - 1) {
        currentStepIndex.value++
        window.scrollTo(0, 0)
      }
    }

    // Go to the previous step
    const previousStep = () => {
      if (currentStepIndex.value > 0) {
        currentStepIndex.value--
        window.scrollTo(0, 0)
      }
    }

    // Validate the current step
    const validateStep = () => {
      const validationErrors = {}
      let isValid = true

      // Validate each question in the current step
      currentStep.value.questions.forEach(question => {
        if (question.required) {
          const response = responses.value[question.id]

          if (response === null || response === undefined || response === '') {
            validationErrors[question.id] = 'This field is required'
            isValid = false
          } else if (question.type === 'email' && !validateEmail(response)) {
            validationErrors[question.id] = 'Please enter a valid email address'
            isValid = false
          }
        }
      })

      errors.value = validationErrors
      return isValid
    }

    // Submit the current step
    const submitStep = () => {
      if (!validateStep()) {
        return
      }

      if (isLastStep.value) {
        submitSurvey()
      } else {
        nextStep()
      }
    }

    // Submit the full survey
    const submitSurvey = async () => {
      isSubmitting.value = true

      try {
        // In a real application, this would be an API call
        // const payload = {
        //   survey_id: survey.value.id,
        //   responses: responses.value
        // }
        // await responseStore.submitSurveyResponse(survey.value.id, payload)

        // Mock submission for now
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

        // Redirect to thank you page
        router.push(`/s/${surveyId.value}/thank-you`)
      } catch (err) {
        console.error('Failed to submit survey:', err)
        error.value = 'Failed to submit your responses. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    // Clear validation error for a specific field
    const clearError = (questionId) => {
      if (errors.value[questionId]) {
        errors.value = {
          ...errors.value,
          [questionId]: ''
        }
      }
    }

    // Validate email format
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    }

    // Map field types to components
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

    onMounted(() => {
      fetchSurvey()
    })

    return {
      survey,
      isLoading,
      isSubmitting,
      error,
      currentStepIndex,
      currentStep,
      isLastStep,
      responses,
      errors,
      nextStep,
      previousStep,
      submitStep,
      clearError,
      getFieldComponent
    }
  }
}
</script>

<style scoped>
.survey-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.survey-title {
  font-weight: 600;
  color: #333;
}

.survey-progress .progress-bar {
  background-color: #4361ee;
}

.step-title {
  font-weight: 600;
  color: #333;
  font-size: 1.5rem;
}

@media (max-width: 767.98px) {
  .survey-container {
    padding: 1.5rem;
  }
}
</style>
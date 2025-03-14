<template>
  <div class="survey-edit-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <router-link to="/surveys" class="btn btn-sm btn-link me-2 p-0">
          <i class="bi bi-arrow-left"></i>
        </router-link>
        <h1 class="h3 mb-0">Edit Survey</h1>
      </div>
      <div class="d-flex">
        <router-link
          :to="`/surveys/${surveyId}/preview`"
          class="btn btn-outline-secondary me-2"
          target="_blank"
        >
          <i class="bi bi-eye me-1"></i> Preview
        </router-link>
        <button
          class="btn btn-primary"
          @click="saveSurvey"
          :disabled="isSaving"
        >
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Save Changes
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading survey...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button @click="fetchSurvey" class="btn btn-sm btn-outline-danger ms-2">
        <i class="bi bi-arrow-clockwise me-1"></i> Retry
      </button>
    </div>

    <!-- Survey editor -->
    <div v-else>
      <div class="row">
        <div class="col-md-9">
          <!-- Survey Builder -->
          <SurveyFormBuilder
            ref="formBuilder"
            :initial-survey="survey"
            @update="handleSurveyUpdate"
            @save="saveSurvey"
          />
        </div>

        <div class="col-md-3">
          <!-- Survey Settings Panel -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Survey Settings</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label d-flex justify-content-between align-items-center">
                  <span>Show Progress Bar</span>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="showProgressBar"
                      v-model="survey.settings.showProgressBar"
                    >
                  </div>
                </label>
                <div class="form-text">Show progress to respondents as they complete the survey.</div>
              </div>

              <div class="mb-3">
                <label class="form-label d-flex justify-content-between align-items-center">
                  <span>Allow Previous Button</span>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="allowPrevious"
                      v-model="survey.settings.allowPrevious"
                    >
                  </div>
                </label>
                <div class="form-text">Allow respondents to go back to previous steps.</div>
              </div>

              <div class="mb-3">
                <label class="form-label d-flex justify-content-between align-items-center">
                  <span>Show Step Titles</span>
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="showStepTitles"
                      v-model="survey.settings.showStepTitles"
                    >
                  </div>
                </label>
                <div class="form-text">Display step titles to respondents.</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Thank You Message</label>
                <textarea
                  class="form-control"
                  rows="3"
                  placeholder="Message to show after survey completion"
                  v-model="survey.settings.thankYouMessage"
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Redirect URL (optional)</label>
                <input
                  type="url"
                  class="form-control"
                  placeholder="https://example.com/thank-you"
                  v-model="survey.settings.redirectUrl"
                >
                <div class="form-text">Redirect respondents after survey completion.</div>
              </div>
            </div>
          </div>

          <!-- Status and Distribution -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Status & Distribution</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Survey Status</label>
                <select class="form-select" v-model="survey.status">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <hr>

              <h6>Share Your Survey</h6>

              <div class="mb-3">
                <label class="form-label">Survey Link</label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    :value="surveyUrl"
                    readonly
                  >
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="copySurveyLink"
                    title="Copy to clipboard"
                  >
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">QR Code</label>
                <div class="qr-code-container">
                  <!-- QR code would be rendered here in a real app -->
                  <div class="d-flex justify-content-center align-items-center p-4 border rounded bg-light">
                    <div class="text-center text-muted">
                      <i class="bi bi-qr-code fs-1 mb-2"></i>
                      <p class="small mb-0">QR Code preview</p>
                    </div>
                  </div>
                  <div class="mt-2 d-grid">
                    <button class="btn btn-sm btn-outline-primary" @click="downloadQrCode">
                      <i class="bi bi-download me-1"></i> Download
                    </button>
                  </div>
                </div>
              </div>

              <div class="d-grid">
                <button class="btn btn-outline-primary" @click="showEmailModal">
                  <i class="bi bi-envelope me-1"></i> Email Survey
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSurveyStore } from '@/store/survey'
import { toast } from 'vue3-toastify'
import SurveyFormBuilder from '@/components/survey/SurveyFormBuilder.vue'

export default {
  name: 'SurveyEditView',
  components: {
    SurveyFormBuilder
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const surveyStore = useSurveyStore()
    const formBuilder = ref(null)

    const surveyId = computed(() => route.params.id)
    const isLoading = ref(true)
    const isSaving = ref(false)
    const error = ref('')

    // Survey data
    const survey = reactive({
      id: null,
      title: '',
      description: '',
      status: 'draft',
      settings: {
        showProgressBar: true,
        allowPrevious: true,
        showStepTitles: true,
        thankYouMessage: 'Thank you for completing our survey!',
        redirectUrl: ''
      },
      steps: []
    })

    // Survey public URL
    const surveyUrl = computed(() => {
      const baseUrl = window.location.origin
      return `${baseUrl}/s/${surveyId.value}`
    })

    // Fetch survey data
    const fetchSurvey = async () => {
      isLoading.value = true
      error.value = ''

      try {
        const surveyData = await surveyStore.fetchSurvey(surveyId.value)

        // Update the reactive survey object
        Object.assign(survey, surveyData)

        // Ensure settings object is properly initialized
        if (!survey.settings) {
          survey.settings = {
            showProgressBar: true,
            allowPrevious: true,
            showStepTitles: true,
            thankYouMessage: 'Thank you for completing our survey!',
            redirectUrl: ''
          }
        }
      } catch (err) {
        console.error('Failed to fetch survey:', err)
        error.value = 'Failed to load survey. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    // Handle survey updates from the form builder
    const handleSurveyUpdate = (updatedSurvey) => {
      // Update only the form builder related fields to avoid overriding settings
      survey.title = updatedSurvey.title
      survey.description = updatedSurvey.description
      survey.steps = updatedSurvey.steps
    }

    // Save the survey
    const saveSurvey = async () => {
      if (isSaving.value) return

      isSaving.value = true

      try {
        const savedSurvey = await surveyStore.updateSurvey(surveyId.value, survey)
        toast.success('Survey saved successfully')
      } catch (err) {
        console.error('Failed to save survey:', err)
        toast.error('Failed to save survey. Please try again.')
      } finally {
        isSaving.value = false
      }
    }

    // Copy survey link to clipboard
    const copySurveyLink = () => {
      navigator.clipboard.writeText(surveyUrl.value)
        .then(() => {
          toast.success('Survey link copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy link:', err)
          toast.error('Failed to copy link. Please try again.')
        })
    }

    // Download QR code
    const downloadQrCode = () => {
      // In a real app, this would generate and download a QR code image
      toast.info('QR code download would be implemented here')
    }

    // Show email distribution modal
    const showEmailModal = () => {
      // In a real app, this would show a modal for email distribution
      toast.info('Email distribution would be implemented here')
    }

    // Initialize the component
    onMounted(() => {
      fetchSurvey()
    })

    return {
      surveyId,
      survey,
      isLoading,
      isSaving,
      error,
      formBuilder,
      surveyUrl,
      fetchSurvey,
      handleSurveyUpdate,
      saveSurvey,
      copySurveyLink,
      downloadQrCode,
      showEmailModal
    }
  }
}
</script>

<style scoped>
.survey-edit-view {
  min-height: 100%;
}

.qr-code-container {
  width: 100%;
}
</style>
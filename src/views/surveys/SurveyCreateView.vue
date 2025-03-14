<template>
  <div class="survey-create-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Create New Survey</h1>
      <div>
        <button
          class="btn btn-outline-secondary me-2"
          @click="$router.push('/surveys')"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click="saveSurvey"
          :disabled="isSaving"
        >
          <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Save Survey
        </button>
      </div>
    </div>

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
        <div class="card">
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

        <!-- Distribution Options -->
        <div class="card mt-3">
          <div class="card-header">
            <h5 class="card-title mb-0">Distribution</h5>
          </div>
          <div class="card-body">
            <p class="text-muted">Save your survey to get a shareable link and distribution options.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSurveyStore } from '@/store/survey'
import SurveyFormBuilder from '@/components/survey/SurveyFormBuilder.vue'

export default {
  name: 'SurveyCreateView',
  components: {
    SurveyFormBuilder
  },
  setup() {
    const router = useRouter()
    const surveyStore = useSurveyStore()
    const formBuilder = ref(null)
    const isSaving = ref(false)

    // Initialize an empty survey
    const survey = reactive({
      title: 'Untitled Survey',
      description: '',
      settings: {
        showProgressBar: true,
        allowPrevious: true,
        showStepTitles: true,
        thankYouMessage: 'Thank you for completing our survey!',
        redirectUrl: ''
      },
      steps: []
    })

    // Handle survey updates from the form builder
    const handleSurveyUpdate = (updatedSurvey) => {
      Object.assign(survey, updatedSurvey)
    }

    // Save the survey
    const saveSurvey = async () => {
      if (isSaving.value) return

      isSaving.value = true

      try {
        const savedSurvey = await surveyStore.createSurvey(survey)
        router.push(`/surveys/${savedSurvey.id}/edit`)
      } catch (error) {
        console.error('Failed to save survey:', error)
        // Show error notification
      } finally {
        isSaving.value = false
      }
    }

    return {
      survey,
      formBuilder,
      isSaving,
      handleSurveyUpdate,
      saveSurvey
    }
  }
}
</script>
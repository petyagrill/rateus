<template>
  <div class="response-details-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <router-link to="/responses" class="btn btn-sm btn-link me-2 p-0">
          <i class="bi bi-arrow-left"></i>
        </router-link>
        <h1 class="h3 mb-0">Response #{{ responseId }}</h1>
      </div>
      <div class="d-flex">
        <div class="dropdown me-2">
          <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-gear me-1"></i> Actions
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item" @click="printResponse">
                <i class="bi bi-printer me-2"></i> Print
              </button>
            </li>
            <li>
              <button class="dropdown-item" @click="exportResponse('pdf')">
                <i class="bi bi-file-pdf me-2"></i> Export as PDF
              </button>
            </li>
            <li>
              <button class="dropdown-item" @click="exportResponse('csv')">
                <i class="bi bi-file-spreadsheet me-2"></i> Export as CSV
              </button>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <button class="dropdown-item text-danger" @click="deleteResponse">
                <i class="bi bi-trash me-2"></i> Delete Response
              </button>
            </li>
          </ul>
        </div>

        <button
          v-if="prevResponseId"
          @click="navigateToResponse(prevResponseId)"
          class="btn btn-outline-secondary me-2"
          title="Previous Response"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <button
          v-if="nextResponseId"
          @click="navigateToResponse(nextResponseId)"
          class="btn btn-outline-secondary"
          title="Next Response"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading response details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">
      <h4 class="alert-heading">Error Loading Response</h4>
      <p>{{ error }}</p>
      <button @click="fetchResponseDetails" class="btn btn-sm btn-outline-danger">
        <i class="bi bi-arrow-clockwise me-1"></i> Retry
      </button>
    </div>

    <!-- Response data -->
    <div v-else class="row g-4">
      <!-- Main content - Left column -->
      <div class="col-lg-8">
        <!-- Survey overview -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Survey Overview</h5>
          </div>
          <div class="card-body">
            <ResponseSurveyInfo :response="response" />
          </div>
        </div>

        <!-- Response answers -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Response Answers</h5>
            <div class="btn-group btn-group-sm">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="toggleAllSteps"
              >
                {{ allStepsExpanded ? 'Collapse All' : 'Expand All' }}
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <ResponseAnswers
              :response="response"
              :expanded-steps="expandedSteps"
              @toggle-step="toggleStep"
            />
          </div>
        </div>
      </div>

      <!-- Sidebar - Right column -->
      <div class="col-lg-4">
        <!-- Response metadata -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Response Details</h5>
          </div>
          <div class="card-body">
            <ResponseMetadata :response="response" />
          </div>
        </div>

        <!-- NPS score card (if applicable) -->
        <div v-if="hasNpsScore" class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">NPS Score</h5>
          </div>
          <div class="card-body">
            <ResponseNpsScore :nps-score="response.nps_score" :nps-comment="response.nps_comment" />
          </div>
        </div>

        <!-- User info card -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Respondent</h5>
          </div>
          <div class="card-body">
            <ResponseUserInfo :response="response" />
          </div>
        </div>

        <!-- Tags card -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Tags</h5>
            <button class="btn btn-sm btn-link p-0" @click="addTag">
              <i class="bi bi-plus-circle"></i>
            </button>
          </div>
          <div class="card-body">
            <ResponseTags
              :tags="response.tags"
              @add-tag="addTag"
              @remove-tag="removeTag"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResponseStore } from '@/store/response'
import { toast } from 'vue3-toastify'

// Import sub-components
import ResponseSurveyInfo from '@/components/responses/ResponseSurveyInfo.vue'
import ResponseAnswers from '@/components/responses/ResponseAnswers.vue'
import ResponseMetadata from '@/components/responses/ResponseMetadata.vue'
import ResponseNpsScore from '@/components/responses/ResponseNpsScore.vue'
import ResponseUserInfo from '@/components/responses/ResponseUserInfo.vue'
import ResponseTags from '@/components/responses/ResponseTags.vue'

export default {
  name: 'ResponseDetailsView',
  components: {
    ResponseSurveyInfo,
    ResponseAnswers,
    ResponseMetadata,
    ResponseNpsScore,
    ResponseUserInfo,
    ResponseTags
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const responseStore = useResponseStore()

    const responseId = computed(() => route.params.id)
    const isLoading = ref(true)
    const error = ref(null)
    const response = ref({})

    // Step expansion state
    const expandedSteps = ref([])
    const allStepsExpanded = computed(() => {
      if (!response.value.steps || response.value.steps.length === 0) return false
      return expandedSteps.value.length === response.value.steps.length
    })

    // Previous and next response IDs for navigation
    const prevResponseId = ref(null)
    const nextResponseId = ref(null)

    // Check if response has NPS score
    const hasNpsScore = computed(() => {
      return response.value.nps_score !== undefined && response.value.nps_score !== null
    })

    // Fetch response details
    const fetchResponseDetails = async () => {
      isLoading.value = true
      error.value = null

      try {
        // In a real app, this would be an API call
        // const responseData = await responseStore.fetchResponse(responseId.value)

        // Mock data
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        response.value = {
          id: parseInt(responseId.value),
          survey_id: 1,
          survey_title: 'Customer Satisfaction Q1',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          completed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5), // 5 minutes after start
          completion_time: 300, // 5 minutes in seconds
          completion_rate: 100,
          status: 'completed',
          device: 'Desktop',
          browser: 'Chrome',
          os: 'Windows',
          ip_address: '192.168.1.1',
          location: 'New York, US',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          utm_source: 'email',
          utm_medium: 'newsletter',
          utm_campaign: 'spring_promo',
          referrer: 'https://example.com/newsletter',
          nps_score: 9,
          nps_comment: 'Great service, very satisfied with the product quality and customer support.',
          tags: ['important', 'follow-up'],
          respondent: {
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567'
          },
          steps: [
            {
              id: 1,
              title: 'About You',
              questions: [
                {
                  id: 'q1',
                  type: 'text',
                  label: 'What is your name?',
                  answer: 'John Smith'
                },
                {
                  id: 'q2',
                  type: 'email',
                  label: 'What is your email address?',
                  answer: 'john.smith@example.com'
                },
                {
                  id: 'q3',
                  type: 'dropdown',
                  label: 'How long have you been our customer?',
                  answer: '1-3 years'
                }
              ]
            },
            {
              id: 2,
              title: 'Product Experience',
              questions: [
                {
                  id: 'q4',
                  type: 'rating',
                  label: 'How would you rate the quality of our products?',
                  answer: 5,
                  max_value: 5
                },
                {
                  id: 'q5',
                  type: 'textarea',
                  label: 'What do you like most about our products?',
                  answer: 'I love the durability and design. The products are well-made and last for a long time without any issues.'
                },
                {
                  id: 'q6',
                  type: 'textarea',
                  label: 'What improvements would you suggest for our products?',
                  answer: 'It would be nice to have more color options. Also, adding a mobile app for tracking product usage would be helpful.'
                }
              ]
            },
            {
              id: 3,
              title: 'Overall Experience',
              questions: [
                {
                  id: 'q7',
                  type: 'nps',
                  label: 'How likely are you to recommend our company to your friends and colleagues?',
                  answer: 9,
                  comment: 'Great service, very satisfied with the product quality and customer support.'
                },
                {
                  id: 'q8',
                  type: 'checkbox',
                  label: 'Which of our services have you used?',
                  answer: ['Product Support', 'Training', 'Consulting']
                },
                {
                  id: 'q9',
                  type: 'textarea',
                  label: 'Do you have any other comments, questions, or concerns?',
                  answer: 'No additional comments at this time. Thank you for the great service!'
                }
              ]
            }
          ]
        }

        // For demo purposes, set navigation IDs
        prevResponseId.value = parseInt(responseId.value) > 1 ? parseInt(responseId.value) - 1 : null
        nextResponseId.value = parseInt(responseId.value) < 10 ? parseInt(responseId.value) + 1 : null

        // Initialize expanded steps (expand first step by default)
        expandedSteps.value = [response.value.steps[0].id]
      } catch (err) {
        console.error('Failed to fetch response details:', err)
        error.value = 'Failed to load response details. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    // Toggle step expansion
    const toggleStep = (stepId) => {
      const index = expandedSteps.value.indexOf(stepId)
      if (index === -1) {
        expandedSteps.value.push(stepId)
      } else {
        expandedSteps.value.splice(index, 1)
      }
    }

    // Toggle all steps
    const toggleAllSteps = () => {
      if (allStepsExpanded.value) {
        expandedSteps.value = [] // Collapse all
      } else {
        // Expand all
        expandedSteps.value = response.value.steps.map(step => step.id)
      }
    }

    // Navigate to another response
    const navigateToResponse = (id) => {
      router.push(`/responses/${id}`)
    }

    // Print response
    const printResponse = () => {
      window.print()
    }

    // Export response
    const exportResponse = (format) => {
      // In a real app, this would call an API endpoint
      toast.info(`Exporting response as ${format.toUpperCase()}...`)
    }

    // Delete response
    const deleteResponse = async () => {
      if (!confirm(`Are you sure you want to delete response #${responseId.value}? This action cannot be undone.`)) {
        return
      }

      try {
        // In a real app, this would be an API call
        // await responseStore.deleteResponse(responseId.value)

        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

        toast.success('Response deleted successfully')
        router.push('/responses')
      } catch (err) {
        console.error('Failed to delete response:', err)
        toast.error('Failed to delete response. Please try again.')
      }
    }

    // Add tag
    const addTag = () => {
      // In a real app, this would show a modal or prompt
      const newTag = prompt('Enter a new tag:')
      if (newTag && newTag.trim() && !response.value.tags.includes(newTag.trim())) {
        response.value.tags.push(newTag.trim())
        toast.success(`Tag "${newTag.trim()}" added successfully`)
      }
    }

    // Remove tag
    const removeTag = (tag) => {
      const index = response.value.tags.indexOf(tag)
      if (index !== -1) {
        response.value.tags.splice(index, 1)
        toast.success(`Tag "${tag}" removed successfully`)
      }
    }

    // Fetch data on component mount
    onMounted(() => {
      fetchResponseDetails()
    })

    return {
      responseId,
      isLoading,
      error,
      response,
      expandedSteps,
      allStepsExpanded,
      prevResponseId,
      nextResponseId,
      hasNpsScore,
      fetchResponseDetails,
      toggleStep,
      toggleAllSteps,
      navigateToResponse,
      printResponse,
      exportResponse,
      deleteResponse,
      addTag,
      removeTag
    }
  }
}
</script>

<style scoped>
.response-details-view {
  min-height: 100%;
}

@media print {
  .btn, .dropdown {
    display: none !important;
  }

  .card {
    border: none !important;
    box-shadow: none !important;
  }

  .card-header {
    background-color: transparent !important;
    border-bottom: 1px solid #dee2e6 !important;
  }
}
</style>
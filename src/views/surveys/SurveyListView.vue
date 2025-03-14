<template>
  <div class="survey-list-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">My Surveys</h1>
      <router-link to="/surveys/create" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i> Create Survey
      </router-link>
    </div>

    <!-- Filters and search -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search surveys..."
                v-model="searchQuery"
                @input="applyFilters"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="sortBy" @change="applyFilters">
              <option value="updated_at">Recently Updated</option>
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
              <option value="responses_count">Response Count</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="status" @change="applyFilters">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading your surveys...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredSurveys.length === 0" class="text-center py-5">
      <div class="empty-state">
        <i class="bi bi-clipboard-x text-muted fs-1 mb-3"></i>
        <h4>No Surveys Found</h4>
        <p class="text-muted">
          {{
            searchQuery
              ? 'No surveys match your search criteria.'
              : 'You have not created any surveys yet.'
          }}
        </p>
        <router-link to="/surveys/create" class="btn btn-primary mt-3">
          Create Your First Survey
        </router-link>
      </div>
    </div>

    <!-- Surveys list -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      <div v-for="survey in filteredSurveys" :key="survey.id" class="col">
        <div class="card h-100 survey-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title mb-1 text-truncate">{{ survey.title }}</h5>
              <span class="badge" :class="getStatusBadgeClass(survey.status)">
                {{ survey.status }}
              </span>
            </div>
            <p class="card-text text-muted small text-truncate-2 mb-3">
              {{ survey.description || 'No description' }}
            </p>

            <div class="survey-stats d-flex mb-3">
              <div class="me-3">
                <div class="small text-muted">Responses</div>
                <div class="fw-bold">{{ survey.responses_count || 0 }}</div>
              </div>
              <div class="me-3">
                <div class="small text-muted">Created</div>
                <div>{{ formatDate(survey.created_at) }}</div>
              </div>
              <div>
                <div class="small text-muted">Last Updated</div>
                <div>{{ formatDate(survey.updated_at) }}</div>
              </div>
            </div>

            <div class="d-flex survey-actions">
              <router-link
                :to="`/surveys/${survey.id}/edit`"
                class="btn btn-sm btn-outline-primary me-2"
              >
                <i class="bi bi-pencil me-1"></i> Edit
              </router-link>
              <a
                :href="`/s/${survey.id}`"
                target="_blank"
                class="btn btn-sm btn-outline-secondary me-2"
              >
                <i class="bi bi-eye me-1"></i> Preview
              </a>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="deleteSurvey(survey)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-between align-items-center">
              <button
                class="btn btn-sm btn-link p-0"
                @click="toggleSurveyStatus(survey)"
              >
                {{ survey.status === 'active' ? 'Close' : 'Activate' }}
              </button>

              <div class="dropdown">
                <button
                  class="btn btn-sm btn-link p-0 dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Share
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="copySurveyLink(survey)">
                      <i class="bi bi-link-45deg me-2"></i> Copy Link
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="generateQRCode(survey)">
                      <i class="bi bi-qr-code me-2"></i> QR Code
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="sendViaEmail(survey)">
                      <i class="bi bi-envelope me-2"></i> Email
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals would go here (QR code, email sharing, etc.) -->
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSurveyStore } from '@/store/survey'
import { toast } from 'vue3-toastify'

export default {
  name: 'SurveyListView',
  setup() {
    const surveyStore = useSurveyStore()
    const isLoading = ref(true)
    const searchQuery = ref('')
    const sortBy = ref('updated_at')
    const status = ref('all')

    // Fetch surveys when the component is mounted
    onMounted(async () => {
      try {
        await surveyStore.fetchSurveys()
      } catch (error) {
        console.error('Failed to fetch surveys:', error)
        toast.error('Failed to load surveys. Please try again.')
      } finally {
        isLoading.value = false
      }
    })

    // Filter and sort surveys based on the filters
    const filteredSurveys = computed(() => {
      let result = [...surveyStore.surveys]

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(survey =>
          survey.title.toLowerCase().includes(query) ||
          (survey.description && survey.description.toLowerCase().includes(query))
        )
      }

      // Filter by status
      if (status.value !== 'all') {
        result = result.filter(survey => survey.status === status.value)
      }

      // Sort surveys
      result.sort((a, b) => {
        if (sortBy.value === 'title') {
          return a.title.localeCompare(b.title)
        } else if (sortBy.value === 'responses_count') {
          return (b.responses_count || 0) - (a.responses_count || 0)
        } else {
          // Default to date sorting (created_at or updated_at)
          return new Date(b[sortBy.value]) - new Date(a[sortBy.value])
        }
      })

      return result
    })

    // Apply filters (called when search query, sort order, or status changes)
    const applyFilters = () => {
      // No need to do anything, filteredSurveys is a computed property
      // that recalculates automatically when dependencies change
    }

    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    // Get the appropriate CSS class for a status badge
    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'active':
          return 'bg-success'
        case 'draft':
          return 'bg-secondary'
        case 'closed':
          return 'bg-danger'
        default:
          return 'bg-primary'
      }
    }

    // Delete a survey
    const deleteSurvey = async (survey) => {
      if (!confirm(`Are you sure you want to delete the survey "${survey.title}"? This action cannot be undone.`)) {
        return
      }

      try {
        await surveyStore.deleteSurvey(survey.id)
        toast.success('Survey deleted successfully.')
      } catch (error) {
        console.error('Failed to delete survey:', error)
        toast.error('Failed to delete survey. Please try again.')
      }
    }

    // Toggle survey status between active and closed
    const toggleSurveyStatus = async (survey) => {
      const newStatus = survey.status === 'active' ? 'closed' : 'active'
      const action = newStatus === 'active' ? 'activate' : 'close'

      try {
        await surveyStore.updateSurvey(survey.id, {
          ...survey,
          status: newStatus
        })
        toast.success(`Survey ${action}d successfully.`)
      } catch (error) {
        console.error(`Failed to ${action} survey:`, error)
        toast.error(`Failed to ${action} survey. Please try again.`)
      }
    }

    // Copy survey link to clipboard
    const copySurveyLink = (survey) => {
      const surveyUrl = `${window.location.origin}/s/${survey.id}`
      navigator.clipboard.writeText(surveyUrl)
        .then(() => {
          toast.success('Survey link copied to clipboard!')
        })
        .catch(err => {
          console.error('Failed to copy survey link:', err)
          toast.error('Failed to copy link. Please try again.')
        })
    }

    // Generate QR code for a survey (would show a modal)
    const generateQRCode = (survey) => {
      // In a real implementation, this would show a modal with a QR code
      console.log('Generate QR code for survey:', survey.id)
    }

    // Send survey via email (would show a modal)
    const sendViaEmail = (survey) => {
      // In a real implementation, this would show a modal with email options
      console.log('Send survey via email:', survey.id)
    }

    return {
      isLoading,
      searchQuery,
      sortBy,
      status,
      filteredSurveys,
      applyFilters,
      formatDate,
      getStatusBadgeClass,
      deleteSurvey,
      toggleSurveyStatus,
      copySurveyLink,
      generateQRCode,
      sendViaEmail
    }
  }
}
</script>

<style scoped>
.survey-card {
  transition: all 0.3s ease;
}

.survey-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 3em;
}

.survey-stats {
  font-size: 0.875rem;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
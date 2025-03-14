<template>
  <div class="responses-list-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Survey Responses</h1>
      <div class="d-flex">
        <button class="btn btn-outline-secondary me-2" @click="exportResponses">
          <i class="bi bi-download me-1"></i> Export
        </button>
      </div>
    </div>

    <!-- Filters and search -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                placeholder="Search responses..."
                v-model="filters.search"
                @input="applyFilters"
              >
            </div>
          </div>

          <div class="col-md-3">
            <select class="form-select" v-model="filters.surveyId" @change="applyFilters">
              <option value="all">All Surveys</option>
              <option v-for="survey in surveys" :key="survey.id" :value="survey.id">
                {{ survey.title }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <select class="form-select" v-model="filters.dateRange" @change="applyFilters">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div class="col-md-2">
            <select class="form-select" v-model="filters.sortBy" @change="applyFilters">
              <option value="created_at:desc">Newest First</option>
              <option value="created_at:asc">Oldest First</option>
              <option value="nps:desc">NPS (High to Low)</option>
              <option value="nps:asc">NPS (Low to High)</option>
            </select>
          </div>
        </div>

        <!-- Date range picker (shown when custom is selected) -->
        <div v-if="filters.dateRange === 'custom'" class="row mt-3 g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">From</span>
              <input
                type="date"
                class="form-control"
                v-model="filters.dateFrom"
                @change="applyFilters"
              >
            </div>
          </div>
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">To</span>
              <input
                type="date"
                class="form-control"
                v-model="filters.dateTo"
                @change="applyFilters"
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading responses...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="responses.length === 0" class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-inbox text-muted fs-1 mb-3"></i>
        <h4>No Responses Found</h4>
        <p class="text-muted">
          {{ hasFilters ? 'No responses match your search criteria. Try adjusting your filters.' : 'You have not received any survey responses yet.' }}
        </p>
      </div>
    </div>

    <!-- Responses table -->
    <div v-else class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <span class="fw-medium">{{ totalResponses }}</span> responses found
        </div>
        <div>
          <div class="btn-group btn-group-sm">
            <button
              class="btn"
              :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'"
              @click="viewMode = 'table'"
              title="Table View"
            >
              <i class="bi bi-table"></i>
            </button>
            <button
              class="btn"
              :class="viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'"
              @click="viewMode = 'card'"
              title="Card View"
            >
              <i class="bi bi-grid-3x3-gap"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Table view -->
      <div v-if="viewMode === 'table'" class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Survey</th>
              <th>Date</th>
              <th>Status</th>
              <th>NPS</th>
              <th>Completion Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="response in responses" :key="response.id">
              <td>{{ response.id }}</td>
              <td>
                <router-link :to="`/surveys/${response.survey_id}`" class="text-decoration-none">
                  {{ response.survey_title }}
                </router-link>
              </td>
              <td>{{ formatDate(response.created_at) }}</td>
              <td>
                <span
                  class="badge"
                  :class="response.completed ? 'bg-success' : 'bg-warning text-dark'"
                >
                  {{ response.completed ? 'Completed' : 'Partial' }}
                </span>
              </td>
              <td>
                <span
                  v-if="response.nps !== null"
                  class="badge"
                  :class="getNpsClass(response.nps)"
                >
                  {{ response.nps }}
                </span>
                <span v-else>—</span>
              </td>
              <td>{{ formatDuration(response.completion_time) }}</td>
              <td>
                <div class="btn-group btn-group-sm">
                  <router-link :to="`/responses/${response.id}`" class="btn btn-outline-primary" title="View Details">
                    <i class="bi bi-eye"></i>
                  </router-link>
                  <button class="btn btn-outline-danger" @click="deleteResponse(response)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card view -->
      <div v-else class="card-body p-3">
        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          <div v-for="response in responses" :key="response.id" class="col">
            <div class="card h-100 response-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 class="card-title mb-1">Response #{{ response.id }}</h6>
                    <div class="text-muted small">{{ formatDate(response.created_at) }}</div>
                  </div>
                  <span
                    class="badge"
                    :class="response.completed ? 'bg-success' : 'bg-warning text-dark'"
                  >
                    {{ response.completed ? 'Completed' : 'Partial' }}
                  </span>
                </div>

                <div class="mb-3">
                  <div class="text-muted small">Survey</div>
                  <div>{{ response.survey_title }}</div>
                </div>

                <div class="d-flex mb-3">
                  <div class="me-4">
                    <div class="text-muted small">NPS</div>
                    <span
                      v-if="response.nps !== null"
                      class="badge"
                      :class="getNpsClass(response.nps)"
                    >
                      {{ response.nps }}
                    </span>
                    <span v-else>—</span>
                  </div>
                  <div>
                    <div class="text-muted small">Completion Time</div>
                    <div>{{ formatDuration(response.completion_time) }}</div>
                  </div>
                </div>

                <div v-if="response.highlight" class="mb-3">
                  <div class="text-muted small">Highlight</div>
                  <div class="text-truncate-2">{{ response.highlight }}</div>
                </div>
              </div>
              <div class="card-footer bg-transparent border-top">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted small">
                    <i class="bi bi-device-ssd me-1"></i>
                    {{ response.device }}
                  </span>
                  <div class="btn-group btn-group-sm">
                    <router-link :to="`/responses/${response.id}`" class="btn btn-outline-primary" title="View Details">
                      <i class="bi bi-eye me-1"></i> View
                    </router-link>
                    <button class="btn btn-outline-danger" @click="deleteResponse(response)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <select
            class="form-select form-select-sm me-2"
            style="width: auto;"
            v-model="pagination.perPage"
            @change="changePage(1)"
          >
            <option :value="10">10 per page</option>
            <option :value="25">25 per page</option>
            <option :value="50">50 per page</option>
            <option :value="100">100 per page</option>
          </select>
          <span class="text-muted small">
            Showing {{ paginationInfo.from }}-{{ paginationInfo.to }} of {{ totalResponses }} responses
          </span>
        </div>

        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
              <button class="page-link" @click="changePage(1)" aria-label="First">
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
              <button class="page-link" @click="changePage(pagination.currentPage - 1)" aria-label="Previous">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li v-for="page in pagination.visiblePages" :key="page" class="page-item" :class="{ active: pagination.currentPage === page }">
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
              <button class="page-link" @click="changePage(pagination.currentPage + 1)" aria-label="Next">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
              <button class="page-link" @click="changePage(pagination.totalPages)" aria-label="Last">
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useResponseStore } from '@/store/response'
import { useSurveyStore } from '@/store/survey'
import { toast } from 'vue3-toastify'

export default {
  name: 'ResponseListView',
  setup() {
    const responseStore = useResponseStore()
    const surveyStore = useSurveyStore()

    const isLoading = ref(true)
    const viewMode = ref('table')

    // Filters
    const filters = ref({
      search: '',
      surveyId: 'all',
      dateRange: 'all',
      dateFrom: null,
      dateTo: null,
      sortBy: 'created_at:desc'
    })

    // Pagination
    const pagination = ref({
      currentPage: 1,
      totalPages: 1,
      perPage: 10,
      visiblePages: [1]
    })

    // Computed property to check if filters are applied
    const hasFilters = computed(() => {
      return filters.value.search.trim() !== '' ||
        filters.value.surveyId !== 'all' ||
        filters.value.dateRange !== 'all'
    })

    // Pagination info
    const paginationInfo = computed(() => {
      const from = (pagination.value.currentPage - 1) * pagination.value.perPage + 1
      const to = Math.min(from + pagination.value.perPage - 1, totalResponses.value)
      return { from, to }
    })

    // Total responses
    const totalResponses = ref(0)

    // Survey list for filter dropdown
    const surveys = ref([
      { id: 1, title: 'Customer Satisfaction Q1' },
      { id: 2, title: 'Product Feedback Survey' },
      { id: 3, title: 'Website UX Evaluation' }
    ])

    // Mock responses data
    const responses = ref([])

    // Fetch responses data
    const fetchResponses = async () => {
      isLoading.value = true

      try {
        // In a real application, this would be an API call
        // await responseStore.fetchResponses({
        //   page: pagination.value.currentPage,
        //   per_page: pagination.value.perPage,
        //   ...filters.value
        // })

        // Mock data
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        // Generate mock responses
        let mockResponses = []
        const totalItems = 152
        const itemsPerPage = pagination.value.perPage
        const startIndex = (pagination.value.currentPage - 1) * itemsPerPage
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

        for (let i = startIndex; i < endIndex; i++) {
          const id = i + 1
          const isSurvey1 = id % 3 === 0
          const isSurvey2 = id % 3 === 1
          const isSurvey3 = id % 3 === 2
          const surveyId = isSurvey1 ? 1 : isSurvey2 ? 2 : 3
          const surveyTitle = isSurvey1 ? 'Customer Satisfaction Q1' :
                             isSurvey2 ? 'Product Feedback Survey' :
                             'Website UX Evaluation'

          const nps = id % 17 === 0 ? null : Math.floor(Math.random() * 11)

          // Skip if survey filter is applied
          if (filters.value.surveyId !== 'all' && parseInt(filters.value.surveyId) !== surveyId) {
            continue
          }

          mockResponses.push({
            id,
            survey_id: surveyId,
            survey_title: surveyTitle,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * (id % 30)),
            completed: id % 7 !== 0,
            nps,
            completion_time: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
            device: ['Desktop', 'Mobile', 'Tablet'][id % 3],
            highlight: id % 5 === 0 ? 'Great service, very satisfied with the product quality and customer support.' : null
          })
        }

        // Apply search filter if needed
        if (filters.value.search) {
          const searchTerm = filters.value.search.toLowerCase()
          mockResponses = mockResponses.filter(response =>
            response.survey_title.toLowerCase().includes(searchTerm) ||
            response.id.toString().includes(searchTerm) ||
            (response.highlight && response.highlight.toLowerCase().includes(searchTerm))
          )
        }

        // Update responses and pagination
        responses.value = mockResponses
        totalResponses.value = filters.value.surveyId !== 'all' ? Math.floor(totalItems / 3) : totalItems
        pagination.value.totalPages = Math.ceil(totalResponses.value / pagination.value.perPage)
        updateVisiblePages()
      } catch (error) {
        console.error('Failed to fetch responses:', error)
        toast.error('Failed to load responses. Please try again.')
      } finally {
        isLoading.value = false
      }
    }

    // Update visible pages for pagination
    const updateVisiblePages = () => {
      const totalPages = pagination.value.totalPages
      const currentPage = pagination.value.currentPage

      if (totalPages <= 7) {
        // Show all pages if there are 7 or fewer
        pagination.value.visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1)
      } else {
        // Show a window of pages around the current page
        let startPage = Math.max(1, currentPage - 2)
        let endPage = Math.min(totalPages, startPage + 4)

        // Adjust window if at the end
        if (endPage === totalPages) {
          startPage = Math.max(1, endPage - 4)
        }

        pagination.value.visiblePages = Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        )
      }
    }

    // Change page
    const changePage = (page) => {
      if (page < 1 || page > pagination.value.totalPages) return

      pagination.value.currentPage = page
      fetchResponses()
    }

    // Apply filters
    const applyFilters = () => {
      pagination.value.currentPage = 1
      fetchResponses()
    }

    // Delete response
    const deleteResponse = async (response) => {
      if (!confirm(`Are you sure you want to delete response #${response.id}? This cannot be undone.`)) {
        return
      }

      try {
        // In a real application, this would be an API call
        // await responseStore.deleteResponse(response.id)

        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        responses.value = responses.value.filter(r => r.id !== response.id)
        totalResponses.value--

        toast.success('Response deleted successfully')
      } catch (error) {
        console.error('Failed to delete response:', error)
        toast.error('Failed to delete response. Please try again.')
      }
    }

    // Export responses
    const exportResponses = () => {
      const format = 'csv' // Could add an option for the format

      // In a real application, this would call an API endpoint
      // responseStore.exportResponses(filters.value.surveyId, format)

      // Mock export
      alert('Export functionality would download a CSV/Excel file with the current filtered responses.')
    }

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // Get NPS score badge class
    const getNpsClass = (score) => {
      if (score >= 9) return 'bg-success'
      if (score >= 7) return 'bg-primary'
      if (score >= 4) return 'bg-warning text-dark'
      return 'bg-danger'
    }

    // Fetch surveys and responses on component mount
    onMounted(async () => {
      try {
        // In a real application, this would fetch surveys from the store
        // await surveyStore.fetchSurveys()
        // surveys.value = surveyStore.surveys

        // Fetch responses
        await fetchResponses()
      } catch (error) {
        console.error('Error initializing response list:', error)
      }
    })

    return {
      isLoading,
      responses,
      totalResponses,
      surveys,
      filters,
      pagination,
      paginationInfo,
      viewMode,
      hasFilters,
      fetchResponses,
      changePage,
      applyFilters,
      deleteResponse,
      exportResponses,
      formatDate,
      formatDuration,
      getNpsClass
    }
  }
}
</script>

<style scoped>
.responses-list-view {
  min-height: 100%;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 3em;
}

.response-card {
  transition: all 0.2s ease;
}

.response-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}
</style>
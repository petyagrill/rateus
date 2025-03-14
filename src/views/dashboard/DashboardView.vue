<template>
  <div class="dashboard-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Dashboard</h1>
      <div>
        <button
          class="btn btn-outline-secondary me-2"
          @click="refreshData"
          :disabled="isLoading"
        >
          <i class="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
        <router-link to="/surveys/create" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i> New Survey
        </router-link>
      </div>
    </div>

    <!-- Overview metrics -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-subtitle text-muted mb-1">Total Surveys</h6>
            <div class="d-flex align-items-center">
              <h2 class="card-title mb-0">{{ metrics.totalSurveys }}</h2>
              <span
                v-if="metrics.surveyChange !== null"
                class="ms-2 badge"
                :class="metrics.surveyChange >= 0 ? 'bg-success' : 'bg-danger'"
              >
                <i
                  class="bi"
                  :class="metrics.surveyChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"
                ></i>
                {{ Math.abs(metrics.surveyChange) }}%
              </span>
            </div>
            <small class="text-muted">vs previous period</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-subtitle text-muted mb-1">Total Responses</h6>
            <div class="d-flex align-items-center">
              <h2 class="card-title mb-0">{{ metrics.totalResponses }}</h2>
              <span
                v-if="metrics.responseChange !== null"
                class="ms-2 badge"
                :class="metrics.responseChange >= 0 ? 'bg-success' : 'bg-danger'"
              >
                <i
                  class="bi"
                  :class="metrics.responseChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"
                ></i>
                {{ Math.abs(metrics.responseChange) }}%
              </span>
            </div>
            <small class="text-muted">vs previous period</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-subtitle text-muted mb-1">Average NPS</h6>
            <div class="d-flex align-items-center">
              <h2 class="card-title mb-0">{{ metrics.avgNPS }}</h2>
              <span
                v-if="metrics.npsChange !== null"
                class="ms-2 badge"
                :class="metrics.npsChange >= 0 ? 'bg-success' : 'bg-danger'"
              >
                <i
                  class="bi"
                  :class="metrics.npsChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"
                ></i>
                {{ Math.abs(metrics.npsChange) }}
              </span>
            </div>
            <small class="text-muted">vs previous period</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card h-100">
          <div class="card-body">
            <h6 class="card-subtitle text-muted mb-1">Completion Rate</h6>
            <div class="d-flex align-items-center">
              <h2 class="card-title mb-0">{{ metrics.completionRate }}%</h2>
              <span
                v-if="metrics.completionChange !== null"
                class="ms-2 badge"
                :class="metrics.completionChange >= 0 ? 'bg-success' : 'bg-danger'"
              >
                <i
                  class="bi"
                  :class="metrics.completionChange >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'"
                ></i>
                {{ Math.abs(metrics.completionChange) }}%
              </span>
            </div>
            <small class="text-muted">vs previous period</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Main dashboard content -->
    <div class="row g-4">
      <!-- Activity and response trend - Left column -->
      <div class="col-lg-8">
        <!-- Response trend chart -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Response Trend</h5>
            <div class="btn-group">
              <button
                v-for="period in ['7d', '30d', '90d']"
                :key="period"
                class="btn btn-sm"
                :class="chartPeriod === period ? 'btn-primary' : 'btn-outline-primary'"
                @click="chartPeriod = period"
              >
                {{ period === '7d' ? 'Week' : period === '30d' ? 'Month' : 'Quarter' }}
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else class="response-chart" style="height: 300px;">
              <!-- Line chart would go here -->
              <ResponseTrendChart :data="chartData" />
            </div>
          </div>
        </div>

        <!-- Recent responses -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Recent Responses</h5>
            <router-link to="/responses" class="btn btn-sm btn-link">
              View All
            </router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="recentResponses.length === 0" class="text-center py-4">
              <p class="text-muted mb-0">No responses yet</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Survey</th>
                    <th>Date</th>
                    <th>NPS</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="response in recentResponses" :key="response.id">
                    <td>
                      <router-link :to="`/surveys/${response.survey_id}`" class="text-decoration-none">
                        {{ response.survey_title }}
                      </router-link>
                    </td>
                    <td>{{ formatDate(response.created_at) }}</td>
                    <td>
                      <span
                        v-if="response.nps !== null"
                        class="badge"
                        :class="getNPSClass(response.nps)"
                      >
                        {{ response.nps }}
                      </span>
                      <span v-else>—</span>
                    </td>
                    <td>
                      <router-link :to="`/responses/${response.id}`" class="btn btn-sm btn-link">
                        View Details
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Surveys and analytics - Right column -->
      <div class="col-lg-4">
        <!-- NPS Breakdown -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">NPS Breakdown</h5>
          </div>
          <div class="card-body">
            <div v-if="isLoading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <div class="d-flex justify-content-between mb-2">
                <div>
                  <div class="small fw-bold">Promoters</div>
                  <div class="small text-muted">(Score 9-10)</div>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-success">{{ npsBreakdown.promoters }}%</div>
                  <div class="small text-muted">{{ npsBreakdown.promotersCount }} responses</div>
                </div>
              </div>
              <div class="progress mb-3" style="height: 10px;">
                <div
                  class="progress-bar bg-success"
                  :style="{ width: npsBreakdown.promoters + '%' }"
                ></div>
              </div>

              <div class="d-flex justify-content-between mb-2">
                <div>
                  <div class="small fw-bold">Passives</div>
                  <div class="small text-muted">(Score 7-8)</div>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-warning">{{ npsBreakdown.passives }}%</div>
                  <div class="small text-muted">{{ npsBreakdown.passivesCount }} responses</div>
                </div>
              </div>
              <div class="progress mb-3" style="height: 10px;">
                <div
                  class="progress-bar bg-warning"
                  :style="{ width: npsBreakdown.passives + '%' }"
                ></div>
              </div>

              <div class="d-flex justify-content-between mb-2">
                <div>
                  <div class="small fw-bold">Detractors</div>
                  <div class="small text-muted">(Score 0-6)</div>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-danger">{{ npsBreakdown.detractors }}%</div>
                  <div class="small text-muted">{{ npsBreakdown.detractorsCount }} responses</div>
                </div>
              </div>
              <div class="progress mb-4" style="height: 10px;">
                <div
                  class="progress-bar bg-danger"
                  :style="{ width: npsBreakdown.detractors + '%' }"
                ></div>
              </div>

              <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <div>
                  <div class="h6 mb-0">NPS Score</div>
                  <div class="small text-muted">Promoters - Detractors</div>
                </div>
                <div class="h3 mb-0">{{ npsBreakdown.npsScore }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Surveys -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Top Surveys</h5>
            <router-link to="/surveys" class="btn btn-sm btn-link">
              View All
            </router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="topSurveys.length === 0" class="text-center py-4">
              <p class="text-muted mb-0">No surveys found</p>
            </div>
            <div v-else class="list-group list-group-flush">
              <router-link
                v-for="survey in topSurveys"
                :key="survey.id"
                :to="`/surveys/${survey.id}`"
                class="list-group-item list-group-item-action"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-medium">{{ survey.title }}</div>
                    <div class="small text-muted">
                      {{ survey.responses_count }} responses · {{ formatDate(survey.updated_at) }}
                    </div>
                  </div>
                  <span class="badge rounded-pill" :class="getNPSClass(survey.nps_score)">
                    {{ survey.nps_score !== null ? survey.nps_score : '—' }}
                  </span>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ResponseTrendChart from '@/components/analytics/ResponseTrendChart.vue'

export default {
  name: 'DashboardView',
  components: {
    ResponseTrendChart
  },
  setup() {
    const isLoading = ref(true)
    const chartPeriod = ref('30d')

    // Mock data for the dashboard
    const metrics = ref({
      totalSurveys: 0,
      surveyChange: null,
      totalResponses: 0,
      responseChange: null,
      avgNPS: 0,
      npsChange: null,
      completionRate: 0,
      completionChange: null
    })

    const recentResponses = ref([])
    const topSurveys = ref([])

    const npsBreakdown = ref({
      promoters: 0,
      promotersCount: 0,
      passives: 0,
      passivesCount: 0,
      detractors: 0,
      detractorsCount: 0,
      npsScore: 0
    })

    const chartData = ref([])

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      isLoading.value = true

      try {
        // In a real application, these would be API calls
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

        // Mock data
        metrics.value = {
          totalSurveys: 12,
          surveyChange: 20,
          totalResponses: 342,
          responseChange: 15,
          avgNPS: 36,
          npsChange: -2,
          completionRate: 83,
          completionChange: 5
        }

        recentResponses.value = [
          { id: 1, survey_id: 1, survey_title: 'Customer Satisfaction Q1', created_at: '2023-04-01T10:30:00', nps: 8 },
          { id: 2, survey_id: 2, survey_title: 'Product Feedback Survey', created_at: '2023-03-29T14:15:00', nps: 9 },
          { id: 3, survey_id: 1, survey_title: 'Customer Satisfaction Q1', created_at: '2023-03-28T09:45:00', nps: 4 },
          { id: 4, survey_id: 3, survey_title: 'Website UX Evaluation', created_at: '2023-03-27T11:20:00', nps: 7 },
          { id: 5, survey_id: 1, survey_title: 'Customer Satisfaction Q1', created_at: '2023-03-26T16:05:00', nps: 10 }
        ]

        topSurveys.value = [
          { id: 1, title: 'Customer Satisfaction Q1', responses_count: 156, updated_at: '2023-03-30T15:00:00', nps_score: 42 },
          { id: 2, title: 'Product Feedback Survey', responses_count: 87, updated_at: '2023-03-25T11:30:00', nps_score: 35 },
          { id: 3, title: 'Website UX Evaluation', responses_count: 64, updated_at: '2023-03-20T09:45:00', nps_score: 28 },
          { id: 4, title: 'Employee Satisfaction', responses_count: 35, updated_at: '2023-03-15T14:20:00', nps_score: 18 }
        ]

        npsBreakdown.value = {
          promoters: 42,
          promotersCount: 144,
          passives: 28,
          passivesCount: 96,
          detractors: 30,
          detractorsCount: 102,
          npsScore: 12
        }

        generateChartData()
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Generate chart data based on selected period
    const generateChartData = () => {
      const days = chartPeriod.value === '7d' ? 7 : chartPeriod.value === '30d' ? 30 : 90
      const data = []

      const now = new Date()
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        // Generate random response count between 5-20
        const count = Math.floor(Math.random() * 15) + 5

        data.push({
          date: date.toISOString().split('T')[0],
          count
        })
      }

      chartData.value = data
    }

    // Refresh dashboard data
    const refreshData = () => {
      fetchDashboardData()
    }

    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }

    // Get badge class for NPS score
    const getNPSClass = (score) => {
      if (score === null) return 'bg-secondary'

      if (score >= 50) return 'bg-success'
      if (score >= 0) return 'bg-primary'
      if (score >= -50) return 'bg-warning text-dark'
      return 'bg-danger'
    }

    // Watch for changes in chart period
    const watchChartPeriod = computed(() => {
      chartPeriod.value
      generateChartData()
      return chartPeriod.value
    })

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      isLoading,
      metrics,
      recentResponses,
      topSurveys,
      npsBreakdown,
      chartData,
      chartPeriod,
      refreshData,
      formatDate,
      getNPSClass,
      watchChartPeriod
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  min-height: 100%;
}
</style>
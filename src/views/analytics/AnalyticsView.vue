<template>
  <div class="analytics-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Analytics</h1>
      <div class="d-flex">
        <div class="input-group me-2">
          <label class="input-group-text" for="surveySelect">Survey</label>
          <select class="form-select" id="surveySelect" v-model="selectedSurveyId" @change="fetchAnalytics">
            <option value="all">All Surveys</option>
            <option v-for="survey in surveys" :key="survey.id" :value="survey.id">
              {{ survey.title }}
            </option>
          </select>
        </div>
        <div class="input-group me-2">
          <label class="input-group-text" for="periodSelect">Period</label>
          <select class="form-select" id="periodSelect" v-model="selectedPeriod" @change="fetchAnalytics">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <button
          class="btn btn-outline-secondary"
          @click="downloadReport"
          :disabled="isLoading"
        >
          <i class="bi bi-download me-1"></i> Export
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading analytics data...</p>
    </div>

    <!-- Analytics content -->
    <div v-else>
      <!-- Overview metrics -->
      <div class="row g-4 mb-4">
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

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-subtitle text-muted mb-1">Average Time to Complete</h6>
              <div class="d-flex align-items-center">
                <h2 class="card-title mb-0">{{ formatDuration(metrics.avgTime) }}</h2>
                <span
                  v-if="metrics.timeChange !== null"
                  class="ms-2 badge"
                  :class="metrics.timeChange <= 0 ? 'bg-success' : 'bg-danger'"
                >
                  <i
                    class="bi"
                    :class="metrics.timeChange <= 0 ? 'bi-arrow-down' : 'bi-arrow-up'"
                  ></i>
                  {{ Math.abs(metrics.timeChange) }}%
                </span>
              </div>
              <small class="text-muted">vs previous period</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Main charts - first row -->
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <!-- Response Trend Chart -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Response Trend</h5>
              <div class="btn-group">
                <button
                  v-for="view in ['day', 'week', 'month']"
                  :key="view"
                  class="btn btn-sm"
                  :class="trendGrouping === view ? 'btn-primary' : 'btn-outline-primary'"
                  @click="trendGrouping = view"
                >
                  {{ view.charAt(0).toUpperCase() + view.slice(1) }}
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="response-chart" style="height: 300px;">
                <ResponseTrendChart :data="responseTrendData" />
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <!-- NPS Breakdown -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">NPS Breakdown</h5>
            </div>
            <div class="card-body">
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
      </div>

      <!-- Main charts - second row -->
      <div class="row g-4 mb-4">
        <div class="col-lg-6">
          <!-- Response by Channel -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Responses by Channel</h5>
            </div>
            <div class="card-body">
              <div style="height: 300px;">
                <!-- Channel distribution chart would go here -->
                <div class="d-flex justify-content-center align-items-center h-100">
                  <div class="text-center text-muted">
                    <i class="bi bi-pie-chart fs-1 mb-3"></i>
                    <p>Pie chart showing response distribution by channel (Email, QR code, Link, etc.)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <!-- Response by Device -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Responses by Device</h5>
            </div>
            <div class="card-body">
              <div style="height: 300px;">
                <!-- Device distribution chart would go here -->
                <div class="d-flex justify-content-center align-items-center h-100">
                  <div class="text-center text-muted">
                    <i class="bi bi-bar-chart fs-1 mb-3"></i>
                    <p>Bar chart showing response distribution by device (Desktop, Mobile, Tablet)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Question-specific analytics -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Question Analytics</h5>
          <div class="input-group" style="width: auto;">
            <label class="input-group-text" for="questionSelect">Question</label>
            <select class="form-select" id="questionSelect" v-model="selectedQuestionId" @change="fetchQuestionAnalytics">
              <option value="">Select a question</option>
              <option v-for="question in questions" :key="question.id" :value="question.id">
                {{ truncateText(question.label, 50) }}
              </option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div v-if="!selectedQuestionId" class="text-center py-5 text-muted">
            <i class="bi bi-bar-chart-steps fs-1 mb-3"></i>
            <p>Select a question to view detailed response analytics</p>
          </div>
          <div v-else-if="loadingQuestionData" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else>
            <div class="question-analytics">
              <h6 class="mb-3">{{ selectedQuestion.label }}</h6>

              <div v-if="selectedQuestion.type === 'text' || selectedQuestion.type === 'textarea'">
                <!-- Word cloud and common phrases -->
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-header">
                        <h6 class="card-title mb-0">Word Cloud</h6>
                      </div>
                      <div class="card-body d-flex justify-content-center align-items-center">
                        <div class="text-center text-muted">
                          <i class="bi bi-cloud fs-1 mb-3"></i>
                          <p>Word cloud visualization based on text responses</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-header">
                        <h6 class="card-title mb-0">Common Phrases</h6>
                      </div>
                      <div class="card-body">
                        <ul class="list-group list-group-flush">
                          <li v-for="(phrase, index) in commonPhrases" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                            <span>{{ phrase.text }}</span>
                            <span class="badge bg-primary rounded-pill">{{ phrase.count }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="selectedQuestion.type === 'rating' || selectedQuestion.type === 'nps'">
                <!-- Rating distribution -->
                <div class="card">
                  <div class="card-header">
                    <h6 class="card-title mb-0">Rating Distribution</h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-4">
                      <div class="d-flex justify-content-between mb-2">
                        <div>Average Rating</div>
                        <div class="fw-bold">{{ questionAnalytics.averageRating.toFixed(1) }} / {{ selectedQuestion.settings?.max || 10 }}</div>
                      </div>
                      <div class="ratings-distribution">
                        <div
                          v-for="(count, value) in questionAnalytics.distribution"
                          :key="value"
                          class="rating-bar"
                        >
                          <div class="rating-value">{{ value }}</div>
                          <div class="progress">
                            <div
                              class="progress-bar"
                              :class="getRatingClass(parseInt(value), selectedQuestion.settings?.max || 10)"
                              :style="{ width: `${getPercentage(count, questionAnalytics.totalResponses)}%` }"
                            ></div>
                          </div>
                          <div class="rating-count">{{ count }}</div>
                          <div class="rating-percent">{{ getPercentage(count, questionAnalytics.totalResponses) }}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="selectedQuestion.type === 'radio' || selectedQuestion.type === 'checkbox' || selectedQuestion.type === 'dropdown'">
                <!-- Multiple choice distribution -->
                <div class="card">
                  <div class="card-header">
                    <h6 class="card-title mb-0">Answer Distribution</h6>
                  </div>
                  <div class="card-body">
                    <div class="choice-distribution">
                      <div class="row g-4">
                        <div class="col-md-8">
                          <div
                            v-for="(count, option) in questionAnalytics.optionCounts"
                            :key="option"
                            class="choice-bar mb-3"
                          >
                            <div class="d-flex justify-content-between mb-1">
                              <div>{{ option }}</div>
                              <div>{{ getPercentage(count, questionAnalytics.totalResponses) }}% ({{ count }})</div>
                            </div>
                            <div class="progress" style="height: 20px;">
                              <div
                                class="progress-bar"
                                :style="{ width: `${getPercentage(count, questionAnalytics.totalResponses)}%` }"
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="text-center text-muted">
                            <i class="bi bi-pie-chart fs-1 mb-3"></i>
                            <p>Pie chart showing option distribution</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sentiment Analysis -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="card-title mb-0">Sentiment Analysis</h5>
        </div>
        <div class="card-body">
          <div class="row g-4">
            <div class="col-md-4">
              <div class="sentiment-gauge text-center">
                <div class="sentiment-gauge-value">
                  <span class="sentiment-score">{{ sentimentAnalysis.overallScore.toFixed(1) }}</span>
                  <span class="sentiment-max">/10</span>
                </div>
                <div class="sentiment-label">Overall Sentiment</div>
                <div
                  class="sentiment-badge"
                  :class="{
                    'bg-success': sentimentAnalysis.overallScore >= 7,
                    'bg-warning text-dark': sentimentAnalysis.overallScore >= 4 && sentimentAnalysis.overallScore < 7,
                    'bg-danger': sentimentAnalysis.overallScore < 4
                  }"
                >
                  {{ getSentimentLabel(sentimentAnalysis.overallScore) }}
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="sentiment-summary">
                <div class="mb-3">
                  <h6 class="mb-2">Key Themes</h6>
                  <div class="theme-tags">
                    <span
                      v-for="(theme, index) in sentimentAnalysis.keyThemes"
                      :key="index"
                      class="badge"
                      :class="{
                        'bg-success': theme.sentiment === 'positive',
                        'bg-danger': theme.sentiment === 'negative',
                        'bg-secondary': theme.sentiment === 'neutral'
                      }"
                      style="margin-right: 8px; margin-bottom: 8px; font-size: 0.9rem; padding: 6px 10px;"
                    >
                      {{ theme.text }}
                    </span>
                  </div>
                </div>
                <div>
                  <h6 class="mb-2">Sentiment Trend</h6>
                  <div class="sentiment-trend-chart" style="height: 150px;">
                    <!-- Sentiment trend line chart would go here -->
                    <div class="d-flex justify-content-center align-items-center h-100">
                      <div class="text-center text-muted">
                        <i class="bi bi-graph-up fs-1 mb-3"></i>
                        <p>Line chart showing sentiment trend over time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import ResponseTrendChart from '@/components/analytics/ResponseTrendChart.vue'

export default {
  name: 'AnalyticsView',
  components: {
    ResponseTrendChart
  },
  setup() {
    const isLoading = ref(true)
    const selectedSurveyId = ref('all')
    const selectedPeriod = ref('30d')
    const trendGrouping = ref('day')
    const selectedQuestionId = ref('')
    const loadingQuestionData = ref(false)

    // Fetch surveys
    const surveys = ref([
      { id: 1, title: 'Customer Satisfaction Q1' },
      { id: 2, title: 'Product Feedback Survey' },
      { id: 3, title: 'Website UX Evaluation' }
    ])

    // Mock analytics data
    const metrics = ref({
      totalResponses: 342,
      responseChange: 15,
      avgNPS: 36,
      npsChange: -2,
      completionRate: 83,
      completionChange: 5,
      avgTime: 215, // in seconds
      timeChange: -8
    })

    // NPS breakdown
    const npsBreakdown = ref({
      promoters: 42,
      promotersCount: 144,
      passives: 28,
      passivesCount: 96,
      detractors: 30,
      detractorsCount: 102,
      npsScore: 12
    })

    // Sentiment analysis
    const sentimentAnalysis = ref({
      overallScore: 6.8,
      keyThemes: [
        { text: 'Easy to use', sentiment: 'positive' },
        { text: 'Great customer service', sentiment: 'positive' },
        { text: 'Slow response times', sentiment: 'negative' },
        { text: 'Product quality', sentiment: 'positive' },
        { text: 'Website navigation', sentiment: 'neutral' },
        { text: 'Pricing concerns', sentiment: 'negative' }
      ],
      sentimentByTheme: {
        'Customer Service': 8.2,
        'Product Quality': 7.5,
        'Website Experience': 5.9,
        'Pricing': 4.2
      }
    })

    // Questions
    const questions = ref([
      {
        id: 'q1',
        label: 'How would you rate our product quality?',
        type: 'rating',
        settings: {
          min: 1,
          max: 5
        }
      },
      {
        id: 'q2',
        label: 'How likely are you to recommend our company to a friend or colleague?',
        type: 'nps'
      },
      {
        id: 'q3',
        label: 'What aspects of our product do you like the most?',
        type: 'textarea'
      },
      {
        id: 'q4',
        label: 'Which features do you use most frequently?',
        type: 'checkbox',
        settings: {
          options: [
            { id: 1, value: 'Feature A', label: 'Feature A' },
            { id: 2, value: 'Feature B', label: 'Feature B' },
            { id: 3, value: 'Feature C', label: 'Feature C' },
            { id: 4, value: 'Feature D', label: 'Feature D' }
          ]
        }
      }
    ])

    // Selected question
    const selectedQuestion = computed(() => {
      return questions.value.find(q => q.id === selectedQuestionId.value) || null
    })

    // Question analytics
    const questionAnalytics = ref({
      totalResponses: 342,
      // For rating questions
      averageRating: 4.2,
      distribution: {
        '1': 12,
        '2': 24,
        '3': 65,
        '4': 123,
        '5': 118
      },
      // For multiple choice questions
      optionCounts: {
        'Feature A': 210,
        'Feature B': 185,
        'Feature C': 97,
        'Feature D': 65
      }
    })

    // Common phrases for text responses
    const commonPhrases = ref([
      { text: 'easy to use', count: 78 },
      { text: 'customer service', count: 56 },
      { text: 'user friendly', count: 42 },
      { text: 'great product', count: 38 },
      { text: 'impressive features', count: 25 }
    ])

    // Response trend data
    const responseTrendData = ref([])

    // Generate mock trend data
    const generateTrendData = () => {
      const days = selectedPeriod.value === '7d' ? 7 :
                  selectedPeriod.value === '30d' ? 30 :
                  selectedPeriod.value === '90d' ? 90 : 365

      const data = []
      const now = new Date()

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        // Generate random count between 5-30
        const count = Math.floor(Math.random() * 25) + 5

        data.push({
          date: date.toISOString().split('T')[0],
          count
        })
      }

      responseTrendData.value = data
    }

    // Fetch analytics data
    const fetchAnalytics = async () => {
      isLoading.value = true

      try {
        // In a real application, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        // Generate mock data based on selected survey and period
        generateTrendData()

        // Update mock metrics based on selected survey
        if (selectedSurveyId.value !== 'all') {
          const surveyIndex = parseInt(selectedSurveyId.value) - 1
          metrics.value.totalResponses = [156, 87, 99][surveyIndex] || 342
          metrics.value.avgNPS = [42, 35, 28][surveyIndex] || 36
          metrics.value.completionRate = [85, 78, 80][surveyIndex] || 83
        } else {
          metrics.value.totalResponses = 342
          metrics.value.avgNPS = 36
          metrics.value.completionRate = 83
        }

      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        isLoading.value = false
      }
    }

    // Fetch question-specific analytics
    const fetchQuestionAnalytics = async () => {
      if (!selectedQuestionId.value) return

      loadingQuestionData.value = true

      try {
        // In a real application, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 600)) // Simulate API delay

        // Mock data update based on selected question
        if (selectedQuestion.value.type === 'rating') {
          questionAnalytics.value = {
            totalResponses: 342,
            averageRating: 4.2,
            distribution: {
              '1': 12,
              '2': 24,
              '3': 65,
              '4': 123,
              '5': 118
            }
          }
        } else if (selectedQuestion.value.type === 'nps') {
          questionAnalytics.value = {
            totalResponses: 342,
            averageRating: 7.8,
            distribution: {
              '0': 10,
              '1': 5,
              '2': 8,
              '3': 12,
              '4': 15,
              '5': 20,
              '6': 30,
              '7': 45,
              '8': 51,
              '9': 65,
              '10': 81
            }
          }
        } else if (selectedQuestion.value.type === 'checkbox') {
          questionAnalytics.value = {
            totalResponses: 342,
            optionCounts: {
              'Feature A': 210,
              'Feature B': 185,
              'Feature C': 97,
              'Feature D': 65
            }
          }
        }

      } catch (error) {
        console.error('Failed to fetch question analytics:', error)
      } finally {
        loadingQuestionData.value = false
      }
    }

    // Download report
    const downloadReport = () => {
      // In a real application, this would generate and download a report
      console.log('Downloading report for:', {
        surveyId: selectedSurveyId.value,
        period: selectedPeriod.value
      })

      // Mock download
      setTimeout(() => {
        alert('Report generation not implemented in this demo.')
      }, 500)
    }

    // Format duration from seconds to minutes:seconds
    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // Get percentage
    const getPercentage = (value, total) => {
      if (!total) return 0
      return Math.round((value / total) * 100)
    }

    // Get rating class based on value
    const getRatingClass = (value, max) => {
      const percentage = (value / max) * 100

      if (percentage >= 80) return 'bg-success'
      if (percentage >= 60) return 'bg-primary'
      if (percentage >= 40) return 'bg-info'
      if (percentage >= 20) return 'bg-warning'
      return 'bg-danger'
    }

    // Get sentiment label based on score
    const getSentimentLabel = (score) => {
      if (score >= 8) return 'Very Positive'
      if (score >= 6) return 'Positive'
      if (score >= 4) return 'Neutral'
      if (score >= 2) return 'Negative'
      return 'Very Negative'
    }

    // Truncate text with ellipsis
    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    // Watch for changes in selected period or survey
    watch([selectedPeriod, selectedSurveyId], () => {
      fetchAnalytics()
    })

    // Watch for changes in trend grouping
    watch(trendGrouping, () => {
      // In a real app, this would either refetch data or regroup existing data
      console.log('Trend grouping changed:', trendGrouping.value)
    })

    // Initialize data on component mount
    onMounted(() => {
      fetchAnalytics()
    })

    return {
      isLoading,
      surveys,
      selectedSurveyId,
      selectedPeriod,
      metrics,
      npsBreakdown,
      trendGrouping,
      responseTrendData,
      questions,
      selectedQuestionId,
      loadingQuestionData,
      selectedQuestion,
      questionAnalytics,
      commonPhrases,
      sentimentAnalysis,
      fetchAnalytics,
      fetchQuestionAnalytics,
      downloadReport,
      formatDuration,
      getPercentage,
      getRatingClass,
      getSentimentLabel,
      truncateText
    }
  }
}
</script>

<style scoped>
.analytics-view {
  min-height: 100%;
}

.ratings-distribution {
  margin-top: 1.5rem;
}

.rating-bar {
  display: grid;
  grid-template-columns: 40px 1fr 50px 60px;
  gap: 10px;
  align-items: center;
  margin-bottom: 0.5rem;
}

.rating-value {
  text-align: center;
  font-weight: 500;
}

.rating-count, .rating-percent {
  font-size: 0.875rem;
  color: #6c757d;
}

.rating-percent {
  text-align: right;
}

.progress {
  height: 12px;
  background-color: #f0f0f0;
}

.sentiment-gauge {
  padding: 2rem 0;
}

.sentiment-gauge-value {
  margin-bottom: 1rem;
}

.sentiment-score {
  font-size: 3rem;
  font-weight: 600;
  color: #333;
}

.sentiment-max {
  font-size: 1.25rem;
  color: #6c757d;
}

.sentiment-label {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.sentiment-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 500;
}
</style>
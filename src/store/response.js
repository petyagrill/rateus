import { defineStore } from 'pinia'
import axios from 'axios'

export const useResponseStore = defineStore('response', {
  state: () => ({
    responses: [],
    currentResponse: null,
    metrics: {
      nps: null,
      csat: null,
      ces: null
    },
    filters: {
      surveyId: null,
      dateFrom: null,
      dateTo: null,
      sortBy: 'created_at',
      sortDirection: 'desc'
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 10
    },
    loading: false,
    error: null
  }),

  getters: {
    getResponseById: (state) => (id) => {
      return state.responses.find(response => response.id === parseInt(id, 10))
    },

    // Calculate Net Promoter Score (NPS)
    // NPS = % of Promoters (9-10) - % of Detractors (0-6)
    npsScore: (state) => {
      return state.metrics.nps
    },

    // Customer Satisfaction Score (CSAT)
    // Percentage of responses that are satisfied (typically ratings of 4-5 on a 5-point scale)
    csatScore: (state) => {
      return state.metrics.csat
    },

    // Customer Effort Score (CES)
    // Average rating on questions about ease of use/service
    cesScore: (state) => {
      return state.metrics.ces
    }
  },

  actions: {
    async fetchResponses(params = {}) {
      this.loading = true

      // Update filters with any provided params
      this.filters = {
        ...this.filters,
        ...params
      }

      try {
        const queryParams = new URLSearchParams()

        // Add all filters to query params
        for (const [key, value] of Object.entries(this.filters)) {
          if (value !== null && value !== undefined) {
            queryParams.append(key, value)
          }
        }

        // Add pagination params
        queryParams.append('page', this.pagination.currentPage)
        queryParams.append('per_page', this.pagination.perPage)

        const response = await axios.get(`/responses?${queryParams.toString()}`)

        this.responses = response.data.responses

        // Update pagination info
        this.pagination = {
          currentPage: response.data.meta.current_page,
          totalPages: response.data.meta.last_page,
          totalItems: response.data.meta.total,
          perPage: response.data.meta.per_page
        }

        return this.responses
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch responses.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchResponse(id) {
      this.loading = true

      try {
        const response = await axios.get(`/responses/${id}`)
        this.currentResponse = response.data.response
        return this.currentResponse
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch response details.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async submitSurveyResponse(surveyId, responseData) {
      this.loading = true

      try {
        const response = await axios.post(`/surveys/${surveyId}/responses`, responseData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to submit survey response.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMetrics(surveyId, period = 'all') {
      this.loading = true

      try {
        const response = await axios.get(`/surveys/${surveyId}/metrics`, {
          params: { period }
        })

        this.metrics = response.data.metrics
        return this.metrics
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch metrics.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async exportResponses(surveyId, format = 'csv') {
      this.loading = true

      try {
        const response = await axios.get(`/surveys/${surveyId}/responses/export`, {
          params: { format },
          responseType: 'blob'
        })

        // Create a download link and trigger it
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `survey_responses_${surveyId}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()

        return true
      } catch (error) {
        this.error = error.response?.data?.message || `Failed to export responses as ${format}.`
        throw error
      } finally {
        this.loading = false
      }
    },

    // Change page in pagination
    setPage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.currentPage = page
        return this.fetchResponses()
      }
    },

    // Update filters and refetch
    updateFilters(newFilters) {
      this.filters = {
        ...this.filters,
        ...newFilters
      }
      this.pagination.currentPage = 1 // Reset to first page
      return this.fetchResponses()
    },

    resetCurrentResponse() {
      this.currentResponse = null
    }
  }
})
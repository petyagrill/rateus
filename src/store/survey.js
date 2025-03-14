import { defineStore } from 'pinia'
import axios from 'axios'

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    surveys: [],
    currentSurvey: null,
    fieldTypes: [
      { id: 'text', name: 'Text Input', icon: 'bi bi-input-cursor-text' },
      { id: 'textarea', name: 'Long Text', icon: 'bi bi-textarea-t' },
      { id: 'number', name: 'Number', icon: 'bi bi-123' },
      { id: 'dropdown', name: 'Dropdown', icon: 'bi bi-menu-down' },
      { id: 'radio', name: 'Radio Buttons', icon: 'bi bi-record-circle' },
      { id: 'checkbox', name: 'Checkboxes', icon: 'bi bi-check-square' },
      { id: 'rating', name: 'Rating', icon: 'bi bi-star' },
      { id: 'date', name: 'Date', icon: 'bi bi-calendar' },
      { id: 'file', name: 'File Upload', icon: 'bi bi-file-earmark-arrow-up' },
      { id: 'email', name: 'Email', icon: 'bi bi-envelope' },
      { id: 'phone', name: 'Phone', icon: 'bi bi-telephone' },
      { id: 'nps', name: 'NPS Score', icon: 'bi bi-emoji-smile' }
    ],
    loading: false,
    error: null
  }),

  getters: {
    getSurveyById: (state) => (id) => {
      return state.surveys.find(survey => survey.id === parseInt(id, 10))
    }
  },

  actions: {
    async fetchSurveys() {
      this.loading = true

      try {
        const response = await axios.get('/surveys')
        this.surveys = response.data.surveys
        return this.surveys
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch surveys.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSurvey(id) {
      this.loading = true

      try {
        const response = await axios.get(`/surveys/${id}`)
        this.currentSurvey = response.data.survey
        return this.currentSurvey
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch survey.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createSurvey(surveyData) {
      this.loading = true

      try {
        const response = await axios.post('/surveys', surveyData)
        const newSurvey = response.data.survey
        this.surveys.push(newSurvey)
        this.currentSurvey = newSurvey
        return newSurvey
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create survey.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateSurvey(id, surveyData) {
      this.loading = true

      try {
        const response = await axios.put(`/surveys/${id}`, surveyData)
        const updatedSurvey = response.data.survey

        // Update in list
        const index = this.surveys.findIndex(s => s.id === parseInt(id, 10))
        if (index !== -1) {
          this.surveys[index] = updatedSurvey
        }

        this.currentSurvey = updatedSurvey
        return updatedSurvey
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update survey.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteSurvey(id) {
      this.loading = true

      try {
        await axios.delete(`/surveys/${id}`)

        // Remove from list
        this.surveys = this.surveys.filter(s => s.id !== parseInt(id, 10))

        if (this.currentSurvey && this.currentSurvey.id === parseInt(id, 10)) {
          this.currentSurvey = null
        }

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete survey.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async duplicateSurvey(id) {
      this.loading = true

      try {
        const response = await axios.post(`/surveys/${id}/duplicate`)
        const newSurvey = response.data.survey
        this.surveys.push(newSurvey)
        return newSurvey
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to duplicate survey.'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Helpers for form building
    createNewQuestion(type = 'text') {
      return {
        id: Date.now(), // Temporary ID, will be replaced by backend
        type,
        label: 'New question',
        placeholder: '',
        required: false,
        settings: this.getDefaultSettingsForType(type)
      }
    },

    getDefaultSettingsForType(type) {
      switch (type) {
        case 'dropdown':
        case 'radio':
        case 'checkbox':
          return {
            options: [
              { id: 1, value: 'Option 1', label: 'Option 1' },
              { id: 2, value: 'Option 2', label: 'Option 2' }
            ]
          }
        case 'rating':
          return {
            min: 0,
            max: 10,
            step: 1,
            showLabels: true,
            minLabel: 'Poor',
            maxLabel: 'Excellent'
          }
        case 'nps':
          return {
            showLabels: true,
            detractorLabel: 'Not at all likely',
            promoterLabel: 'Extremely likely'
          }
        case 'file':
          return {
            allowedTypes: 'image/*,.pdf',
            maxSize: 5, // in MB
            multiple: false
          }
        case 'number':
          return {
            min: null,
            max: null,
            step: 1
          }
        default:
          return {}
      }
    },

    createNewStep() {
      return {
        id: Date.now(), // Temporary ID, will be replaced by backend
        title: 'New Step',
        description: '',
        questions: []
      }
    },

    resetCurrentSurvey() {
      this.currentSurvey = null
    }
  }
})
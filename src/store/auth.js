import {defineStore} from 'pinia'
import axios from 'axios'

 
export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('auth_token') || null,
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token && !!state.user,
        isAdmin: (state) => state.user?.role === 'Administrator',
        isManager: (state) => state.user?.role === 'Manager' || state.user?.role === 'Administrator',
        isAnalyst: (state) => state.user?.role === 'Analyst' || state.user?.role === 'Manager' || state.user?.role === 'Administrator'
    },

    actions: {
        async login(email, password) {
            this.loading = true
            this.error = null 


            try {
                const response = await axios.post('/auth/login', {email, password})
                this.token = response.data.token ?? 'xxx'
                localStorage.setItem('auth_token', this.token)
            
                await this.getUserProfile()
            
                return this.user
            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed. Please check your credentials.'
                throw error
            } finally {
                this.loading = false
            }
        },

        async register(userData) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post('/auth/register', userData)
                this.token = response.data.token
                localStorage.setItem('auth_token', this.token)

                await this.getUserProfile()

                return this.user
            } catch (error) {
                this.error = error.response?.data?.message || 'Registration failed. Please try again.'
                throw error
            } finally {
                this.loading = false
            }
        },

        async getUserProfile() { 
            if (!this.token) {
                return null
            }

            this.loading = true

            try {
                const response = await axios.get('/auth/user')
                this.user = response.data.user
                return this.user
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch user profile.'
                this.token = null
                this.user = null
                localStorage.removeItem('auth_token')
                throw error
            } finally {
                this.loading = false
            }
        },

        async logout() {
            this.loading = true

            try {
                if (this.token) {
                    await axios.post('/auth/logout')
                }
            } catch (error) {
                console.error('Logout API error:', error)
            } finally {
                this.token = null
                this.user = null
                localStorage.removeItem('auth_token')
                this.loading = false
            }
        },

        async forgotPassword(email) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post('/auth/forgot-password', {email})
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to send password reset link.'
                throw error
            } finally {
                this.loading = false
            }
        },

        async resetPassword(token, password, password_confirmation) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.post('/auth/reset-password', {
                    token,
                    password,
                    password_confirmation
                })
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to reset password.'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateProfile(profileData) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.put('/auth/profile', profileData)
                this.user = response.data.user
                return this.user
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update profile.'
                throw error
            } finally {
                this.loading = false
            }
        },

        async changePassword(passwordData) {
            this.loading = true
            this.error = null

            try {
                const response = await axios.put('/auth/password', passwordData)
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to change password.'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})

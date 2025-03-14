import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import Vue3Toastify from 'vue3-toastify'

// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import "vue3-toastify/dist/index.css";
// Import custom styles
import './assets/scss/main.scss'

// Configure axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api'
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.withCredentials = true

// Check if user is logged in and add token to requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Handle unauthorized responses
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right',
})

app.mount('#app')
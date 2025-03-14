<template>
  <div class="login-view">
    <div class="card-body">
      <h3 class="card-title text-center mb-4">Sign In</h3>

      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="email"
            required
            :disabled="isLoading"
            autofocus
          >
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <label for="password" class="form-label">Password</label>
            <router-link to="/forgot-password" class="small text-decoration-none">
              Forgot Password?
            </router-link>
          </div>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            required
            :disabled="isLoading"
          >
        </div>

        <div class="mb-3 form-check">
          <input
            type="checkbox"
            class="form-check-input"
            id="remember"
            v-model="remember"
            :disabled="isLoading"
          >
          <label class="form-check-label" for="remember">Remember me</label>
        </div>

        <div class="d-grid">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Sign In
          </button>
        </div>
      </form>

      <div class="mt-4 text-center">
        <p class="mb-0">
          Don't have an account?
          <router-link to="/register" class="text-decoration-none">
            Sign Up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()

    const email = ref('')
    const password = ref('')
    const remember = ref(false)
    const isLoading = ref(false)
    const error = ref('')

    const login = async () => {
      error.value = ''
      isLoading.value = true

      try {
        await authStore.login(email.value, password.value)

        // If there's a redirect parameter, go there after login
        const redirectPath = route.query.redirect || '/'
        router.push(redirectPath)
      } catch (err) {
        error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
        console.error('Login error:', err)
      } finally {
        isLoading.value = false
      }
    }

    return {
      email,
      password,
      remember,
      isLoading,
      error,
      login
    }
  }
}
</script>
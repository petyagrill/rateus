<template>
  <div class="forgot-password-view">
    <div class="card-body">
      <h3 class="card-title text-center mb-4">Forgot Password</h3>

      <div v-if="messageSent" class="alert alert-success" role="alert">
        <h5 class="alert-heading">Email Sent!</h5>
        <p>Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.</p>
        <hr>
        <p class="mb-0">
          Didn't receive the email?
          <button @click="requestReset" class="btn btn-link p-0 align-baseline">Resend</button>
          or
          <router-link to="/login" class="btn btn-link p-0 align-baseline">Return to login</router-link>
        </p>
      </div>

      <div v-else>
        <p class="text-muted mb-4">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <div v-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <form @submit.prevent="requestReset">
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

          <div class="d-grid mb-3">
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Send Reset Link
            </button>
          </div>

          <div class="text-center">
            <router-link to="/login" class="text-decoration-none">
              <i class="bi bi-arrow-left me-1"></i> Back to Login
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const authStore = useAuthStore()

    const email = ref('')
    const isLoading = ref(false)
    const error = ref('')
    const messageSent = ref(false)

    const requestReset = async () => {
      if (!email.value) return

      isLoading.value = true
      error.value = ''

      try {
        await authStore.forgotPassword(email.value)
        messageSent.value = true
      } catch (err) {
        console.error('Password reset error:', err)
        error.value = err.response?.data?.message || 'Failed to send reset link. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    return {
      email,
      isLoading,
      error,
      messageSent,
      requestReset
    }
  }
}
</script>
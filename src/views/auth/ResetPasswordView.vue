<template>
  <div class="reset-password-view">
    <div class="card-body">
      <h3 class="card-title text-center mb-4">Reset Password</h3>

      <div v-if="resetComplete" class="alert alert-success" role="alert">
        <h5 class="alert-heading">Password Reset Complete!</h5>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        <hr>
        <div class="text-center">
          <router-link to="/login" class="btn btn-primary">
            Go to Login
          </router-link>
        </div>
      </div>

      <div v-else-if="tokenInvalid" class="alert alert-danger" role="alert">
        <h5 class="alert-heading">Invalid or Expired Link</h5>
        <p>The password reset link is invalid or has expired. Please request a new password reset link.</p>
        <hr>
        <div class="text-center">
          <router-link to="/forgot-password" class="btn btn-primary">
            Request New Link
          </router-link>
        </div>
      </div>

      <div v-else>
        <p class="text-muted mb-4">
          Enter your new password below to complete the password reset process.
        </p>

        <div v-if="error" class="alert alert-danger" role="alert">
          {{ error }}
        </div>

        <form @submit.prevent="resetPassword">
          <div class="mb-3">
            <label for="password" class="form-label">New Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="formData.password"
              required
              :disabled="isLoading"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              autofocus
            >
            <div class="form-text">
              Password must be at least 8 characters and include uppercase, lowercase, number, and special character
            </div>
          </div>

          <div class="mb-3">
            <label for="passwordConfirm" class="form-label">Confirm New Password</label>
            <input
              type="password"
              class="form-control"
              id="passwordConfirm"
              v-model="formData.passwordConfirm"
              required
              :disabled="isLoading"
            >
          </div>

          <div class="d-grid mb-3">
            <button
              type="submit"
              class="btn btn-primary btn-lg"
              :disabled="isLoading || !formIsValid"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Reset Password
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'ResetPasswordView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()

    const token = ref('')
    const formData = ref({
      password: '',
      passwordConfirm: ''
    })
    const isLoading = ref(false)
    const error = ref('')
    const resetComplete = ref(false)
    const tokenInvalid = ref(false)

    // Form validation
    const formIsValid = computed(() => {
      return formData.value.password &&
        formData.value.password === formData.value.passwordConfirm
    })

    // Extract token from route params
    onMounted(() => {
      token.value = route.params.token

      if (!token.value) {
        tokenInvalid.value = true
      } else {
        // In a real application, we might want to validate the token with the server first
        validateToken()
      }
    })

    // Validate token with the server
    const validateToken = async () => {
      isLoading.value = true

      try {
        // In a real application, this would make a request to the server
        // await authStore.validateResetToken(token.value)

        // Mock validation for demo purposes
        await new Promise(resolve => setTimeout(resolve, 500))

        // For demo purposes, we'll consider tokens with "invalid" in them as invalid
        if (token.value.includes('invalid')) {
          tokenInvalid.value = true
        }
      } catch (err) {
        console.error('Token validation error:', err)
        tokenInvalid.value = true
      } finally {
        isLoading.value = false
      }
    }

    // Reset password
    const resetPassword = async () => {
      if (!formIsValid.value) {
        if (formData.value.password !== formData.value.passwordConfirm) {
          error.value = 'Passwords do not match'
        }
        return
      }

      isLoading.value = true
      error.value = ''

      try {
        await authStore.resetPassword(
          token.value,
          formData.value.password,
          formData.value.passwordConfirm
        )

        resetComplete.value = true
      } catch (err) {
        console.error('Password reset error:', err)
        error.value = err.response?.data?.message || 'Failed to reset password. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    return {
      formData,
      isLoading,
      error,
      resetComplete,
      tokenInvalid,
      formIsValid,
      resetPassword
    }
  }
}
</script>
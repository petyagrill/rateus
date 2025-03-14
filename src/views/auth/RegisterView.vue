<template>
  <div class="register-view">
    <div class="card-body">
      <h3 class="card-title text-center mb-4">Create Account</h3>

      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <form @submit.prevent="register">
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="firstName" class="form-label">First Name</label>
            <input
              type="text"
              class="form-control"
              id="firstName"
              v-model="registrationData.firstName"
              required
              :disabled="isLoading"
              autofocus
            >
          </div>
          <div class="col-md-6">
            <label for="lastName" class="form-label">Last Name</label>
            <input
              type="text"
              class="form-control"
              id="lastName"
              v-model="registrationData.lastName"
              required
              :disabled="isLoading"
            >
          </div>
        </div>

        <div class="mb-3">
          <label for="email" class="form-label">Email address</label>
          <input
            type="email"
            class="form-control"
            id="email"
            v-model="registrationData.email"
            required
            :disabled="isLoading"
          >
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="registrationData.password"
            required
            :disabled="isLoading"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
          >
          <div class="form-text">
            Password must be at least 8 characters and include uppercase, lowercase, number, and special character
          </div>
        </div>

        <div class="mb-3">
          <label for="passwordConfirm" class="form-label">Confirm Password</label>
          <input
            type="password"
            class="form-control"
            id="passwordConfirm"
            v-model="registrationData.passwordConfirm"
            required
            :disabled="isLoading"
          >
        </div>

        <div class="mb-3">
          <label for="company" class="form-label">Company Name</label>
          <input
            type="text"
            class="form-control"
            id="company"
            v-model="registrationData.company"
            :disabled="isLoading"
          >
        </div>

        <div class="mb-3 form-check">
          <input
            type="checkbox"
            class="form-check-input"
            id="terms"
            v-model="registrationData.termsAccepted"
            required
            :disabled="isLoading"
          >
          <label class="form-check-label" for="terms">
            I agree to the <a href="#" @click.prevent="showTerms">Terms of Service</a> and <a href="#" @click.prevent="showPrivacyPolicy">Privacy Policy</a>
          </label>
        </div>

        <div class="d-grid">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="isLoading || !canSubmit"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Create Account
          </button>
        </div>
      </form>

      <div class="mt-4 text-center">
        <p class="mb-0">
          Already have an account?
          <router-link to="/login" class="text-decoration-none">
            Sign In
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const isLoading = ref(false)
    const error = ref('')

    const registrationData = ref({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirm: '',
      company: '',
      termsAccepted: false
    })

    const canSubmit = computed(() => {
      return registrationData.value.password === registrationData.value.passwordConfirm &&
        registrationData.value.termsAccepted
    })

    const register = async () => {
      if (!canSubmit.value) {
        if (registrationData.value.password !== registrationData.value.passwordConfirm) {
          error.value = 'Passwords do not match'
        }
        return
      }

      isLoading.value = true
      error.value = ''

      try {
        const userData = {
          name: `${registrationData.value.firstName} ${registrationData.value.lastName}`,
          email: registrationData.value.email,
          password: registrationData.value.password,
          password_confirmation: registrationData.value.passwordConfirm,
          company: registrationData.value.company
        }

        await authStore.register(userData)
        router.push('/dashboard')
      } catch (err) {
        console.error('Registration error:', err)
        error.value = err.response?.data?.message || 'Registration failed. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    const showTerms = () => {
      // In a real app, this would show a modal or navigate to terms page
      window.open('/terms', '_blank')
    }

    const showPrivacyPolicy = () => {
      // In a real app, this would show a modal or navigate to privacy policy page
      window.open('/privacy', '_blank')
    }

    return {
      registrationData,
      isLoading,
      error,
      canSubmit,
      register,
      showTerms,
      showPrivacyPolicy
    }
  }
}
</script>
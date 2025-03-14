<template>
  <div class="auth-container">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6 col-xl-5">
          <div class="text-center mb-4">
            <img src="/logos/rateus-logo.svg" alt="RateUS Logo" class="img-fluid" style="max-height: 60px;">
            <h2 class="mt-3">RateUS</h2>
            <p class="text-muted">Rate.Rise.Grow</p>
          </div>
          <div class="card shadow-lg">
            <div class="card-body p-4">
              <slot />
            </div>
          </div>
          <div class="text-center mt-4">
            <p class="text-muted">
              &copy; {{ currentYear }} RateUS. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4361ee 0%, #3f37c9 100%);
  padding: 2rem 0;
}

.card {
  border: none;
}
</style>
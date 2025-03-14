<template>
  <div class="not-found-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6 text-center">
          <div class="error-content">
            <div class="error-code mb-4">404</div>
            <h1 class="error-title mb-3">Page Not Found</h1>
            <p class="error-message mb-4">
              Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <div class="d-grid gap-2 d-md-flex justify-content-md-center">
              <router-link to="/" class="btn btn-primary">
                <i class="bi bi-house me-2"></i> Go Home
              </router-link>
              <button class="btn btn-outline-secondary" @click="goBack">
                <i class="bi bi-arrow-left me-2"></i> Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.error-content {
  padding: 3rem 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  color: #4361ee;
  opacity: 0.5;
}

.error-title {
  font-weight: 600;
  color: #333;
}

.error-message {
  color: #6c757d;
  max-width: 400px;
  margin: 0 auto;
}
</style>
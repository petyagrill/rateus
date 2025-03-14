<template>
  <footer class="app-footer mt-auto py-3 bg-light">
    <div class="container-fluid">
      <div class="d-flex flex-wrap justify-content-between align-items-center">
        <div class="col-md-6 d-flex align-items-center">
          <span class="text-muted small">
            &copy; {{ currentYear }} RateUS. Rate.Rise.Grow
          </span>
        </div>
        <ul class="nav col-md-6 justify-content-end list-unstyled d-flex">
          <li class="ms-3">
            <a href="#" class="text-muted small">Privacy Policy</a>
          </li>
          <li class="ms-3">
            <a href="#" class="text-muted small">Terms of Service</a>
          </li>
          <li class="ms-3">
            <a href="#" class="text-muted small">Contact Us</a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.app-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}
</style>
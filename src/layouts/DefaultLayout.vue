<template>
  <div class="app-container">
    <AppHeader />
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-2 col-md-3 p-0">
          <AppSidebar />
        </div>
        <div class="col-lg-10 col-md-9 p-4">
          <main>
            <slot />
          </main>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppFooter from '@/components/common/AppFooter.vue'

export default {
  name: 'DefaultLayout',
  components: {
    AppHeader,
    AppSidebar,
    AppFooter
  }
}
</script>
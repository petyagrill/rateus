<template>
  <header class="app-header py-2">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <button
            class="btn btn-sm d-md-none me-2"
            type="button"
            @click="toggleSidebar"
          >
            <i class="bi bi-list fs-5"></i>
          </button>
          <router-link to="/" class="text-decoration-none d-flex align-items-center">
            <img src="/logos/rateus-logo.svg" alt="RateUS Logo" height="36" class="me-2">
            <span class="fw-bold text-primary fs-4">RateUS</span>
          </router-link>
        </div>

        <div class="d-flex align-items-center">
          <div class="dropdown me-3">
            <button class="btn btn-sm btn-light position-relative" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-bell"></i>
              <span
                v-if="unreadNotifications > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
              </span>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <div v-if="notifications.length === 0" class="dropdown-item text-center">
                <small class="text-muted">No notifications</small>
              </div>
              <template v-else>
                <div v-for="notification in notifications" :key="notification.id" class="dropdown-item">
                  <div class="d-flex align-items-center">
                    <div>
                      <i :class="getNotificationIcon(notification.type)" class="me-2"></i>
                    </div>
                    <div>
                      <div class="small">{{ notification.message }}</div>
                      <div class="text-muted smaller">{{ formatTime(notification.created_at) }}</div>
                    </div>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item text-center small">View all notifications</a>
              </template>
            </div>
          </div>

          <div class="dropdown">
            <button
              class="btn btn-sm btn-light d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
            >
              <div class="avatar me-2">
                {{ user.initials }}
              </div>
              <div class="d-none d-md-block">
                <div class="small fw-bold">{{ user.name }}</div>
                <div class="smaller text-muted">{{ user.role }}</div>
              </div>
              <i class="bi bi-chevron-down ms-2"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end">
              <router-link to="/profile" class="dropdown-item">
                <i class="bi bi-person me-2"></i> My Profile
              </router-link>
              <router-link to="/settings" class="dropdown-item">
                <i class="bi bi-gear me-2"></i> Settings
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="logout" class="dropdown-item text-danger">
                <i class="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'AppHeader',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const isSidebarOpen = ref(false)

    // Mock data - would come from a notification store in real app
    const notifications = ref([
      {
        id: 1,
        type: 'response',
        message: 'New survey response received',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: 2,
        type: 'alert',
        message: 'NPS score dropped by 15%',
        read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    ])

    const user = computed(() => {
      const userData = authStore.user || {}

      return {
        name: userData.name || 'User',
        email: userData.email || 'user@example.com',
        role: userData.role || 'User',
        initials: (userData.name || 'U').substring(0, 1).toUpperCase()
      }
    })

    const unreadNotifications = computed(() => {
      return notifications.value.filter(n => !n.read).length
    })

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
      // Emit event to parent or use a store to toggle sidebar
    }

    const getNotificationIcon = (type) => {
      const icons = {
        'response': 'bi bi-envelope',
        'alert': 'bi bi-exclamation-circle',
        'system': 'bi bi-info-circle'
      }
      return icons[type] || 'bi bi-bell'
    }

    const formatTime = (date) => {
      const now = new Date()
      const diffMs = now - new Date(date)
      const diffMins = Math.round(diffMs / (1000 * 60))

      if (diffMins < 1) {
        return 'Just now'
      } else if (diffMins < 60) {
        return `${diffMins} min ago`
      } else if (diffMins < 1440) {
        const hours = Math.round(diffMins / 60)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else {
        const days = Math.round(diffMins / 1440)
        return `${days} day${days > 1 ? 's' : ''} ago`
      }
    }

    const logout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }

    return {
      user,
      notifications,
      unreadNotifications,
      toggleSidebar,
      getNotificationIcon,
      formatTime,
      logout
    }
  }
}
</script>

<style scoped>
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #4361ee;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.smaller {
  font-size: 0.75rem;
}
</style>
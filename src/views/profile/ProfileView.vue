<template>
  <div class="profile-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">My Profile</h1>
    </div>

    <div class="row">
      <div class="col-lg-4">
        <!-- Profile Card -->
        <div class="card mb-4">
          <div class="card-body text-center">
            <div class="profile-avatar mb-3">
              <span v-if="!profile.avatarUrl">{{ getInitials(profile.name) }}</span>
              <img v-else :src="profile.avatarUrl" alt="Profile" class="avatar-img" />
            </div>
            <h5 class="mb-1">{{ profile.name }}</h5>
            <div class="text-muted mb-3">{{ profile.role }}</div>

            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" @click="triggerAvatarUpload">
                <i class="bi bi-camera me-2"></i>Change Photo
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="d-none"
                @change="handleAvatarChange"
              />
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Account Information</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="small text-muted">Email</label>
              <div>{{ profile.email }}</div>
            </div>
            <div class="mb-3">
              <label class="small text-muted">Member Since</label>
              <div>{{ formatDate(profile.createdAt) }}</div>
            </div>
            <div class="mb-3">
              <label class="small text-muted">Last Login</label>
              <div>{{ formatDate(profile.lastLogin) }}</div>
            </div>
            <div>
              <label class="small text-muted">Two-Factor Authentication</label>
              <div class="d-flex justify-content-between align-items-center">
                <div>{{ profile.twoFactorEnabled ? 'Enabled' : 'Disabled' }}</div>
                <button
                  class="btn btn-sm btn-link p-0"
                  @click="setupTwoFactor"
                >
                  {{ profile.twoFactorEnabled ? 'Manage' : 'Enable' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <!-- Personal Information Form -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Personal Information</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="name" class="form-label">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    v-model="profile.name"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label for="jobTitle" class="form-label">Job Title</label>
                  <input
                    type="text"
                    class="form-control"
                    id="jobTitle"
                    v-model="profile.jobTitle"
                  />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="email" class="form-label">Email Address</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="profile.email"
                    required
                    disabled
                  />
                  <div class="form-text">To change your email, please contact support</div>
                </div>
                <div class="col-md-6">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="phone"
                    v-model="profile.phone"
                  />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label for="timezone" class="form-label">Timezone</label>
                  <select class="form-select" id="timezone" v-model="profile.timezone">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="language" class="form-label">Language</label>
                  <select class="form-select" id="language" v-model="profile.language">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label for="bio" class="form-label">Bio</label>
                <textarea
                  class="form-control"
                  id="bio"
                  rows="3"
                  v-model="profile.bio"
                ></textarea>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                  <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password Form -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Change Password</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Current Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  required
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                />
                <div class="form-text">
                  Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm New Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  required
                />
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-primary" :disabled="isChangingPassword">
                  <span v-if="isChangingPassword" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Account Activity -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Recent Activity</h5>
            <button class="btn btn-sm btn-link p-0">View All</button>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="(activity, index) in recentActivity" :key="index" class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                  <div>
                    <div class="d-flex align-items-center">
                      <i :class="`bi ${activity.icon} me-2 text-${activity.type}`"></i>
                      <span>{{ activity.message }}</span>
                    </div>
                  </div>
                  <small class="text-muted">{{ formatDateRelative(activity.timestamp) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { toast } from 'vue3-toastify'

export default {
  name: 'ProfileView',
  setup() {
    const authStore = useAuthStore()
    const avatarInput = ref(null)
    const isUpdating = ref(false)
    const isChangingPassword = ref(false)

    // Profile data
    const profile = reactive({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Administrator',
      jobTitle: 'Product Manager',
      phone: '+1 (555) 123-4567',
      bio: 'Product manager with 5+ years of experience in SaaS products.',
      timezone: 'America/New_York',
      language: 'en',
      createdAt: '2022-06-15T10:30:00Z',
      lastLogin: '2023-04-02T08:45:00Z',
      twoFactorEnabled: false,
      avatarUrl: null
    })

    // Password form
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // Recent activity
    const recentActivity = ref([
      {
        type: 'primary',
        icon: 'bi-person',
        message: 'You updated your profile information',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        type: 'success',
        icon: 'bi-check-circle',
        message: 'You created a new survey "Customer Satisfaction Q1"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        type: 'warning',
        icon: 'bi-shield',
        message: 'Password changed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        type: 'info',
        icon: 'bi-box-arrow-in-right',
        message: 'Logged in from a new device',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
      }
    ])

    // Fetch user profile
    onMounted(async () => {
      // In a real app, this would get data from the auth store
      // const userData = authStore.user
      // if (userData) {
      //   Object.assign(profile, userData)
      // }
    })

    // Trigger file input click for avatar upload
    const triggerAvatarUpload = () => {
      avatarInput.value.click()
    }

    // Handle avatar file change
    const handleAvatarChange = (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size exceeds 2MB limit')
        return
      }

      // In a real app, this would upload the image to a server
      const reader = new FileReader()
      reader.onload = (e) => {
        profile.avatarUrl = e.target.result
      }
      reader.readAsDataURL(file)
    }

    // Update profile
    const updateProfile = async () => {
      isUpdating.value = true

      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        // authStore.updateProfile(profile)

        toast.success('Profile updated successfully')
      } catch (error) {
        console.error('Failed to update profile:', error)
        toast.error('Failed to update profile. Please try again.')
      } finally {
        isUpdating.value = false
      }
    }

    // Change password
    const changePassword = async () => {
      // Validate password match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New passwords do not match')
        return
      }

      isChangingPassword.value = true

      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        // await authStore.changePassword({
        //   current_password: passwordForm.currentPassword,
        //   password: passwordForm.newPassword,
        //   password_confirmation: passwordForm.confirmPassword
        // })

        // Reset form
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''

        toast.success('Password changed successfully')
      } catch (error) {
        console.error('Failed to change password:', error)
        toast.error('Failed to change password. Please check your current password.')
      } finally {
        isChangingPassword.value = false
      }
    }

    // Two-Factor setup
    const setupTwoFactor = () => {
      // In a real app, this would show a 2FA setup modal
      console.log('Setup 2FA')
    }

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Format relative date
    const formatDateRelative = (date) => {
      const now = new Date()
      const diffMs = now - date
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

    // Get initials for avatar
    const getInitials = (name) => {
      if (!name) return ''
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }

    return {
      profile,
      passwordForm,
      recentActivity,
      avatarInput,
      isUpdating,
      isChangingPassword,
      triggerAvatarUpload,
      handleAvatarChange,
      updateProfile,
      changePassword,
      setupTwoFactor,
      formatDate,
      formatDateRelative,
      getInitials
    }
  }
}
</script>

<style scoped>
.profile-view {
  min-height: 100%;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #4361ee;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: 500;
  margin: 0 auto;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
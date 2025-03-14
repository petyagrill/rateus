<template>
  <div class="settings-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Settings</h1>
    </div>

    <div class="row">
      <div class="col-lg-3">
        <div class="card mb-4">
          <div class="card-body">
            <div class="nav flex-column nav-pills">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                class="nav-link text-start"
                :class="{ active: currentTab === tab.id }"
                @click="currentTab = tab.id"
              >
                <i :class="`bi ${tab.icon} me-2`"></i>
                {{ tab.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-9">
        <!-- Account Settings -->
        <div v-if="currentTab === 'account'" class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Account Settings</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveAccountSettings">
              <div class="mb-3">
                <label for="name" class="form-label">Organization Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="accountSettings.name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Contact Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="accountSettings.email"
                  required
                />
                <div class="form-text">This email will receive system notifications.</div>
              </div>

              <div class="mb-3">
                <label for="timezone" class="form-label">Timezone</label>
                <select class="form-select" id="timezone" v-model="accountSettings.timezone">
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

              <div class="mb-3">
                <label for="language" class="form-label">Language</label>
                <select class="form-select" id="language" v-model="accountSettings.language">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Branding Settings -->
        <div v-if="currentTab === 'branding'" class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Branding Settings</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveBrandingSettings">
              <div class="mb-3">
                <label class="form-label">Logo</label>
                <div class="d-flex align-items-center mb-3">
                  <div
                    class="logo-preview me-3"
                    :style="brandingSettings.logo ? {
                      backgroundImage: `url(${logoPreview})`
                    } : {}"
                  >
                    <i v-if="!brandingSettings.logo" class="bi bi-image text-muted"></i>
                  </div>
                  <div>
                    <input
                      type="file"
                      class="form-control"
                      accept="image/*"
                      @change="handleLogoChange"
                    />
                    <div class="form-text">Recommended size: 200x60px, max 2MB</div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="primaryColor" class="form-label">Primary Color</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <div
                      class="color-preview"
                      :style="{ backgroundColor: brandingSettings.primaryColor }"
                    ></div>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    id="primaryColor"
                    v-model="brandingSettings.primaryColor"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    placeholder="#4361ee"
                  />
                </div>
                <div class="form-text">Enter a valid hex color code</div>
              </div>

              <div class="mb-3">
                <label for="font" class="form-label">Font Family</label>
                <select class="form-select" id="font" v-model="brandingSettings.font">
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label d-block">Survey Footer Text</label>
                <textarea
                  class="form-control"
                  rows="2"
                  v-model="brandingSettings.footerText"
                  placeholder="Powered by your company name"
                ></textarea>
                <div class="form-text">This text will appear at the bottom of your surveys</div>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div v-if="currentTab === 'notifications'" class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Notification Settings</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveNotificationSettings">
              <div class="mb-4">
                <h6>Email Notifications</h6>
                <div class="form-check form-switch mb-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="notifyNewResponses"
                    v-model="notificationSettings.email.newResponses"
                  />
                  <label class="form-check-label" for="notifyNewResponses">
                    New survey responses
                  </label>
                </div>

                <div class="form-check form-switch mb-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="notifyNpsAlerts"
                    v-model="notificationSettings.email.npsAlerts"
                  />
                  <label class="form-check-label" for="notifyNpsAlerts">
                    NPS score changes
                  </label>
                </div>

                <div class="form-check form-switch mb-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="notifyWeeklyReports"
                    v-model="notificationSettings.email.weeklyReports"
                  />
                  <label class="form-check-label" for="notifyWeeklyReports">
                    Weekly summary reports
                  </label>
                </div>
              </div>

              <div class="mb-4">
                <h6>In-App Notifications</h6>
                <div class="form-check form-switch mb-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="appNotifyNewResponses"
                    v-model="notificationSettings.inApp.newResponses"
                  />
                  <label class="form-check-label" for="appNotifyNewResponses">
                    New survey responses
                  </label>
                </div>

                <div class="form-check form-switch mb-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="appNotifyNpsAlerts"
                    v-model="notificationSettings.inApp.npsAlerts"
                  />
                  <label class="form-check-label" for="appNotifyNpsAlerts">
                    NPS score changes
                  </label>
                </div>

                <div class="form-check form-switch mb-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="appNotifySystemUpdates"
                    v-model="notificationSettings.inApp.systemUpdates"
                  />
                  <label class="form-check-label" for="appNotifySystemUpdates">
                    System updates and announcements
                  </label>
                </div>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" class="btn btn-primary" :disabled="isSaving">
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Team Members -->
        <div v-if="currentTab === 'team'" class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Team Members</h5>
            <button class="btn btn-sm btn-primary" @click="showAddMemberModal">
              <i class="bi bi-person-plus me-1"></i> Add Member
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(member, index) in teamMembers" :key="index">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar me-2">
                          {{ getInitials(member.name) }}
                        </div>
                        <div>{{ member.name }}</div>
                      </div>
                    </td>
                    <td>{{ member.email }}</td>
                    <td>{{ member.role }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="member.status === 'Active' ? 'bg-success' : 'bg-warning text-dark'"
                      >
                        {{ member.status }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" @click="editMember(member)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" @click="removeMember(member)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Integrations -->
        <div v-if="currentTab === 'integrations'" class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Integrations</h5>
          </div>
          <div class="card-body">
            <div class="row row-cols-1 row-cols-md-2 g-4">
              <div class="col" v-for="integration in integrations" :key="integration.id">
                <div class="card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <div class="integration-logo">
                        <i :class="`bi ${integration.icon} fs-1`"></i>
                      </div>
                      <div class="form-check form-switch">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          v-model="integration.connected"
                          @change="toggleIntegration(integration)"
                        />
                      </div>
                    </div>
                    <h5 class="card-title">{{ integration.name }}</h5>
                    <p class="card-text text-muted small">{{ integration.description }}</p>
                    <button
                      class="btn btn-sm"
                      :class="integration.connected ? 'btn-outline-danger' : 'btn-outline-primary'"
                      @click="integration.connected ? disconnectIntegration(integration) : connectIntegration(integration)"
                    >
                      {{ integration.connected ? 'Disconnect' : 'Connect' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- API Settings -->
        <div v-if="currentTab === 'api'" class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">API Settings</h5>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <h6>API Keys</h6>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div class="fw-bold">Live API Key</div>
                  <div class="text-muted small">Use this key for production environment</div>
                </div>
                <div class="d-flex align-items-center">
                  <div class="api-key me-2">
                    <code>{{ showLiveKey ? apiSettings.liveKey : '••••••••••••••••••••••••' }}</code>
                  </div>
                  <button
                    class="btn btn-sm btn-outline-secondary me-2"
                    @click="showLiveKey = !showLiveKey"
                    title="Toggle visibility"
                  >
                    <i class="bi" :class="showLiveKey ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="copyToClipboard(apiSettings.liveKey)"
                    title="Copy to clipboard"
                  >
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div class="fw-bold">Test API Key</div>
                  <div class="text-muted small">Use this key for development and testing</div>
                </div>
                <div class="d-flex align-items-center">
                  <div class="api-key me-2">
                    <code>{{ showTestKey ? apiSettings.testKey : '••••••••••••••••••••••••' }}</code>
                  </div>
                  <button
                    class="btn btn-sm btn-outline-secondary me-2"
                    @click="showTestKey = !showTestKey"
                    title="Toggle visibility"
                  >
                    <i class="bi" :class="showTestKey ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="copyToClipboard(apiSettings.testKey)"
                    title="Copy to clipboard"
                  >
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>

              <div class="text-end">
                <button class="btn btn-outline-primary btn-sm" @click="regenerateKeys">
                  <i class="bi bi-arrow-repeat me-1"></i> Regenerate Keys
                </button>
              </div>
            </div>

            <div class="mb-4">
              <h6>Webhook URL</h6>
              <div class="input-group mb-2">
                <input
                  type="url"
                  class="form-control"
                  placeholder="https://your-domain.com/webhook"
                  v-model="apiSettings.webhookUrl"
                />
                <button
                  class="btn btn-outline-primary"
                  type="button"
                  @click="saveWebhookUrl"
                >
                  Save
                </button>
              </div>
              <div class="form-text">We'll send survey response data to this URL</div>
            </div>

            <div class="mb-4">
              <h6>API Documentation</h6>
              <p class="text-muted small">Access our API documentation to learn how to integrate RateUS with your systems.</p>
              <a href="#" class="btn btn-sm btn-outline-primary">
                <i class="bi bi-book me-1"></i> View API Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

export default {
  name: 'SettingsView',
  setup() {
    const currentTab = ref('account')
    const isSaving = ref(false)
    const logoPreview = ref(null)
    const showLiveKey = ref(false)
    const showTestKey = ref(false)

    // Account settings
    const accountSettings = ref({
      name: 'My Organization',
      email: 'contact@example.com',
      timezone: 'UTC',
      language: 'en'
    })

    // Branding settings
    const brandingSettings = ref({
      logo: null,
      primaryColor: '#4361ee',
      font: 'Inter',
      footerText: 'Powered by RateUS'
    })

    // Notification settings
    const notificationSettings = ref({
      email: {
        newResponses: true,
        npsAlerts: true,
        weeklyReports: true
      },
      inApp: {
        newResponses: true,
        npsAlerts: true,
        systemUpdates: true
      }
    })

    // Team members
    const teamMembers = ref([
      {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Administrator',
        status: 'Active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Manager',
        status: 'Active'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'Analyst',
        status: 'Pending'
      }
    ])

    // API settings
    const apiSettings = ref({
      liveKey: 'sk_live_a1b2c3d4e5f6g7h8i9j0',
      testKey: 'sk_test_a1b2c3d4e5f6g7h8i9j0',
      webhookUrl: 'https://example.com/webhook'
    })

    // Integrations
    const integrations = ref([
      {
        id: 'slack',
        name: 'Slack',
        icon: 'bi-slack',
        description: 'Get notifications about survey responses directly in your Slack workspace.',
        connected: false
      },
      {
        id: 'zapier',
        name: 'Zapier',
        icon: 'bi-lightning',
        description: 'Connect RateUS to thousands of other apps through Zapier automations.',
        connected: true
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        icon: 'bi-cloud',
        description: 'Sync survey responses with Salesforce customer records.',
        connected: false
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        icon: 'bi-diagram-3',
        description: 'Connect survey data to your HubSpot CRM contacts.',
        connected: false
      }
    ])

    // Tab navigation
    const tabs = [
      { id: 'account', label: 'Account', icon: 'bi-person' },
      { id: 'branding', label: 'Branding', icon: 'bi-palette' },
      { id: 'notifications', label: 'Notifications', icon: 'bi-bell' },
      { id: 'team', label: 'Team Members', icon: 'bi-people' },
      { id: 'integrations', label: 'Integrations', icon: 'bi-puzzle' },
      { id: 'api', label: 'API Settings', icon: 'bi-code-slash' }
    ]

    // Handle file upload for logo
    const handleLogoChange = (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo size exceeds 2MB limit')
        return
      }

      brandingSettings.value.logo = file

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        logoPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }

    // Save account settings
    const saveAccountSettings = async () => {
      isSaving.value = true

      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        toast.success('Account settings saved successfully')
      } catch (error) {
        console.error('Failed to save account settings:', error)
        toast.error('Failed to save settings. Please try again.')
      } finally {
        isSaving.value = false
      }
    }

    // Save branding settings
    const saveBrandingSettings = async () => {
      isSaving.value = true

      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        toast.success('Branding settings saved successfully')
      } catch (error) {
        console.error('Failed to save branding settings:', error)
        toast.error('Failed to save settings. Please try again.')
      } finally {
        isSaving.value = false
      }
    }

    // Save notification settings
    const saveNotificationSettings = async () => {
      isSaving.value = true

      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay

        toast.success('Notification settings saved successfully')
      } catch (error) {
        console.error('Failed to save notification settings:', error)
        toast.error('Failed to save settings. Please try again.')
      } finally {
        isSaving.value = false
      }
    }

    // Team member functions
    const showAddMemberModal = () => {
      // In a real app, this would show a modal
      console.log('Show add member modal')
    }

    const editMember = (member) => {
      // In a real app, this would show an edit modal
      console.log('Edit member:', member)
    }

    const removeMember = (member) => {
      if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
        teamMembers.value = teamMembers.value.filter(m => m.email !== member.email)
        toast.success(`${member.name} has been removed from the team`)
      }
    }

    // Integration functions
    const toggleIntegration = (integration) => {
      console.log(`Toggle integration: ${integration.name} - ${integration.connected ? 'on' : 'off'}`)
    }

    const connectIntegration = (integration) => {
      // In a real app, this would initiate OAuth flow
      integration.connected = true
      toast.success(`Connected to ${integration.name}`)
    }

    const disconnectIntegration = (integration) => {
      if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
        integration.connected = false
        toast.success(`Disconnected from ${integration.name}`)
      }
    }

    // API functions
    const regenerateKeys = () => {
      if (confirm('Are you sure you want to regenerate API keys? This will invalidate existing keys.')) {
        apiSettings.value.liveKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`
        apiSettings.value.testKey = `sk_test_${Math.random().toString(36).substring(2, 15)}`
        toast.success('API keys regenerated successfully')
      }
    }

    const saveWebhookUrl = () => {
      toast.success('Webhook URL saved successfully')
    }

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.success('Copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy:', err)
          toast.error('Failed to copy. Please try again.')
        })
    }

    // Utility functions
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
      currentTab,
      tabs,
      isSaving,
      accountSettings,
      brandingSettings,
      logoPreview,
      notificationSettings,
      teamMembers,
      apiSettings,
      integrations,
      showLiveKey,
      showTestKey,
      handleLogoChange,
      saveAccountSettings,
      saveBrandingSettings,
      saveNotificationSettings,
      showAddMemberModal,
      editMember,
      removeMember,
      getInitials,
      toggleIntegration,
      connectIntegration,
      disconnectIntegration,
      regenerateKeys,
      saveWebhookUrl,
      copyToClipboard
    }
  }
}
</script>

<style scoped>
.settings-view {
  min-height: 100%;
}

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

.logo-preview {
  width: 120px;
  height: 45px;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.integration-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4361ee;
}

.api-key {
  background-color: #f8f9fa;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
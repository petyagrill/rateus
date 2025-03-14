<template>
  <div class="response-user-info">
    <div v-if="hasRespondentInfo" class="mb-3">
      <div v-if="response.respondent.name" class="d-flex align-items-center mb-2">
        <div class="user-avatar me-2">
          {{ getUserInitials(response.respondent.name) }}
        </div>
        <div class="respondent-info">
          <div class="respondent-name fw-medium">{{ response.respondent.name }}</div>
        </div>
      </div>

      <ul class="list-group list-group-flush">
        <li v-if="response.respondent.email" class="list-group-item d-flex px-0 py-2">
          <i class="bi bi-envelope text-muted me-2"></i>
          <a :href="`mailto:${response.respondent.email}`" class="text-decoration-none text-truncate">
            {{ response.respondent.email }}
          </a>
        </li>
        <li v-if="response.respondent.phone" class="list-group-item d-flex px-0 py-2">
          <i class="bi bi-telephone text-muted me-2"></i>
          <a :href="`tel:${response.respondent.phone}`" class="text-decoration-none">
            {{ response.respondent.phone }}
          </a>
        </li>
      </ul>

      <div class="mt-3">
        <a href="#" @click.prevent="openSendEmailDialog" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-envelope me-1"></i> Send Email
        </a>
      </div>
    </div>

    <div v-else class="text-center py-3">
      <p class="text-muted mb-0">No respondent information available</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseUserInfo',
  props: {
    response: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasRespondentInfo() {
      return this.response.respondent && (
        this.response.respondent.name ||
        this.response.respondent.email ||
        this.response.respondent.phone
      );
    }
  },
  methods: {
    getUserInitials(name) {
      if (!name) return '?';

      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },

    openSendEmailDialog() {
      // In a real app, this would show a modal for sending an email
      if (this.response.respondent && this.response.respondent.email) {
        window.location.href = `mailto:${this.response.respondent.email}`;
      }
    }
  }
}
</script>

<style scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4361ee;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.list-group-item {
  border-top: none;
  border-left: none;
  border-right: none;
}
</style>
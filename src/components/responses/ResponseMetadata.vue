<template>
  <div class="response-metadata">
    <ul class="list-group list-group-flush">
      <li class="list-group-item d-flex justify-content-between px-0">
        <span class="text-muted">Date Submitted</span>
        <span>{{ formatDate(response.created_at) }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between px-0">
        <span class="text-muted">Time Completed</span>
        <span>{{ formatDate(response.completed_at, true) }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between px-0">
        <span class="text-muted">Device</span>
        <span>{{ response.device || 'Unknown' }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between px-0">
        <span class="text-muted">Browser</span>
        <span>{{ response.browser || 'Unknown' }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between px-0">
        <span class="text-muted">Operating System</span>
        <span>{{ response.os || 'Unknown' }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between px-0">
        <span class="text-muted">IP Address</span>
        <span>{{ response.ip_address || 'Not recorded' }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between px-0">
        <span class="text-muted">Location</span>
        <span>{{ response.location || 'Unknown' }}</span>
      </li>
    </ul>

    <div class="mt-3">
      <h6 class="text-muted mb-2">Referral Information</h6>
      <ul class="list-group list-group-flush">
        <li v-if="response.utm_source" class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted">Source</span>
          <span>{{ response.utm_source }}</span>
        </li>
        <li v-if="response.utm_medium" class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted">Medium</span>
          <span>{{ response.utm_medium }}</span>
        </li>
        <li v-if="response.utm_campaign" class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted">Campaign</span>
          <span>{{ response.utm_campaign }}</span>
        </li>
        <li v-if="response.referrer" class="list-group-item d-flex justify-content-between px-0">
          <span class="text-muted">Referrer</span>
          <span class="text-truncate d-inline-block" style="max-width: 200px;">
            {{ response.referrer }}
          </span>
        </li>
        <li v-if="!hasUtmParams && !response.referrer" class="list-group-item px-0">
          <span class="text-muted">No referral information available</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseMetadata',
  props: {
    response: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasUtmParams() {
      return this.response.utm_source || this.response.utm_medium || this.response.utm_campaign;
    }
  },
  methods: {
    formatDate(dateString, includeTime = false) {
      if (!dateString) return 'N/A';

      const date = new Date(dateString);

      if (includeTime) {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}
</script>

<style scoped>
.list-group-item {
  border-top: none;
  border-left: none;
  border-right: none;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
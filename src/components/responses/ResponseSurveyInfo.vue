<template>
  <div class="response-survey-info">
    <div class="d-flex align-items-center mb-3">
      <div class="survey-icon me-3">
        <i class="bi bi-clipboard-data"></i>
      </div>
      <div>
        <h5 class="mb-0">{{ response.survey_title }}</h5>
        <router-link :to="`/surveys/${response.survey_id}`" class="text-decoration-none">
          View Survey
        </router-link>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-4">
        <div class="card h-100 bg-light border-0">
          <div class="card-body">
            <div class="text-muted mb-1">Completion Status</div>
            <div class="d-flex align-items-center">
              <span
                class="status-indicator me-2"
                :class="{
                  'bg-success': response.status === 'completed',
                  'bg-warning': response.status === 'partial',
                  'bg-danger': response.status === 'abandoned'
                }"
              ></span>
              <div class="text-capitalize">{{ response.status || 'Unknown' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 bg-light border-0">
          <div class="card-body">
            <div class="text-muted mb-1">Completion Time</div>
            <div>{{ formatDuration(response.completion_time) }}</div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card h-100 bg-light border-0">
          <div class="card-body">
            <div class="text-muted mb-1">Completion Rate</div>
            <div>{{ response.completion_rate || 0 }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseSurveyInfo',
  props: {
    response: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDuration(seconds) {
      if (!seconds) return '—';

      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes === 0) {
        return `${remainingSeconds} sec`;
      } else if (remainingSeconds === 0) {
        return `${minutes} min`;
      } else {
        return `${minutes} min ${remainingSeconds} sec`;
      }
    }
  }
}
</script>

<style scoped>
.survey-icon {
  width: 48px;
  height: 48px;
  background-color: #f0f7ff;
  color: #4361ee;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
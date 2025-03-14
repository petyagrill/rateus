<template>
  <div class="response-nps-score">
    <div class="text-center mb-3">
      <div class="nps-value">
        <div class="nps-badge" :class="npsBadgeClass">{{ npsScore }}</div>
      </div>
      <div class="nps-category">{{ npsCategory }}</div>
    </div>

    <div class="nps-scale mb-3">
      <div class="progress" style="height: 8px;">
        <div
          class="progress-bar bg-danger"
          role="progressbar"
          :style="{ width: detractorWidth }"
        ></div>
        <div
          class="progress-bar bg-warning"
          role="progressbar"
          :style="{ width: passiveWidth }"
        ></div>
        <div
          class="progress-bar bg-success"
          role="progressbar"
          :style="{ width: promoterWidth }"
        ></div>
      </div>
      <div class="d-flex justify-content-between mt-1 small">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>

    <div v-if="npsComment" class="nps-comment">
      <div class="comment-label small text-muted mb-1">Comment:</div>
      <div class="comment-text p-2 bg-light rounded">{{ npsComment }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseNpsScore',
  props: {
    npsScore: {
      type: Number,
      required: true
    },
    npsComment: {
      type: String,
      default: ''
    }
  },
  computed: {
    npsCategory() {
      if (this.npsScore >= 9) return 'Promoter';
      if (this.npsScore >= 7) return 'Passive';
      return 'Detractor';
    },

    npsBadgeClass() {
      if (this.npsScore >= 9) return 'bg-success';
      if (this.npsScore >= 7) return 'bg-warning';
      return 'bg-danger';
    },

    // Width of each section in the NPS scale visualization
    detractorWidth() {
      return '70%'; // 0-6 (7 numbers out of 11 total)
    },

    passiveWidth() {
      return '20%'; // 7-8 (2 numbers out of 11 total)
    },

    promoterWidth() {
      return '20%'; // 9-10 (2 numbers out of 11 total)
    }
  }
}
</script>

<style scoped>
.nps-value {
  margin-bottom: 0.5rem;
}

.nps-badge {
  display: inline-block;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 60px;
  text-align: center;
}

.nps-category {
  font-weight: 500;
  color: #6c757d;
}

.nps-comment {
  margin-top: 1rem;
}

.comment-text {
  white-space: pre-wrap;
}
</style>
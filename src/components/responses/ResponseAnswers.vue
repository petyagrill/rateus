<template>
  <div class="response-answers">
    <div v-if="!response.steps || response.steps.length === 0" class="text-center py-4">
      <p class="text-muted mb-0">No response data available</p>
    </div>

    <div v-else class="accordion">
      <div
        v-for="step in response.steps"
        :key="step.id"
        class="accordion-item"
      >
        <h2 class="accordion-header">
          <button
            class="accordion-button"
            :class="{ collapsed: !isStepExpanded(step.id) }"
            type="button"
            @click="toggleStep(step.id)"
          >
            <div class="d-flex align-items-center justify-content-between w-100 me-3">
              <div><strong>{{ step.title }}</strong></div>
              <div class="text-muted small">{{ step.questions.length }} questions</div>
            </div>
          </button>
        </h2>

        <div
          class="accordion-collapse collapse"
          :class="{ show: isStepExpanded(step.id) }"
        >
          <div class="accordion-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width: 40%">Question</th>
                    <th>Answer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="question in step.questions" :key="question.id">
                    <td class="align-middle">
                      <div class="question-label">{{ question.label }}</div>
                      <div class="question-type small text-muted">{{ formatQuestionType(question.type) }}</div>
                    </td>
                    <td class="align-middle">
                      <div class="question-answer">
                        <!-- Display answer based on question type -->
                        <div v-if="question.type === 'rating'">
                          <div class="d-flex align-items-center">
                            <div class="rating-value me-2">
                              <span class="badge" :class="getRatingBadgeClass(question.answer, question.max_value)">
                                {{ question.answer }}
                              </span>
                            </div>
                            <div class="rating-max text-muted">
                              / {{ question.max_value || 5 }}
                            </div>
                          </div>
                        </div>

                        <div v-else-if="question.type === 'nps'">
                          <div class="d-flex align-items-center mb-1">
                            <div class="rating-value me-2">
                              <span class="badge" :class="getNpsBadgeClass(question.answer)">
                                {{ question.answer }}
                              </span>
                            </div>
                            <div class="rating-category text-muted">
                              {{ getNpsCategory(question.answer) }}
                            </div>
                          </div>
                          <div v-if="question.comment" class="nps-comment">
                            {{ question.comment }}
                          </div>
                        </div>

                        <div v-else-if="question.type === 'checkbox' || Array.isArray(question.answer)">
                          <div class="checkbox-answers">
                            <ul class="list-unstyled mb-0">
                              <li v-for="(item, index) in question.answer" :key="index">
                                <i class="bi bi-check-circle-fill text-success me-1"></i> {{ item }}
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div v-else-if="question.type === 'file'">
                          <div class="file-answer">
                            <a href="#" class="text-decoration-none">
                              <i class="bi bi-file-earmark me-1"></i> {{ getFileName(question.answer) }}
                            </a>
                          </div>
                        </div>

                        <div v-else-if="question.type === 'textarea' && question.answer && question.answer.length > 100">
                          <div class="textarea-answer">
                            {{ question.answer }}
                          </div>
                        </div>

                        <div v-else-if="!question.answer && question.answer !== 0">
                          <span class="text-muted">No answer provided</span>
                        </div>

                        <div v-else>
                          {{ question.answer }}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseAnswers',
  props: {
    response: {
      type: Object,
      required: true
    },
    expandedSteps: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle-step'],
  methods: {
    isStepExpanded(stepId) {
      return this.expandedSteps.includes(stepId);
    },

    toggleStep(stepId) {
      this.$emit('toggle-step', stepId);
    },

    formatQuestionType(type) {
      const types = {
        'text': 'Text',
        'textarea': 'Long Text',
        'email': 'Email',
        'number': 'Number',
        'checkbox': 'Checkbox',
        'radio': 'Radio Button',
        'dropdown': 'Dropdown',
        'rating': 'Rating',
        'nps': 'NPS',
        'file': 'File Upload',
        'date': 'Date',
        'time': 'Time'
      };

      return types[type] || type;
    },

    getRatingBadgeClass(value, max) {
      const percentage = (value / (max || 5)) * 100;

      if (percentage >= 80) return 'bg-success';
      if (percentage >= 60) return 'bg-primary';
      if (percentage >= 40) return 'bg-info';
      if (percentage >= 20) return 'bg-warning text-dark';
      return 'bg-danger';
    },

    getNpsBadgeClass(score) {
      if (score >= 9) return 'bg-success';
      if (score >= 7) return 'bg-primary';
      if (score >= 4) return 'bg-warning text-dark';
      return 'bg-danger';
    },

    getNpsCategory(score) {
      if (score >= 9) return 'Promoter';
      if (score >= 7) return 'Passive';
      return 'Detractor';
    },

    getFileName(file) {
      if (!file) return '';

      if (typeof file === 'string') {
        return file.split('/').pop();
      }

      return 'Attached file';
    }
  }
}
</script>

<style scoped>
.question-answer {
  white-space: pre-wrap;
}

.textarea-answer {
  max-height: 150px;
  overflow-y: auto;
  background-color: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
}

.nps-comment {
  font-style: italic;
  color: #6c757d;
  margin-top: 0.25rem;
}
</style>
<template>
  <BaseFormField
    :field="field"
    :value="modelValue"
    :error-message="errorMessage"
    :is-preview="isPreview"
    @edit="$emit('edit', field)"
    @duplicate="$emit('duplicate', field)"
    @delete="$emit('delete', field)"
  >
    <div class="nps-container">
      <div v-if="settings.showLabels" class="nps-labels d-flex justify-content-between mb-2">
        <div class="nps-label-min">{{ settings.detractorLabel || 'Not at all likely' }}</div>
        <div class="nps-label-max">{{ settings.promoterLabel || 'Extremely likely' }}</div>
      </div>

      <div class="nps-options">
        <div
          v-for="value in 11"
          :key="value - 1"
          class="nps-option"
          :class="{
            'selected': modelValue === value - 1,
            'detractor': value - 1 <= 6,
            'passive': value - 1 === 7 || value - 1 === 8,
            'promoter': value - 1 >= 9
          }"
          @click="updateValue(value - 1)"
        >
          <span class="nps-value">{{ value - 1 }}</span>
        </div>
      </div>

      <div v-if="modelValue !== null" class="text-center mt-3">
        <div class="selected-value">
          <span class="badge" :class="npsScoreClass">{{ npsCategory }}</span>
          Selected: <strong>{{ modelValue }}</strong>
        </div>
      </div>
    </div>

    <div v-if="settings.showFollowUp && modelValue !== null" class="mt-4">
      <label for="nps-followup" class="form-label">{{ followUpQuestion }}</label>
      <textarea
        id="nps-followup"
        class="form-control"
        rows="3"
        :placeholder="followUpPlaceholder"
        v-model="followUpResponse"
        @input="updateFollowUp"
      ></textarea>
    </div>
  </BaseFormField>
</template>

<script>
import BaseFormField from '../BaseFormField.vue'
import { ref, computed, watch } from 'vue'

export default {
  name: 'NPSField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [Number, Object],
      default: null
    },
    errorMessage: {
      type: String,
      default: ''
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'edit', 'duplicate', 'delete'],

  setup(props, { emit }) {
    // Local state for follow-up response
    const followUpResponse = ref('')

    // Access the field settings with defaults
    const settings = computed(() => {
      return props.field.settings || {
        showLabels: true,
        detractorLabel: 'Not at all likely',
        promoterLabel: 'Extremely likely',
        showFollowUp: true
      }
    })

    // Determine NPS category based on score
    const npsCategory = computed(() => {
      if (props.modelValue === null) return ''

      if (props.modelValue <= 6) return 'Detractor'
      if (props.modelValue <= 8) return 'Passive'
      return 'Promoter'
    })

    // CSS class for the badge
    const npsScoreClass = computed(() => {
      if (props.modelValue === null) return ''

      if (props.modelValue <= 6) return 'bg-danger'
      if (props.modelValue <= 8) return 'bg-warning text-dark'
      return 'bg-success'
    })

    // Dynamic follow-up question based on NPS score
    const followUpQuestion = computed(() => {
      if (props.modelValue === null) return ''

      if (props.modelValue <= 6) {
        return 'What could we do to improve your experience?'
      } else if (props.modelValue <= 8) {
        return 'What would it take for us to earn a higher score?'
      } else {
        return 'What do you appreciate most about our service?'
      }
    })

    // Dynamic placeholder text
    const followUpPlaceholder = computed(() => {
      if (props.modelValue === null) return ''

      if (props.modelValue <= 6) {
        return 'Please share what issues you encountered...'
      } else if (props.modelValue <= 8) {
        return 'Please tell us what we could improve...'
      } else {
        return 'Please tell us what you liked most...'
      }
    })

    // Update the score when clicked
    const updateValue = (value) => {
      if (props.isPreview && props.field.settings?.disabled) return

      // If we're already storing an object with comment
      if (typeof props.modelValue === 'object' && props.modelValue !== null) {
        emit('update:modelValue', {
          score: value,
          comment: props.modelValue.comment
        })
      } else {
        // If settings show follow-up, store as object
        if (settings.value.showFollowUp) {
          emit('update:modelValue', {
            score: value,
            comment: ''
          })
        } else {
          // Otherwise just store the score
          emit('update:modelValue', value)
        }
      }
    }

    // Update the follow-up comment
    const updateFollowUp = () => {
      if (typeof props.modelValue === 'object' && props.modelValue !== null) {
        emit('update:modelValue', {
          score: props.modelValue.score,
          comment: followUpResponse.value
        })
      }
    }

    // Watch for changes in the modelValue to update local state
    watch(() => props.modelValue, (newVal) => {
      if (typeof newVal === 'object' && newVal !== null) {
        followUpResponse.value = newVal.comment || ''
      } else {
        followUpResponse.value = ''
      }
    }, { immediate: true })

    return {
      settings,
      npsCategory,
      npsScoreClass,
      followUpQuestion,
      followUpPlaceholder,
      followUpResponse,
      updateValue,
      updateFollowUp
    }
  }
}
</script>

<style scoped>
.nps-options {
  display: flex;
  justify-content: space-between;
  margin: 0 -0.125rem;
}

.nps-option {
  flex: 1;
  margin: 0 0.125rem;
  height: 2.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nps-option:hover {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.nps-option.selected {
  font-weight: bold;
}

/* NPS specific styling */
.nps-option.detractor {
  background-color: #fff5f5;
  border-color: #fee2e2;
}

.nps-option.passive {
  background-color: #fffbeb;
  border-color: #fef3c7;
}

.nps-option.promoter {
  background-color: #f0fdf4;
  border-color: #dcfce7;
}

.nps-option.selected.detractor {
  background-color: #ef4444;
  border-color: #dc2626;
  color: white;
}

.nps-option.selected.passive {
  background-color: #f59e0b;
  border-color: #d97706;
  color: white;
}

.nps-option.selected.promoter {
  background-color: #10b981;
  border-color: #059669;
  color: white;
}

.selected-value {
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  display: inline-block;
}
</style>
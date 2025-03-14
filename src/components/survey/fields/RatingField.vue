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
    <div class="rating-container">
      <div v-if="settings.showLabels" class="rating-labels d-flex justify-content-between mb-2">
        <div class="rating-label-min">{{ settings.minLabel || 'Poor' }}</div>
        <div class="rating-label-max">{{ settings.maxLabel || 'Excellent' }}</div>
      </div>

      <div class="rating-options">
        <div
          v-for="value in ratingOptions"
          :key="value"
          class="rating-option"
          :class="{ 'selected': modelValue === value }"
          @click="updateValue(value)"
        >
          <span class="rating-value">{{ value }}</span>
        </div>
      </div>

      <div v-if="modelValue !== null" class="text-center mt-2">
        Selected value: <strong>{{ modelValue }}</strong>
      </div>
    </div>
  </BaseFormField>
</template>

<script>
import BaseFormField from '../BaseFormField.vue'

export default {
  name: 'RatingField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Number,
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

  computed: {
    settings() {
      return this.field.settings || {
        min: 0,
        max: 10,
        step: 1,
        showLabels: true,
        minLabel: 'Poor',
        maxLabel: 'Excellent'
      }
    },

    ratingOptions() {
      const values = []
      const min = parseInt(this.settings.min || 0)
      const max = parseInt(this.settings.max || 10)
      const step = parseInt(this.settings.step || 1)

      for (let i = min; i <= max; i += step) {
        values.push(i)
      }

      return values
    }
  },

  methods: {
    updateValue(value) {
      if (!this.isPreview || !this.field.settings?.disabled) {
        this.$emit('update:modelValue', value)
      }
    },

    handleFocus() {
      this.$emit('focus', this.field)
    },

    handleBlur() {
      this.$emit('blur', this.field)
    }
  }
}
</script>

<style scoped>
.rating-options {
  display: flex;
  justify-content: space-between;
  margin: 0 -0.25rem;
}

.rating-option {
  flex: 1;
  margin: 0 0.25rem;
  height: 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rating-option:hover {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.rating-option.selected {
  background-color: #4361ee;
  border-color: #4361ee;
  color: white;
  font-weight: bold;
}

/* NPS-specific styling */
.rating-option.detractor {
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.rating-option.passive {
  background-color: #fff3cd;
  border-color: #ffecb5;
}

.rating-option.promoter {
  background-color: #d1e7dd;
  border-color: #badbcc;
}

.rating-option.selected.detractor {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.rating-option.selected.passive {
  background-color: #ffc107;
  border-color: #ffc107;
  color: black;
}

.rating-option.selected.promoter {
  background-color: #198754;
  border-color: #198754;
  color: white;
}
</style>
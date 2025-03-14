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
    <div class="checkbox-field">
      <div v-if="useImages" class="image-options">
        <div class="row row-cols-2 row-cols-md-3 g-3">
          <div
            v-for="option in options"
            :key="option.id"
            class="col"
          >
            <div
              class="image-option"
              :class="{ 'selected': isOptionSelected(option.value) }"
              @click="toggleOption(option.value)"
            >
              <div class="image-container">
                <img
                  v-if="option.imageUrl"
                  :src="option.imageUrl"
                  :alt="option.label"
                  class="option-image"
                >
                <div v-else class="image-placeholder">
                  <i class="bi bi-image"></i>
                </div>
              </div>
              <div class="option-label p-2">
                <div class="form-check mb-0">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'option-' + field.id + '-' + option.id"
                    :checked="isOptionSelected(option.value)"
                    @change="toggleOption(option.value)"
                    :disabled="isPreview && field.settings?.disabled"
                  >
                  <label class="form-check-label" :for="'option-' + field.id + '-' + option.id">
                    {{ option.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="standard-options">
        <div
          v-for="option in options"
          :key="option.id"
          class="form-check mb-2"
        >
          <input
            class="form-check-input"
            type="checkbox"
            :id="'option-' + field.id + '-' + option.id"
            :checked="isOptionSelected(option.value)"
            @change="toggleOption(option.value)"
            :disabled="isPreview && field.settings?.disabled"
          >
          <label class="form-check-label" :for="'option-' + field.id + '-' + option.id">
            {{ option.label }}
          </label>
        </div>

        <!-- Other option with text input -->
        <div v-if="hasOtherOption" class="form-check mb-2">
          <input
            class="form-check-input"
            type="checkbox"
            :id="'option-' + field.id + '-other'"
            :checked="hasOtherValue"
            @change="toggleOtherOption"
            :disabled="isPreview && field.settings?.disabled"
          >
          <label class="form-check-label d-flex align-items-center" :for="'option-' + field.id + '-other'">
            <span class="me-2">Other:</span>
            <input
              type="text"
              class="form-control form-control-sm other-input"
              v-model="otherValue"
              @focus="focusOtherOption"
              @input="updateOtherValue"
              :disabled="isPreview && field.settings?.disabled"
              placeholder="Please specify"
            >
          </label>
        </div>
      </div>

      <!-- Selected count -->
      <div v-if="selectedCount > 0" class="selected-count mt-2">
        <small class="text-muted">
          {{ selectedCount }} {{ selectedCount === 1 ? 'option' : 'options' }} selected
        </small>
      </div>

      <!-- Min/max selection info -->
      <div v-if="hasSelectionConstraints" class="selection-constraints mt-1">
        <small class="text-muted">
          {{ selectionConstraintsText }}
        </small>
      </div>

      <!-- Help text -->
      <div v-if="field.settings && field.settings.helpText" class="form-text mt-2">
        {{ field.settings.helpText }}
      </div>
    </div>
  </BaseFormField>
</template>

<script>
import { ref, computed, watch } from 'vue'
import BaseFormField from '../BaseFormField.vue'

export default {
  name: 'CheckboxField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
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
  emits: ['update:modelValue', 'edit', 'duplicate', 'delete', 'focus', 'blur'],

  setup(props, { emit }) {
    // For "Other" option
    const otherValue = ref('')

    // Check if this is an image-based checkbox group
    const useImages = computed(() => {
      return props.field.settings?.useImages === true
    })

    // Check if this has an "Other" option
    const hasOtherOption = computed(() => {
      return props.field.settings?.hasOtherOption === true
    })

    // Get checkbox options with defaults
    const options = computed(() => {
      return props.field.settings?.options || []
    })

    // Check if min/max selection constraints are set
    const hasSelectionConstraints = computed(() => {
      return props.field.settings?.minSelect || props.field.settings?.maxSelect
    })

    // Text for min/max selection constraints
    const selectionConstraintsText = computed(() => {
      const minSelect = props.field.settings?.minSelect
      const maxSelect = props.field.settings?.maxSelect

      if (minSelect && maxSelect) {
        return `Please select between ${minSelect} and ${maxSelect} options.`
      } else if (minSelect) {
        return `Please select at least ${minSelect} options.`
      } else if (maxSelect) {
        return `Please select at most ${maxSelect} options.`
      }

      return ''
    })

    // Count of selected options
    const selectedCount = computed(() => {
      return Array.isArray(props.modelValue) ? props.modelValue.length : 0
    })

    // Check if a specific option is selected
    const isOptionSelected = (value) => {
      if (!Array.isArray(props.modelValue)) return false

      return props.modelValue.some(item => {
        // Handle both simple values and objects (for "Other")
        if (typeof item === 'object') {
          return item.value === value
        }
        return item === value
      })
    }

    // Check if "Other" option has a value
    const hasOtherValue = computed(() => {
      if (!Array.isArray(props.modelValue)) return false

      return props.modelValue.some(item => typeof item === 'object' && item.isOther)
    })

    // Watch for external changes
    watch(() => props.modelValue, (newValue) => {
      if (Array.isArray(newValue)) {
        // Find the "Other" value if it exists
        const otherItem = newValue.find(item => typeof item === 'object' && item.isOther)
        if (otherItem) {
          otherValue.value = otherItem.value || ''
        }
      }
    }, { immediate: true })

    // Toggle a regular option
    const toggleOption = (value) => {
      if (isPreview.value && props.field.settings?.disabled) return

      // Initialize as empty array if undefined
      const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []

      if (isOptionSelected(value)) {
        // Remove the option
        const newValue = currentValue.filter(item => {
          if (typeof item === 'object') {
            return item.value !== value
          }
          return item !== value
        })
        emit('update:modelValue', newValue)
      } else {
        // Check max selection constraint
        const maxSelect = props.field.settings?.maxSelect
        if (maxSelect && currentValue.length >= maxSelect) {
          // Can't select more options
          return
        }

        // Add the option
        emit('update:modelValue', [...currentValue, value])
      }
    }

    // Toggle the "Other" option
    const toggleOtherOption = () => {
      if (isPreview.value && props.field.settings?.disabled) return

      // Initialize as empty array if undefined
      const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []

      if (hasOtherValue.value) {
        // Remove the "Other" option
        const newValue = currentValue.filter(item => !(typeof item === 'object' && item.isOther))
        emit('update:modelValue', newValue)
        otherValue.value = '' // Clear the text input
      } else {
        // Check max selection constraint
        const maxSelect = props.field.settings?.maxSelect
        if (maxSelect && currentValue.length >= maxSelect) {
          // Can't select more options
          return
        }

        // Add the "Other" option
        const otherOption = { isOther: true, value: otherValue.value }
        emit('update:modelValue', [...currentValue, otherOption])
      }
    }

    // Focus on the "Other" text input
    const focusOtherOption = () => {
      if (isPreview.value && props.field.settings?.disabled) return

      if (!hasOtherValue.value) {
        toggleOtherOption() // Select the "Other" option when focusing on its input
      }
    }

    // Update the "Other" value
    const updateOtherValue = () => {
      if (isPreview.value && props.field.settings?.disabled) return

      if (!hasOtherValue.value) {
        focusOtherOption()
        return
      }

      // Initialize as empty array if undefined
      const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []

      // Find and update the "Other" option
      const newValue = currentValue.map(item => {
        if (typeof item === 'object' && item.isOther) {
          return { isOther: true, value: otherValue.value }
        }
        return item
      })

      emit('update:modelValue', newValue)
    }

    return {
      useImages,
      hasOtherOption,
      options,
      otherValue,
      hasSelectionConstraints,
      selectionConstraintsText,
      selectedCount,
      hasOtherValue,
      isOptionSelected,
      toggleOption,
      toggleOtherOption,
      focusOtherOption,
      updateOtherValue
    }
  }
}
</script>

<style scoped>
.image-option {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-option:hover {
  border-color: #b8c2cc;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.image-option.selected {
  border-color: #4361ee;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.25);
}

.image-container {
  aspect-ratio: 16 / 9;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.option-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: #adb5bd;
  font-size: 2rem;
}

.option-label {
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.other-input {
  width: auto;
  flex: 1;
}

.selected-count {
  text-align: right;
}
</style>
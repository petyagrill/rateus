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
    <div class="radio-field">
      <div v-if="useImages" class="image-options">
        <div class="row row-cols-2 row-cols-md-3 g-3">
          <div
            v-for="option in options"
            :key="option.id"
            class="col"
          >
            <div
              class="image-option"
              :class="{ 'selected': modelValue === option.value }"
              @click="updateValue(option.value)"
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
                    type="radio"
                    :name="'field-' + field.id"
                    :id="'option-' + field.id + '-' + option.id"
                    :checked="modelValue === option.value"
                    @change="updateValue(option.value)"
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
            type="radio"
            :name="'field-' + field.id"
            :id="'option-' + field.id + '-' + option.id"
            :value="option.value"
            :checked="modelValue === option.value"
            @change="updateValue(option.value)"
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
            type="radio"
            :name="'field-' + field.id"
            :id="'option-' + field.id + '-other'"
            :checked="isOtherSelected"
            @change="selectOtherOption"
            :disabled="isPreview && field.settings?.disabled"
          >
          <label class="form-check-label d-flex align-items-center" :for="'option-' + field.id + '-other'">
            <span class="me-2">Other:</span>
            <input
              type="text"
              class="form-control form-control-sm other-input"
              v-model="otherValue"
              @focus="selectOtherOption"
              @input="updateOtherValue"
              :disabled="isPreview && field.settings?.disabled"
              placeholder="Please specify"
            >
          </label>
        </div>
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
  name: 'RadioField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Number, Object, null],
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
  emits: ['update:modelValue', 'edit', 'duplicate', 'delete', 'focus', 'blur'],

  setup(props, { emit }) {
    // Check if this is an image-based radio button group
    const useImages = computed(() => {
      return props.field.settings?.useImages === true
    })

    // Check if this has an "Other" option
    const hasOtherOption = computed(() => {
      return props.field.settings?.hasOtherOption === true
    })

    // Get radio options with defaults
    const options = computed(() => {
      return props.field.settings?.options || []
    })

    // For "Other" option
    const otherValue = ref('')

    // Check if "Other" option is currently selected
    const isOtherSelected = computed(() => {
      if (!props.modelValue) return false

      if (typeof props.modelValue === 'object' && props.modelValue.isOther) {
        return true
      }

      // Check if value is not in predefined options
      return !options.value.some(option => option.value === props.modelValue)
    })

    // Watch for external changes
    watch(() => props.modelValue, (newValue) => {
      if (typeof newValue === 'object' && newValue?.isOther) {
        otherValue.value = newValue.value || ''
      }
    }, { immediate: true })

    // Update the model value
    const updateValue = (value) => {
      if (!isPreview.value || !props.field.settings?.disabled) {
        emit('update:modelValue', value)
      }
    }

    // Select the "Other" option
    const selectOtherOption = () => {
      if (isPreview.value && props.field.settings?.disabled) return

      // Create an object to represent "Other" selection
      const otherSelection = {
        isOther: true,
        value: otherValue.value
      }

      emit('update:modelValue', otherSelection)
    }

    // Update the "Other" value
    const updateOtherValue = () => {
      if (isPreview.value && props.field.settings?.disabled) return

      // If other is not already selected, select it
      if (!isOtherSelected.value) {
        selectOtherOption()
        return
      }

      // Update the "Other" value while keeping the isOther flag
      emit('update:modelValue', {
        isOther: true,
        value: otherValue.value
      })
    }

    return {
      useImages,
      hasOtherOption,
      options,
      otherValue,
      isOtherSelected,
      updateValue,
      selectOtherOption,
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
</style>
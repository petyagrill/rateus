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
    <div class="dropdown-field">
      <!-- Single selection dropdown -->
      <select
        v-if="!isMultiple"
        :id="'field-' + field.id"
        class="form-select"
        :class="{ 'is-invalid': errorMessage }"
        v-model="localValue"
        @focus="handleFocus"
        @blur="handleBlur"
        :disabled="isPreview && field.settings?.disabled"
        :required="field.required"
      >
        <option value="" disabled selected>{{ field.placeholder || 'Select an option' }}</option>
        <option
          v-for="option in options"
          :key="option.id"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Multiple selection dropdown -->
      <select
        v-else
        :id="'field-' + field.id"
        class="form-select"
        :class="{ 'is-invalid': errorMessage }"
        v-model="localValue"
        @focus="handleFocus"
        @blur="handleBlur"
        :disabled="isPreview && field.settings?.disabled"
        :required="field.required"
        multiple
      >
        <option
          v-for="option in options"
          :key="option.id"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Selected count for multiple selection -->
      <div v-if="isMultiple && localValue && localValue.length > 0" class="selected-count mt-1">
        <small class="text-muted">
          {{ localValue.length }} {{ localValue.length === 1 ? 'option' : 'options' }} selected
        </small>
      </div>

      <!-- Help text -->
      <div v-if="field.settings && field.settings.helpText" class="form-text">
        {{ field.settings.helpText }}
      </div>
    </div>
  </BaseFormField>
</template>

<script>
import { ref, computed, watch } from 'vue'
import BaseFormField from '../BaseFormField.vue'

export default {
  name: 'DropdownField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Number, Array, null],
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
    // Local value for v-model binding
    const localValue = ref(props.modelValue)

    // Check if this is a multiple selection dropdown
    const isMultiple = computed(() => {
      return props.field.settings?.multiple === true
    })

    // Get dropdown options with defaults
    const options = computed(() => {
      return props.field.settings?.options || []
    })

    // Watch for external changes to modelValue
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue
    })

    // Watch for local changes to update the parent
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue)
    })

    // Focus and blur event handlers
    const handleFocus = () => {
      emit('focus', props.field)
    }

    const handleBlur = () => {
      emit('blur', props.field)
    }

    return {
      localValue,
      isMultiple,
      options,
      handleFocus,
      handleBlur
    }
  }
}
</script>

<style scoped>
/* For multiple select, increase the height to show more options */
select[multiple] {
  height: auto;
  min-height: 100px;
}

.selected-count {
  text-align: right;
}
</style>
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
    <div class="textarea-field">
      <textarea
        :id="'field-' + field.id"
        class="form-control"
        :class="{ 'is-invalid': errorMessage }"
        :placeholder="field.placeholder || ''"
        :value="modelValue"
        @input="updateValue($event.target.value)"
        @focus="handleFocus"
        @blur="handleBlur"
        :disabled="isPreview && field.settings?.disabled"
        :required="field.required"
        :rows="rows"
        :maxlength="maxLength"
      ></textarea>

      <div class="d-flex justify-content-between mt-1">
        <!-- Character count -->
        <div v-if="showCharCount" class="char-count small text-muted">
          {{ currentLength }} / {{ maxLength }} characters
        </div>

        <!-- Resizable control -->
        <div v-if="isResizable" class="resizer-control ms-auto">
          <button
            type="button"
            class="btn btn-sm btn-link text-muted p-0"
            @click="increaseRows"
            :disabled="rows >= maxRows"
          >
            <i class="bi bi-arrows-angle-expand"></i>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-link text-muted p-0 ms-1"
            @click="decreaseRows"
            :disabled="rows <= minRows"
          >
            <i class="bi bi-arrows-angle-contract"></i>
          </button>
        </div>
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
  name: 'TextareaField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
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
    // Default number of rows for the textarea
    const defaultRows = computed(() => props.field.settings?.rows || 4)
    const minRows = computed(() => props.field.settings?.minRows || 2)
    const maxRows = computed(() => props.field.settings?.maxRows || 10)

    // Current rows state
    const rows = ref(defaultRows.value)

    // Check if textarea should be resizable
    const isResizable = computed(() => {
      return props.field.settings?.resizable !== false
    })

    // Check if character count should be shown
    const showCharCount = computed(() => {
      return props.field.settings?.showCharCount === true ||
        (props.field.settings?.maxLength && props.field.settings?.maxLength > 0)
    })

    // Get the max length constraint
    const maxLength = computed(() => {
      return props.field.settings?.maxLength || 0
    })

    // Current length of the input
    const currentLength = computed(() => {
      return props.modelValue ? props.modelValue.length : 0
    })

    // Update the model value
    const updateValue = (value) => {
      if (!isPreview.value || !props.field.settings?.disabled) {
        emit('update:modelValue', value)
      }
    }

    // Handle focus event
    const handleFocus = () => {
      emit('focus', props.field)
    }

    // Handle blur event
    const handleBlur = () => {
      emit('blur', props.field)
    }

    // Increase the number of rows
    const increaseRows = () => {
      if (rows.value < maxRows.value) {
        rows.value++
      }
    }

    // Decrease the number of rows
    const decreaseRows = () => {
      if (rows.value > minRows.value) {
        rows.value--
      }
    }

    return {
      rows,
      isResizable,
      minRows,
      maxRows,
      showCharCount,
      maxLength,
      currentLength,
      updateValue,
      handleFocus,
      handleBlur,
      increaseRows,
      decreaseRows
    }
  }
}
</script>

<style scoped>
.textarea-field textarea {
  resize: vertical;
}

.char-count {
  min-height: 24px;
}
</style>
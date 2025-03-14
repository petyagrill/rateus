<template>
  <div
    class="form-field"
    :class="{
      'is-required': field.required,
      'is-focused': isFocused,
      'is-preview': isPreview
    }"
  >
    <div v-if="!isPreview" class="field-actions">
      <div class="btn-group btn-group-sm">
        <button
          type="button"
          class="btn btn-light"
          @click="$emit('edit', field)"
          title="Edit field"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          type="button"
          class="btn btn-light"
          @click="$emit('duplicate', field)"
          title="Duplicate field"
        >
          <i class="bi bi-files"></i>
        </button>
        <button
          type="button"
          class="btn btn-light text-danger"
          @click="$emit('delete', field)"
          title="Delete field"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
      <div class="handle ms-2" title="Drag to reorder">
        <i class="bi bi-grip-vertical"></i>
      </div>
    </div>

    <div class="field-container">
      <label v-if="field.label" :for="fieldId" class="form-label">
        {{ field.label }} <small>[{{field.type}}]</small>
        <span v-if="field.required" class="text-danger ms-1">*</span>
      </label>

      <div class="field-description text-muted mb-2" v-if="field.description">
        {{ field.description }}
      </div>

      <!-- Field content will be different for each field type -->
      <slot></slot><pre>
        {{field.settings}}
      </pre>
      <div
        v-if="errorMessage"
        class="invalid-feedback d-block"
      >
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseFormField',
  props: {
    field: {
      type: Object,
      required: true
    },
    value: {
      type: [String, Number, Boolean, Array, Object],
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
  emits: ['update:value', 'edit', 'duplicate', 'delete', 'focus', 'blur'],

  data() {
    return {
      isFocused: false
    }
  },

  computed: {
    fieldId() {
      return `field-${this.field.id}`
    }
  },

  methods: {
    handleFocus() {
      this.isFocused = true
      this.$emit('focus', this.field)
    },

    handleBlur() {
      this.isFocused = false
      this.$emit('blur', this.field)
    },

    updateValue(val) {
      this.$emit('update:value', val)
    }
  }
}
</script>

<style scoped>
.form-field {
  position: relative;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #fff;
  transition: all 0.3s ease;
}

.form-field:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.form-field.is-focused {
  border-color: #4361ee;
  box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.25);
}

.field-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.form-field:hover .field-actions {
  opacity: 1;
}

.handle {
  cursor: grab;
  color: #adb5bd;
}

.handle:active {
  cursor: grabbing;
}

.field-container {
  padding-right: 2rem;
}

.is-preview .field-container {
  padding-right: 0;
}
</style>
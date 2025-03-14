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
    <div class="input-group">
      <span
        v-if="field.settings && field.settings.prefix"
        class="input-group-text"
      >
        {{ field.settings.prefix }}
      </span>

      <input
        :id="'field-' + field.id"
        :type="inputType"
        class="form-control"
        :class="{ 'is-invalid': errorMessage }"
        :placeholder="field.placeholder || ''"
        :value="modelValue"
        @input="updateValue($event.target.value)"
        @focus="handleFocus"
        @blur="handleBlur"
        :disabled="isPreview && field.settings?.disabled"
        :min="field.settings?.min"
        :max="field.settings?.max"
        :step="field.settings?.step"
        :pattern="field.settings?.pattern"
        :required="field.required"
      />

      <span
        v-if="field.settings && field.settings.suffix"
        class="input-group-text"
      >
        {{ field.settings.suffix }}
      </span>
    </div>

    <div v-if="field.settings && field.settings.helpText" class="form-text">
      {{ field.settings.helpText }}
    </div>
  </BaseFormField>
</template>

<script>
import BaseFormField from '../BaseFormField.vue'

export default {
  name: 'TextField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [String, Number],
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
  emits: ['update:modelValue', 'edit', 'duplicate', 'delete'],

  computed: {
    inputType() {
      // Map field.type to HTML input type
      const typeMap = {
        'text': 'text',
        'email': 'email',
        'number': 'number',
        'phone': 'tel',
        'date': 'date',
        'password': 'password',
        'url': 'url'
      }

      return typeMap[this.field.type] || 'text'
    }
  },

  methods: {
    updateValue(value) {
      // For number inputs, convert the string value to a number
      if (this.field.type === 'number' && value !== '') {
        value = parseFloat(value)
      }

      this.$emit('update:modelValue', value)
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
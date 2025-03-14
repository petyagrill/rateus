<template>
  <div class="field-editor-modal modal" v-if="show">
    <div class="modal-backdrop" @click="closeModal"></div>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ isNewField ? 'Add New Field' : 'Edit Field' }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveField">
            <!-- Basic Field Properties -->
            <div class="mb-3">
              <label for="fieldLabel" class="form-label">Question Label*</label>
              <input
                type="text"
                class="form-control"
                id="fieldLabel"
                v-model="editedField.label"
                required
              >
            </div>

            <div class="mb-3">
              <label for="fieldType" class="form-label">Field Type</label>
              <select
                class="form-select"
                id="fieldType"
                v-model="editedField.type"
                :disabled="!isNewField"
              >
                <option
                  v-for="type in fieldTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.name }}
                </option>
              </select>
              <div class="form-text" v-if="!isNewField">Field type cannot be changed after creation.</div>
            </div>

            <div class="mb-3">
              <label for="fieldPlaceholder" class="form-label">Placeholder Text</label>
              <input
                type="text"
                class="form-control"
                id="fieldPlaceholder"
                v-model="editedField.placeholder"
              >
            </div>

            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="fieldRequired"
                v-model="editedField.required"
              >
              <label class="form-check-label" for="fieldRequired">Required field</label>
            </div>

            <div class="mb-3">
              <label for="fieldDescription" class="form-label">Help Text</label>
              <textarea
                class="form-control"
                id="fieldDescription"
                v-model="editedField.description"
                rows="2"
              ></textarea>
            </div>

            <!-- Type-specific settings -->
            <div v-if="showOptionsEditor" class="mb-4">
              <label class="form-label">Options</label>
              <div
                v-for="(option, index) in editedField.settings.options"
                :key="index"
                class="input-group mb-2"
              >
                <input
                  type="text"
                  class="form-control"
                  placeholder="Option Label"
                  v-model="option.label"
                >
                <button
                  type="button"
                  class="btn btn-outline-danger"
                  @click="removeOption(index)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="addOption"
              >
                <i class="bi bi-plus-circle me-1"></i> Add Option
              </button>
            </div>

            <!-- Rating settings -->
            <div v-if="editedField.type === 'rating'" class="mb-4">
              <div class="row">
                <div class="col-md-4">
                  <label for="ratingMin" class="form-label">Min Value</label>
                  <input
                    type="number"
                    class="form-control"
                    id="ratingMin"
                    v-model.number="editedField.settings.min"
                    min="0"
                  >
                </div>
                <div class="col-md-4">
                  <label for="ratingMax" class="form-label">Max Value</label>
                  <input
                    type="number"
                    class="form-control"
                    id="ratingMax"
                    v-model.number="editedField.settings.max"
                    min="1"
                  >
                </div>
                <div class="col-md-4">
                  <label for="ratingStep" class="form-label">Step</label>
                  <input
                    type="number"
                    class="form-control"
                    id="ratingStep"
                    v-model.number="editedField.settings.step"
                    min="1"
                  >
                </div>
              </div>

              <div class="mt-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="showLabels"
                  v-model="editedField.settings.showLabels"
                >
                <label class="form-check-label" for="showLabels">Show min/max labels</label>
              </div>

              <div v-if="editedField.settings.showLabels" class="row mt-2">
                <div class="col-md-6">
                  <label for="minLabel" class="form-label">Min Label</label>
                  <input
                    type="text"
                    class="form-control"
                    id="minLabel"
                    v-model="editedField.settings.minLabel"
                  >
                </div>
                <div class="col-md-6">
                  <label for="maxLabel" class="form-label">Max Label</label>
                  <input
                    type="text"
                    class="form-control"
                    id="maxLabel"
                    v-model="editedField.settings.maxLabel"
                  >
                </div>
              </div>
            </div>

            <!-- NPS settings -->
            <div v-if="editedField.type === 'nps'" class="mb-4">
              <div class="form-check mb-3">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="npsShowLabels"
                  v-model="editedField.settings.showLabels"
                >
                <label class="form-check-label" for="npsShowLabels">Show labels</label>
              </div>

              <div v-if="editedField.settings.showLabels" class="row">
                <div class="col-md-6">
                  <label for="detractorLabel" class="form-label">Detractor Label</label>
                  <input
                    type="text"
                    class="form-control"
                    id="detractorLabel"
                    v-model="editedField.settings.detractorLabel"
                    placeholder="Not at all likely"
                  >
                </div>
                <div class="col-md-6">
                  <label for="promoterLabel" class="form-label">Promoter Label</label>
                  <input
                    type="text"
                    class="form-control"
                    id="promoterLabel"
                    v-model="editedField.settings.promoterLabel"
                    placeholder="Extremely likely"
                  >
                </div>
              </div>

              <div class="form-check mt-3">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="npsShowFollowUp"
                  v-model="editedField.settings.showFollowUp"
                >
                <label class="form-check-label" for="npsShowFollowUp">Allow follow-up comment</label>
              </div>
            </div>

            <!-- File upload settings -->
            <div v-if="editedField.type === 'file'" class="mb-4">
              <div class="mb-3">
                <label for="allowedTypes" class="form-label">Allowed File Types</label>
                <input
                  type="text"
                  class="form-control"
                  id="allowedTypes"
                  v-model="editedField.settings.allowedTypes"
                  placeholder="image/*,.pdf"
                >
                <div class="form-text">Comma-separated list of file extensions or MIME types</div>
              </div>

              <div class="mb-3">
                <label for="maxSize" class="form-label">Max File Size (MB)</label>
                <input
                  type="number"
                  class="form-control"
                  id="maxSize"
                  v-model.number="editedField.settings.maxSize"
                  min="1"
                >
              </div>

              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="allowMultiple"
                  v-model="editedField.settings.multiple"
                >
                <label class="form-check-label" for="allowMultiple">Allow multiple files</label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveField">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useSurveyStore } from '@/store/survey'

export default {
  name: 'FieldEditorModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    field: {
      type: Object,
      default: () => null
    }
  },
  emits: ['update:show', 'save', 'cancel'],

  setup(props, { emit }) {
    const surveyStore = useSurveyStore()
    const editedField = ref({
      id: Date.now(),
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      description: '',
      settings: {}
    })

    // Available field types
    const fieldTypes = ref(surveyStore.fieldTypes)

    // Check if this is a new field
    const isNewField = computed(() => !props.field || !props.field.id)

    // Initialize edited field when show or field changes
    watch(() => [props.show, props.field], () => {
      if (props.show) {
        if (props.field) {
          // Edit existing field - deep clone to avoid direct mutation
          editedField.value = JSON.parse(JSON.stringify(props.field))
          ensureSettings()
        } else {
          // New field
          editedField.value = {
            id: Date.now(),
            type: 'text',
            label: 'New Question',
            placeholder: '',
            required: false,
            description: '',
            settings: {}
          }
          ensureSettings()
        }
      }
    }, { immediate: true })

    // Ensure settings object has all required properties for the field type
    const ensureSettings = () => {
      if (!editedField.value.settings) {
        editedField.value.settings = {}
      }

      // Initialize type-specific settings
      switch (editedField.value.type) {
        case 'dropdown':
        case 'radio':
        case 'checkbox':
          if (!editedField.value.settings.options) {
            editedField.value.settings.options = [
              { id: 1, value: 'Option 1', label: 'Option 1' },
              { id: 2, value: 'Option 2', label: 'Option 2' }
            ]
          }
          break

        case 'rating':
          if (editedField.value.settings.min === undefined) editedField.value.settings.min = 0
          if (editedField.value.settings.max === undefined) editedField.value.settings.max = 5
          if (editedField.value.settings.step === undefined) editedField.value.settings.step = 1
          if (editedField.value.settings.showLabels === undefined) editedField.value.settings.showLabels = true
          if (editedField.value.settings.minLabel === undefined) editedField.value.settings.minLabel = 'Poor'
          if (editedField.value.settings.maxLabel === undefined) editedField.value.settings.maxLabel = 'Excellent'
          break

        case 'nps':
          if (editedField.value.settings.showLabels === undefined) editedField.value.settings.showLabels = true
          if (editedField.value.settings.detractorLabel === undefined) editedField.value.settings.detractorLabel = 'Not at all likely'
          if (editedField.value.settings.promoterLabel === undefined) editedField.value.settings.promoterLabel = 'Extremely likely'
          if (editedField.value.settings.showFollowUp === undefined) editedField.value.settings.showFollowUp = true
          break

        case 'file':
          if (editedField.value.settings.allowedTypes === undefined) editedField.value.settings.allowedTypes = 'image/*,.pdf'
          if (editedField.value.settings.maxSize === undefined) editedField.value.settings.maxSize = 5
          if (editedField.value.settings.multiple === undefined) editedField.value.settings.multiple = false
          break
      }
    }

    // Check if options editor should be shown
    const showOptionsEditor = computed(() => {
      return ['dropdown', 'radio', 'checkbox'].includes(editedField.value.type)
    })

    // Add a new option
    const addOption = () => {
      if (!editedField.value.settings.options) {
        editedField.value.settings.options = []
      }

      const newId = editedField.value.settings.options.length + 1
      editedField.value.settings.options.push({
        id: newId,
        value: `Option ${newId}`,
        label: `Option ${newId}`
      })
    }

    // Remove an option
    const removeOption = (index) => {
      editedField.value.settings.options.splice(index, 1)
    }

    // Close the modal
    const closeModal = () => {
      emit('update:show', false)
      emit('cancel')
    }

    // Save the field
    const saveField = () => {
      // Validate field
      if (!editedField.value.label) {
        editedField.value.label = 'New Question'
      }

      emit('save', editedField.value)
      emit('update:show', false)
    }

    // Watch for field type changes to update settings
    watch(() => editedField.value.type, () => {
      ensureSettings()
    })

    return {
      editedField,
      fieldTypes,
      isNewField,
      showOptionsEditor,
      addOption,
      removeOption,
      closeModal,
      saveField
    }
  }
}
</script>

<style scoped>
.field-editor-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.modal-dialog {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-body {
  overflow-y: auto;
  padding: 1rem;
}
</style>
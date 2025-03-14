<template>
  <div class="survey-form-builder">
    <!-- Form builder header -->
    <div class="builder-header mb-4">
      <div class="builder-title">
        <input
            type="text"
            class="form-control form-control-lg"
            placeholder="Survey Title"
            v-model="survey.title"
        >
      </div>
      <div class="builder-description mt-2">
        <textarea
            class="form-control"
            placeholder="Survey Description (optional)"
            v-model="survey.description"
            rows="2"
        ></textarea>
      </div>
    </div>

    <!-- Steps tabs -->
    <div class="steps-container mb-4" v-if="survey.steps && survey.steps.length > 0">
      <ul class="nav nav-tabs">
        <li class="nav-item" v-for="(step, index) in survey.steps" :key="step.id">
          <button
              class="nav-link"
              :class="{ active: currentStepIndex === index }"
              @click="setCurrentStep(index)"
          >
            {{ step.title || `Step ${index + 1}` }}
          </button>
        </li>
        <li class="nav-item">
          <button
              class="nav-link add-step"
              @click="addStep"
          >
            <i class="bi bi-plus"></i> Add Step
          </button>
        </li>
      </ul>
    </div>

    <!-- Dropzone for form fields -->
    <div class="builder-content">
      <div class="row">
        <div class="col-9">
          <div v-if="currentStep" class="step-editor">
            <!-- Step header -->
            <div class="step-header mb-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Step Title</label>
                  <input
                      type="text"
                      class="form-control"
                      placeholder="Enter step title"
                      v-model="currentStep.title"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Step Description</label>
                  <input
                      type="text"
                      class="form-control"
                      placeholder="Enter step description (optional)"
                      v-model="currentStep.description"
                  >
                </div>
              </div>
            </div>

            <!-- Questions dropzone -->
            <div class="dropzone" :class="{ 'active': isDraggingField }">

              <draggable
                  v-model="currentStep.questions"
                  group="questions"
                  handle=".handle"
                  item-key="id"
                  @start="dragStart"
                  @end="dragEnd"
              >
                <template #item="{ element }">
                  <component
                      :is="getFieldComponent(element.type)"
                      :field="element"
                      :is-preview="false"
                      @edit="editField(element)"
                      @duplicate="duplicateField(element)"
                      @delete="deleteField(element)"
                  />
                </template>
              </draggable>
              <pre>
            {{ survey }}
         </pre>

              <div v-if="!currentStep.questions || currentStep.questions.length === 0" class="empty-state">
                <p class="text-center text-muted my-5">
                  <i class="bi bi-arrow-down-circle fs-2 d-block mb-3"></i>
                  Drag and drop fields here or click "Add Field" to start building your form
                </p>
              </div>
            </div>
          </div>

          <!-- No steps yet -->
          <div v-else class="empty-survey">
            <div class="text-center py-5">
              <i class="bi bi-clipboard-plus fs-1 mb-3"></i>
              <h3>Get Started With Your Survey</h3>
              <p class="text-muted">Create your first step to start building your survey</p>
              <button class="btn btn-primary mt-3" @click="addStep">
                <i class="bi bi-plus-circle me-2"></i> Create First Step
              </button>
            </div>
          </div>

        </div>
        <div class="col-3">
          <div class="field-toolbar">
            <div class="toolbar-header">
              <h6 class="mb-0">Field Types</h6>
            </div>
            <div class="toolbar-content">
              <draggable
                  v-model="fieldTypes"
                  :group="{ name: 'questions', pull: 'clone', put: false }"
                  :clone="cloneField"
                  item-key="id"
              >
                <template #item="{ element }">
                  <div class="draggable-field">
                    <i :class="element.icon"></i>
                    {{ element.name }}
                  </div>
                </template>
              </draggable>
            </div>
            <div class="toolbar-footer">
              <button class="btn btn-primary w-100" @click="addNewField">
                <i class="bi bi-plus-circle me-2"></i> Add Field
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Field toolbar -->
       <!-- Field Editor Modal -->
    <FieldEditorModal
      v-model:show="showFieldEditor"
      :field="fieldBeingEdited"
      @save="saveEditedField"
      @cancel="cancelFieldEdit"
    />

    </div>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue'
import {useSurveyStore} from '@/store/survey'
import draggable from 'vuedraggable'

// Import field components
import TextField from './fields/TextField.vue'
import TextareaField from './fields/TextareaField.vue'
import RadioField from './fields/RadioField.vue'
import CheckboxField from './fields/CheckboxField.vue'
import DropdownField from './fields/DropdownField.vue'
import RatingField from './fields/RatingField.vue'
import NPSField from './fields/NPSField.vue'
import FileField from './fields/FileField.vue'

import FieldEditorModal from './FieldEditorModal.vue'
export default {
  name: 'SurveyFormBuilder',
  components: {
    FieldEditorModal,
    draggable,
    TextField,
    TextareaField,
    RadioField,
    CheckboxField,
    DropdownField,
    RatingField,
    NPSField,
    FileField
  },
  props: {
    initialSurvey: {
      type: Object,
      default: () => ({
        title: '',
        description: '',
        settings: {
          showProgressBar: true,
          allowPrevious: true,
          showStepTitles: true
        },
        steps: []
      })
    }
  },
  emits: ['update', 'save'],

  setup(props, {emit}) {
    const surveyStore = useSurveyStore()

    // Clone the initial survey to avoid mutating props
    const survey = ref({...props.initialSurvey})

    // If survey is empty, initialize with default values
    if (!survey.value.steps) {
      survey.value.steps = []
    }

    if (!survey.value.settings) {
      survey.value.settings = {
        showProgressBar: true,
        allowPrevious: true,
        showStepTitles: true
      }
    }

    // Track current step
    const currentStepIndex = ref(survey.value.steps.length > 0 ? 0 : null)
     const showFieldEditor = ref(false)
    const fieldBeingEdited = ref(null)
    // Computed property to get current step
    const currentStep = computed(() => {
      if (currentStepIndex.value !== null && survey.value.steps.length > currentStepIndex.value) {
        return survey.value.steps[currentStepIndex.value]
      }
      return null
    })

    // Available field types from store
    const fieldTypes = ref(surveyStore.fieldTypes)

    // Track dragging state
    const isDraggingField = ref(false)

    // Methods for managing steps
    const addStep = () => {
      const newStep = surveyStore.createNewStep()
      survey.value.steps.push(newStep)
      currentStepIndex.value = survey.value.steps.length - 1
      emit('update', survey.value)
    }

    const setCurrentStep = (index) => {
      currentStepIndex.value = index
    }

    const removeStep = (index) => {
      if (confirm('Are you sure you want to delete this step and all its questions?')) {
        survey.value.steps.splice(index, 1)

        if (survey.value.steps.length === 0) {
          currentStepIndex.value = null
        } else if (currentStepIndex.value >= survey.value.steps.length) {
          currentStepIndex.value = survey.value.steps.length - 1
        }

        emit('update', survey.value)
      }
    }

    // Methods for managing fields
    const addNewField = () => {
      if (!currentStep.value) {
        addStep()
      }

      const newField = surveyStore.createNewQuestion('text')
      currentStep.value.questions.push(newField)
      emit('update', survey.value)
    }

    const cloneField = (field) => {
      return surveyStore.createNewQuestion(field.id)
    }


    const editField = (field) => {
      // Open the field editor modal with the selected field
      fieldBeingEdited.value = field
      showFieldEditor.value = true
    }
    const saveEditedField = (editedField) => {
      if (!currentStep.value) return

      if (fieldBeingEdited.value) {
        // Update existing field
        const index = currentStep.value.questions.findIndex(q => q.id === fieldBeingEdited.value.id)
        if (index !== -1) {
          currentStep.value.questions[index] = editedField
        }
      } else {
        // Add new field
        currentStep.value.questions.push(editedField)
      }

      // Reset editor state
      fieldBeingEdited.value = null

      // Notify parent
      emit('update', survey.value)
    }

    const cancelFieldEdit = () => {
      fieldBeingEdited.value = null
    }

    const duplicateField = (field) => {
      const index = currentStep.value.questions.findIndex(q => q.id === field.id)
      if (index !== -1) {
        // Clone the field deeply
        const newField = JSON.parse(JSON.stringify(field))
        newField.id = Date.now() // New temporary ID
        newField.label = `${field.label} (copy)`

        // Insert after the original
        currentStep.value.questions.splice(index + 1, 0, newField)
        emit('update', survey.value)
      }
    }

    const deleteField = (field) => {
      const index = currentStep.value.questions.findIndex(q => q.id === field.id)
      if (index !== -1) {
        currentStep.value.questions.splice(index, 1)
        emit('update', survey.value)
      }
    }

    // Map field types to components
    const getFieldComponent = (type) => {
      const componentMap = {
        'text': TextField,
        'textarea': TextareaField,
        'radio': RadioField,
        'checkbox': CheckboxField,
        'dropdown': DropdownField,
        'rating': RatingField,
        'nps': NPSField,
        'file': FileField,
        'email': TextField,
        'number': TextField,
        'phone': TextField,
        'date': TextField
      }

      return componentMap[type] || TextField
    }

    // Drag and drop handlers
    const dragStart = () => {
      isDraggingField.value = true
    }

    const dragEnd = () => {
      isDraggingField.value = false
      emit('update', survey.value)
    }

    // Save the survey
    const saveSurvey = () => {
      emit('save', survey.value)
    }

    // Initialize if needed
    onMounted(() => {
      if (survey.value.steps.length === 0) {
        addStep()
      }
    })

    return {
      survey,
      currentStepIndex,
      currentStep,
      fieldTypes,
      isDraggingField,
      showFieldEditor,
      fieldBeingEdited,
      addStep,
      setCurrentStep,
      removeStep,
      addNewField,
      cloneField,
      editField,
      saveEditedField,
      cancelFieldEdit,
      duplicateField,
      deleteField,
      getFieldComponent,
      dragStart,
      dragEnd,
      saveSurvey
    }
  }
}
</script>

<style scoped>
.survey-form-builder {
  position: relative;
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.builder-header {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.builder-content {
  flex: 1;
  position: relative;
}

/* Steps styling */
.steps-container {
  background-color: white;
  border-radius: 0.375rem 0.375rem 0 0;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.nav-tabs {
  border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-link {
  margin-bottom: -1px;
  background: none;
  border: 1px solid transparent;
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
  color: #6c757d;
  padding: 0.5rem 1rem;
}

.nav-tabs .nav-link.active {
  color: #495057;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
}

.nav-tabs .nav-link:hover {
  border-color: #e9ecef #e9ecef #dee2e6;
  isolation: isolate;
}

.add-step {
  color: #4361ee !important;
}

/* Step editor */
.step-editor {
  background-color: white;
  border-radius: 0 0 0.375rem 0.375rem;
  border: 1px solid #dee2e6;
  border-top: none;
  padding: 1.5rem;
  min-height: 400px;
}

.step-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

/* Dropzone */
.dropzone {
  min-height: 300px;
  padding: 1rem;
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  background-color: #f8f9fa;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
}

.dropzone.active {
  border-color: #4361ee;
  background-color: rgba(67, 97, 238, 0.05);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

/* Field toolbar */
.field-toolbar {
  //position: absolute;
  //top: 0;
  //right: 0;
  width: 260px;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
  height: calc(100% - 2rem);
  margin: 1rem 0;
}

.toolbar-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
  border-radius: 0.375rem 0.375rem 0 0;
}

.toolbar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.toolbar-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.draggable-field {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  background-color: white;
  cursor: grab;
  transition: all 0.2s ease;
}

.draggable-field:hover {
  background-color: #f0f7ff;
  border-color: #4361ee;
}

.draggable-field i {
  margin-right: 0.5rem;
  color: #4361ee;
}

/* Empty survey */
.empty-survey {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  padding: 3rem;
}

.empty-survey i {
  color: #4361ee;
  opacity: 0.7;
}
</style>
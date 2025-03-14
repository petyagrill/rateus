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
    <div class="file-field">
      <!-- Current file display (if file is already uploaded) -->
      <div v-if="hasFile" class="file-preview mb-3">
        <div class="d-flex align-items-center p-3 border rounded bg-light">
          <i class="bi" :class="getFileIcon(currentFile)"></i>
          <div class="ms-3 flex-grow-1">
            <div class="fw-medium text-truncate">{{ getFileName(currentFile) }}</div>
            <div class="small text-muted">{{ getFileSize(currentFile) }}</div>
          </div>
          <button
            v-if="!isPreview || !field.settings?.disabled"
            class="btn btn-sm btn-outline-danger ms-2"
            type="button"
            @click="removeFile"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <!-- File upload area -->
      <div v-if="!hasFile">
        <div
          class="file-upload-area"
          :class="{
            'dragging': isDragging,
            'disabled': isPreview && field.settings?.disabled
          }"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            :accept="acceptedFileTypes"
            class="d-none"
            @change="handleFileChange"
            :multiple="allowsMultiple"
          >
          <div class="text-center p-4">
            <i class="bi bi-cloud-arrow-up fs-1 mb-3"></i>
            <h6>Upload {{ field.label }}</h6>
            <p class="text-muted mb-0">
              Drag and drop files here or click to browse
            </p>
            <small class="d-block text-muted mt-2">
              {{ fileTypeText }}
              {{ fileSizeText }}
            </small>
          </div>
        </div>
      </div>

      <!-- Multiple files list (when multiple is enabled) -->
      <div v-if="hasMultipleFiles" class="multiple-files-list mt-3">
        <div
          v-for="(file, index) in currentFiles"
          :key="index"
          class="file-item d-flex align-items-center p-2 border rounded mb-2"
        >
          <i class="bi" :class="getFileIcon(file)"></i>
          <div class="ms-2 flex-grow-1">
            <div class="fw-medium text-truncate">{{ getFileName(file) }}</div>
            <div class="small text-muted">{{ getFileSize(file) }}</div>
          </div>
          <button
            v-if="!isPreview || !field.settings?.disabled"
            class="btn btn-sm btn-outline-danger ms-2"
            type="button"
            @click="removeFileAt(index)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>

        <!-- Add more files button -->
        <div v-if="currentFiles.length < maxFiles && (!isPreview || !field.settings?.disabled)" class="d-grid mt-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="triggerFileInput"
          >
            <i class="bi bi-plus-circle me-1"></i> Add Another File
          </button>
        </div>
      </div>
    </div>
  </BaseFormField>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import BaseFormField from '../BaseFormField.vue'

export default {
  name: 'FileField',
  components: {
    BaseFormField
  },
  props: {
    field: {
      type: Object,
      required: true
    },
    modelValue: {
      type: [File, Array, String, null],
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
    const fileInput = ref(null)
    const isDragging = ref(false)

    // Determine if file upload allows multiple files
    const allowsMultiple = computed(() => {
      return props.field.settings?.multiple === true
    })

    // Get settings with defaults
    const settings = computed(() => {
      return {
        allowedTypes: props.field.settings?.allowedTypes || '*',
        maxSize: props.field.settings?.maxSize || 5, // in MB
        multiple: props.field.settings?.multiple || false,
        maxFiles: props.field.settings?.maxFiles || 10
      }
    })

    // Get accepted file types for the input element
    const acceptedFileTypes = computed(() => {
      return settings.value.allowedTypes
    })

    // Max file size in bytes
    const maxSizeBytes = computed(() => {
      return settings.value.maxSize * 1024 * 1024
    })

    // Max number of files
    const maxFiles = computed(() => {
      return settings.value.maxFiles
    })

    // Formatted file type text
    const fileTypeText = computed(() => {
      const types = settings.value.allowedTypes
      if (types === '*') return 'All file types allowed.'

      return `Accepted file types: ${types.replaceAll(',', ', ')}`
    })

    // Formatted file size text
    const fileSizeText = computed(() => {
      return `Maximum file size: ${settings.value.maxSize} MB.`
    })

    // Check if we have a file
    const hasFile = computed(() => {
      if (props.modelValue === null || props.modelValue === undefined) return false

      if (Array.isArray(props.modelValue)) {
        return props.modelValue.length > 0
      }

      return true
    })

    // Check if we have multiple files
    const hasMultipleFiles = computed(() => {
      return Array.isArray(props.modelValue) && props.modelValue.length > 0
    })

    // Get current file (for single file mode)
    const currentFile = computed(() => {
      if (!hasFile.value) return null

      if (Array.isArray(props.modelValue)) {
        return props.modelValue[0]
      }

      return props.modelValue
    })

    // Get all files (for multiple file mode)
    const currentFiles = computed(() => {
      if (!hasFile.value) return []

      if (Array.isArray(props.modelValue)) {
        return props.modelValue
      }

      return [props.modelValue]
    })

    // Trigger file input click
    const triggerFileInput = () => {
      if (isPreview && props.field.settings?.disabled) return

      fileInput.value.click()
    }

    // Handle file input change
    const handleFileChange = (event) => {
      const files = event.target.files

      if (!files || files.length === 0) {
        return
      }

      processFiles(files)

      // Reset file input for consistent behavior
      event.target.value = null
    }

    // Handle drag over
    const handleDragOver = (event) => {
      if (isPreview && props.field.settings?.disabled) return

      isDragging.value = true
    }

    // Handle drag leave
    const handleDragLeave = (event) => {
      isDragging.value = false
    }

    // Handle drop
    const handleDrop = (event) => {
      if (isPreview && props.field.settings?.disabled) return

      isDragging.value = false

      const files = event.dataTransfer.files

      if (!files || files.length === 0) {
        return
      }

      processFiles(files)
    }

    // Process files
    const processFiles = (fileList) => {
      // Convert FileList to Array
      const files = Array.from(fileList)

      // Validate file size
      const validFiles = files.filter(file => {
        if (file.size > maxSizeBytes.value) {
          console.warn(`File "${file.name}" exceeds maximum size of ${settings.value.maxSize}MB`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) {
        return
      }

      // Single file mode
      if (!allowsMultiple.value) {
        emit('update:modelValue', validFiles[0])
        return
      }

      // Multiple file mode
      let newFiles = currentFiles.value.slice()

      // Add new files up to the max limit
      const remainingSlots = maxFiles.value - newFiles.length
      const filesToAdd = validFiles.slice(0, remainingSlots)

      newFiles = [...newFiles, ...filesToAdd]

      emit('update:modelValue', newFiles)
    }

    // Remove file (single file mode)
    const removeFile = () => {
      emit('update:modelValue', null)
    }

    // Remove file at index (multiple file mode)
    const removeFileAt = (index) => {
      if (!Array.isArray(props.modelValue)) return

      const newFiles = props.modelValue.filter((_, i) => i !== index)
      emit('update:modelValue', newFiles)
    }

    // Get file name
    const getFileName = (file) => {
      if (!file) return ''

      if (typeof file === 'string') {
        // If file is a URL or path, extract the filename
        return file.split('/').pop()
      }

      return file.name
    }

    // Get file size
    const getFileSize = (file) => {
      if (!file) return ''

      if (typeof file === 'string') {
        // If file is a URL or path, we don't know the size
        return ''
      }

      // Format file size
      const bytes = file.size

      if (bytes < 1024) {
        return `${bytes} bytes`
      } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      }
    }

    // Get file icon based on type
    const getFileIcon = (file) => {
      if (!file) return 'bi-file'

      let fileType = ''

      if (typeof file === 'string') {
        // Try to extract extension from string
        const ext = file.split('.').pop().toLowerCase()
        fileType = ext
      } else {
        // Use mimetype
        fileType = file.type
      }

      // Image files
      if (fileType.includes('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(fileType)) {
        return 'bi-file-image'
      }

      // PDF files
      if (fileType.includes('pdf') || fileType === 'pdf') {
        return 'bi-file-pdf'
      }

      // Word documents
      if (fileType.includes('msword') || fileType.includes('wordprocessingml') || ['doc', 'docx'].includes(fileType)) {
        return 'bi-file-word'
      }

      // Excel spreadsheets
      if (fileType.includes('spreadsheetml') || fileType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(fileType)) {
        return 'bi-file-excel'
      }

      // Presentations
      if (fileType.includes('presentationml') || fileType.includes('powerpoint') || ['ppt', 'pptx'].includes(fileType)) {
        return 'bi-file-ppt'
      }

      // Text files
      if (fileType.includes('text/') || ['txt', 'rtf'].includes(fileType)) {
        return 'bi-file-text'
      }

      // Zip files
      if (fileType.includes('zip') || fileType.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(fileType)) {
        return 'bi-file-zip'
      }

      // Default icon for other file types
      return 'bi-file'
    }

    return {
      fileInput,
      isDragging,
      allowsMultiple,
      acceptedFileTypes,
      maxFiles,
      fileTypeText,
      fileSizeText,
      hasFile,
      hasMultipleFiles,
      currentFile,
      currentFiles,
      triggerFileInput,
      handleFileChange,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      removeFile,
      removeFileAt,
      getFileName,
      getFileSize,
      getFileIcon
    }
  }
}
</script>

<style scoped>
.file-upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-upload-area:hover {
  border-color: #4361ee;
  background-color: rgba(67, 97, 238, 0.05);
}

.file-upload-area.dragging {
  border-color: #4361ee;
  background-color: rgba(67, 97, 238, 0.1);
}

.file-upload-area.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.file-upload-area i {
  color: #4361ee;
}

.file-preview i,
.file-item i {
  font-size: 1.5rem;
  color: #4361ee;
}
</style>
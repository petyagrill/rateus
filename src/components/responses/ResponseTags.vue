<template>
  <div class="response-tags">
    <div v-if="!tags || tags.length === 0" class="text-center py-3">
      <p class="text-muted mb-0">No tags added yet</p>
      <button @click="$emit('add-tag')" class="btn btn-sm btn-link">
        + Add Tag
      </button>
    </div>

    <div v-else class="tag-list">
      <span
        v-for="tag in tags"
        :key="tag"
        class="tag-badge"
      >
        <span class="tag-text">{{ tag }}</span>
        <button
          class="tag-remove-btn"
          @click="$emit('remove-tag', tag)"
          title="Remove tag"
        >
          <i class="bi bi-x"></i>
        </button>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResponseTags',
  props: {
    tags: {
      type: Array,
      default: () => []
    }
  },
  emits: ['add-tag', 'remove-tag']
}
</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  background-color: #f0f7ff;
  color: #4361ee;
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.tag-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  color: inherit;
  padding: 0;
  margin-left: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.tag-remove-btn:hover {
  opacity: 1;
}
</style>
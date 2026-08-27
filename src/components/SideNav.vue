<script setup lang="ts">
import { GROUPS } from '../content/course'
import { useProgress } from '../composables/useProgress'

const { isDone } = useProgress()
</script>

<template>
  <aside class="sidebar">
    <div v-for="(group, gi) in GROUPS" :key="group.name" class="sidebar-group">
      <div class="sidebar-group-title">{{ group.icon }} {{ group.name }}</div>
      <RouterLink
        v-for="lesson in group.lessons"
        :key="lesson.id"
        :to="`/lesson/${lesson.id}`"
        class="sidebar-link"
        :class="{ active: $route.params.id === lesson.id }"
      >
        <span class="num">{{ String(gi + 1).padStart(2, '0') }}.{{ String(group.lessons.indexOf(lesson) + 1).padStart(2, '0') }}</span>
        <span class="lbl">{{ lesson.title }}</span>
        <span v-if="isDone(lesson.id)" class="done">✓</span>
      </RouterLink>
    </div>
  </aside>
</template>

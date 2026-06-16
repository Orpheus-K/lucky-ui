<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed, watch, nextTick } from 'vue'
import PhonePreview from './components/PhonePreview.vue'

const { Layout } = DefaultTheme
const { frontmatter, page } = useData()

const hasPhone = computed(() => !!frontmatter.value.phone)
const previewKey = computed(() => `${page.value.relativePath}:${String(frontmatter.value.phone ?? '')}`)

// 切换页面时给 html 加/移除布局类，用于 CSS 调整主内容区宽度
watch(
  [() => page.value.relativePath, hasPhone],
  () => {
    nextTick(() => {
      if (typeof document === 'undefined') return

      if (hasPhone.value) {
        document.documentElement.classList.add('has-phone-preview')
      } else {
        document.documentElement.classList.remove('has-phone-preview')
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <Layout>
    <!-- 将手机预览面板通过 layout-bottom 插槽注入，fixed 定位到右侧 -->
    <template v-if="hasPhone" #layout-bottom>
      <PhonePreview :key="previewKey" :src="frontmatter.phone" :title="frontmatter.title" />
    </template>
  </Layout>
</template>

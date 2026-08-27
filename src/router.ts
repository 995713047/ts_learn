import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/lesson/:id', name: 'lesson', component: () => import('./views/LessonView.vue'), props: true },
    { path: '/playground', name: 'playground', component: () => import('./views/PlaygroundView.vue') },
    { path: '/interview', name: 'interview', component: () => import('./views/InterviewView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

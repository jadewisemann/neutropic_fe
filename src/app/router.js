import { createRouter, createWebHistory } from 'vue-router'
import { authTokenStorage } from '../shared/api'
import { homePage, notFoundPage } from '../pages'
import {
  adminRoutes,
  authRoutes,
  communityRoutes,
  mypageRoutes,
  reportRoutes,
  surveyRoutes,
} from '../domains/routes'

const routes = [
  { path: '/', component: homePage },
  ...authRoutes,
  ...surveyRoutes,
  ...reportRoutes,
  ...mypageRoutes,
  ...communityRoutes,
  ...adminRoutes,
  { path: '/:pathMatch(.*)*', component: notFoundPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const isAuthenticated = Boolean(authTokenStorage.getAccessToken())
  const user = authTokenStorage.getUser()
  const isAdmin = user?.role === 'admin'

  if (to.meta.requiresAdmin && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect_to: to.fullPath },
    }
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return '/'
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/login',
      query: { redirect_to: to.fullPath },
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return '/'
  }

  return true
})

export default router

import * as admin from './pages'

export const adminRoutes = [
  { path: '/admin', component: admin.page, meta: { requiresAdmin: true } },
  { path: '/admin/users', component: admin.usersPage, meta: { requiresAdmin: true } },
  { path: '/admin/posts', component: admin.postsPage, meta: { requiresAdmin: true } },
  { path: '/admin/comments', component: admin.commentsPage, meta: { requiresAdmin: true } },
]

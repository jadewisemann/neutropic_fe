import * as reports from './pages'

export const reportRoutes = [
  { path: '/reports/generating', component: reports.generatingPage, meta: { requiresAuth: true } },
  { path: '/reports/new', component: reports.newPage, meta: { requiresAuth: true } },
  { path: '/reports', component: reports.page, meta: { requiresAuth: true } },
  { path: '/reports/:report_id', component: reports.detailPage, meta: { requiresAuth: true } },
]

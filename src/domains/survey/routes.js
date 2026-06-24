import * as survey from './pages'

export const surveyRoutes = [
  { path: '/survey', component: survey.page, meta: { requiresAuth: true } },
]

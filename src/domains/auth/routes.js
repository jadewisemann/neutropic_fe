import * as auth from './pages'

export const authRoutes = [
  { path: '/signup', component: auth.signupPage, meta: { guestOnly: true } },
  { path: '/login', component: auth.loginPage, meta: { guestOnly: true } },
]

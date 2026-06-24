import * as mypage from './pages'

export const mypageRoutes = [
  { path: '/mypage', component: mypage.page, meta: { requiresAuth: true } },
  { path: '/mypage/profile', component: mypage.profilePage, meta: { requiresAuth: true } },
]

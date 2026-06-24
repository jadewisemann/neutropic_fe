const detail = (resource, id) => `${resource}${encodeURIComponent(id)}/`

export const apiEndpoints = {
  auth: {
    signup: () => '/auth/signup/',
    login: () => '/auth/login/',
    tokenRefresh: () => '/auth/token/refresh/',
    logout: () => '/auth/logout/',
  },

  users: {
    me: () => '/users/me/',
    password: () => '/users/me/password/',
  },

  mypage: {
    summary: () => '/mypage/',
  },

  survey: {
    healthGoals: () => '/health_goals/',
    medicationOptions: () => '/medication_options/',
    specialConditionOptions: () => '/special_condition_options/',
  },

  reports: {
    collection: () => '/reports/',
    detail: (reportId) => detail('/reports/', reportId),
    messages: (reportId) => `${detail('/reports/', reportId)}messages/`,
  },

  posts: {
    collection: () => '/posts/',
    detail: (postId) => detail('/posts/', postId),
    like: (postId) => `${detail('/posts/', postId)}like/`,
    comments: (postId) => `${detail('/posts/', postId)}comments/`,
  },

  comments: {
    detail: (commentId) => detail('/comments/', commentId),
  },

  admin: {
    users: () => '/admin/users/',
    userDetail: (userId) => detail('/admin/users/', userId),
    posts: () => '/admin/posts/',
    postDetail: (postId) => detail('/admin/posts/', postId),
    comments: () => '/admin/comments/',
    commentDetail: (commentId) => detail('/admin/comments/', commentId),
    reportStatistics: () => '/admin/reports/statistics/',
  },
}

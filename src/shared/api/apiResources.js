import { apiClient } from './apiClient'
import { apiEndpoints } from './apiEndpoints'

export const authApi = {
  signup(payload) {
    return apiClient.post(apiEndpoints.auth.signup(), payload, { auth: false })
  },

  login(payload) {
    return apiClient.post(apiEndpoints.auth.login(), payload, { auth: false })
  },

  refreshToken(refreshToken) {
    return apiClient.post(apiEndpoints.auth.tokenRefresh(), { refresh_token: refreshToken }, { auth: false })
  },

  logout(refreshToken) {
    return apiClient.post(apiEndpoints.auth.logout(), { refresh_token: refreshToken })
  },
}

export const userApi = {
  getMe() {
    return apiClient.get(apiEndpoints.users.me())
  },

  updateMe(payload) {
    return apiClient.patch(apiEndpoints.users.me(), payload)
  },

  updatePassword(payload) {
    return apiClient.patch(apiEndpoints.users.password(), payload)
  },

  deleteMe() {
    return apiClient.delete(apiEndpoints.users.me())
  },
}

export const mypageApi = {
  getSummary() {
    return apiClient.get(apiEndpoints.mypage.summary())
  },
}

export const surveyMetadataApi = {
  getHealthGoals() {
    return apiClient.get(apiEndpoints.survey.healthGoals())
  },

  getMedicationOptions() {
    return apiClient.get(apiEndpoints.survey.medicationOptions())
  },

  getSpecialConditionOptions() {
    return apiClient.get(apiEndpoints.survey.specialConditionOptions())
  },
}

export const reportApi = {
  create(payload) {
    return apiClient.post(apiEndpoints.reports.collection(), payload)
  },

  list(query) {
    return apiClient.get(apiEndpoints.reports.collection(), { query })
  },

  get(reportId) {
    return apiClient.get(apiEndpoints.reports.detail(reportId))
  },

  update(reportId, payload) {
    return apiClient.patch(apiEndpoints.reports.detail(reportId), payload)
  },

  delete(reportId) {
    return apiClient.delete(apiEndpoints.reports.detail(reportId))
  },

  listMessages(reportId) {
    return apiClient.get(apiEndpoints.reports.messages(reportId))
  },

  sendMessage(reportId, payload) {
    return apiClient.post(apiEndpoints.reports.messages(reportId), payload)
  },
}

export const communityApi = {
  listPosts(query) {
    return apiClient.get(apiEndpoints.posts.collection(), { query, auth: false })
  },

  createPost(payload) {
    return apiClient.post(apiEndpoints.posts.collection(), payload)
  },

  getPost(postId) {
    return apiClient.get(apiEndpoints.posts.detail(postId), { auth: false })
  },

  updatePost(postId, payload) {
    return apiClient.patch(apiEndpoints.posts.detail(postId), payload)
  },

  deletePost(postId) {
    return apiClient.delete(apiEndpoints.posts.detail(postId))
  },

  likePost(postId) {
    return apiClient.post(apiEndpoints.posts.like(postId))
  },

  unlikePost(postId) {
    return apiClient.delete(apiEndpoints.posts.like(postId))
  },

  listComments(postId) {
    return apiClient.get(apiEndpoints.posts.comments(postId), { auth: false })
  },

  createComment(postId, payload) {
    return apiClient.post(apiEndpoints.posts.comments(postId), payload)
  },

  updateComment(commentId, payload) {
    return apiClient.patch(apiEndpoints.comments.detail(commentId), payload)
  },

  deleteComment(commentId) {
    return apiClient.delete(apiEndpoints.comments.detail(commentId))
  },
}

export const adminApi = {
  listUsers(query) {
    return apiClient.get(apiEndpoints.admin.users(), { query })
  },

  getUser(userId) {
    return apiClient.get(apiEndpoints.admin.userDetail(userId))
  },

  updateUser(userId, payload) {
    return apiClient.patch(apiEndpoints.admin.userDetail(userId), payload)
  },

  listPosts(query) {
    return apiClient.get(apiEndpoints.admin.posts(), { query })
  },

  deletePost(postId) {
    return apiClient.delete(apiEndpoints.admin.postDetail(postId))
  },

  listComments(query) {
    return apiClient.get(apiEndpoints.admin.comments(), { query })
  },

  deleteComment(commentId) {
    return apiClient.delete(apiEndpoints.admin.commentDetail(commentId))
  },

  getReportStatistics(query) {
    return apiClient.get(apiEndpoints.admin.reportStatistics(), { query })
  },
}

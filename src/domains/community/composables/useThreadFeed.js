import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

export function useThreadFeed({
  loadItems,
  initialQuery = {},
  getRouteKey = () => '',
  fallbackItems = [],
  fallbackErrorMessage = '연결이 불안정해 예시 데이터를 표시합니다.',
}) {
  const items = ref([])
  const isInitialLoading = ref(true)
  const isLoadingMore = ref(false)
  const loadError = ref('')
  const isUsingFallback = ref(false)
  const hasMore = ref(false)
  const sentinel = ref(null)

  const loadedItemIds = new Set()
  let observer = null
  let nextCursor = ''
  let nextPage = 2

  watch(getRouteKey, loadInitialItems, { immediate: true })

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry?.isIntersecting) {
        loadMoreItems()
      }
    }, { rootMargin: '360px 0px' })

    if (sentinel.value) {
      observer.observe(sentinel.value)
    }
  })

  watch(sentinel, (element, previousElement) => {
    if (!observer) return
    if (previousElement) observer.unobserve(previousElement)
    if (element) observer.observe(element)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  async function loadInitialItems() {
    isInitialLoading.value = true
    loadError.value = ''
    resetFeed()

    try {
      const response = await loadItems(getListQuery({}, initialQuery))
      applyListResponse(response, { append: false })
      isUsingFallback.value = false
    } catch (error) {
      if (fallbackItems.length > 0) {
        applyListResponse(fallbackItems, { append: false })
        hasMore.value = false
        isUsingFallback.value = true
        loadError.value = fallbackErrorMessage
      } else {
        loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
      }
    } finally {
      isInitialLoading.value = false
    }
  }

  async function loadMoreItems() {
    if (!hasMore.value || isInitialLoading.value || isLoadingMore.value) return

    isLoadingMore.value = true
    loadError.value = ''

    try {
      const response = await loadItems(getListQuery({ cursor: nextCursor, page: nextPage }, initialQuery))
      applyListResponse(response, { append: true })
    } catch (error) {
      loadError.value = error?.message || '잠시 후 다시 시도해 주세요.'
    } finally {
      isLoadingMore.value = false
    }
  }

  function applyListResponse(response, { append }) {
    const incomingItems = normalizeListResults(response)
    items.value = mergeUniqueItems(append ? items.value : [], incomingItems, loadedItemIds)

    const nextState = resolveNextState(response, { append, currentNextPage: nextPage })
    nextCursor = nextState.cursor
    nextPage = nextState.page
    hasMore.value = nextState.hasMore
  }

  function resetFeed() {
    items.value = []
    loadedItemIds.clear()
    isUsingFallback.value = false
    nextCursor = ''
    nextPage = 2
    hasMore.value = false
  }

  return {
    items,
    isInitialLoading,
    isLoadingMore,
    loadError,
    isUsingFallback,
    hasMore,
    sentinel,
    loadInitialItems,
    loadMoreItems,
  }
}

function getListQuery({ cursor = '', page = null } = {}, initialQuery = {}) {
  if (cursor) return { ...initialQuery, cursor }
  if (page) return { ...initialQuery, page }
  return { ...initialQuery }
}

function mergeUniqueItems(currentItems, incomingItems, loadedItemIds) {
  const uniqueItems = incomingItems.filter((item) => {
    if (loadedItemIds.has(item.id)) return false
    loadedItemIds.add(item.id)
    return true
  })

  return [...currentItems, ...uniqueItems]
}

function resolveNextState(response, { append, currentNextPage }) {
  const nextPageFromResponse = getNextPageFromResponse(response)
  const page = nextPageFromResponse ?? (append ? currentNextPage + 1 : 2)
  const cursor = getNextCursorFromResponse(response)

  return {
    cursor,
    page,
    hasMore: Boolean(cursor || response?.next || response?.has_next || nextPageFromResponse),
  }
}

export function normalizeListResults(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.results)) return response.results
  if (Array.isArray(response?.items)) return response.items
  if (Array.isArray(response?.data)) return response.data
  return []
}

export function getNextCursorFromResponse(response) {
  const directCursor = response?.next_cursor || response?.cursor?.next || response?.pagination?.next_cursor
  if (directCursor) return String(directCursor)

  return getSearchParam(response?.next, 'cursor')
}

export function getNextPageFromResponse(response) {
  const directPage = response?.next_page || response?.pagination?.next_page
  if (directPage) return normalizePage(directPage)

  return normalizePage(getSearchParam(response?.next, 'page'))
}

function getSearchParam(value, name) {
  if (!value || typeof value !== 'string') return ''

  try {
    const baseUrl = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
    const url = new URL(value, baseUrl)
    return url.searchParams.get(name) || ''
  } catch {
    return ''
  }
}

function normalizePage(value) {
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : null
}

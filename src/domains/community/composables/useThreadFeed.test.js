import { describe, expect, it } from 'vitest'
import {
  getNextCursorFromResponse,
  getNextPageFromResponse,
  normalizeListResults,
} from './useThreadFeed'

describe('useThreadFeed pagination helpers', () => {
  it('normalizes common list response shapes', () => {
    const results = [{ id: 1 }]

    expect(normalizeListResults(results)).toEqual(results)
    expect(normalizeListResults({ results })).toEqual(results)
    expect(normalizeListResults({ items: results })).toEqual(results)
    expect(normalizeListResults({ data: results })).toEqual(results)
    expect(normalizeListResults({ count: 0 })).toEqual([])
  })

  it('prefers cursor pagination when a cursor is available', () => {
    expect(getNextCursorFromResponse({ next_cursor: 'cursor-2' })).toBe('cursor-2')
    expect(getNextCursorFromResponse({ cursor: { next: 'cursor-3' } })).toBe('cursor-3')
    expect(getNextCursorFromResponse({ pagination: { next_cursor: 'cursor-4' } })).toBe('cursor-4')
    expect(getNextCursorFromResponse({ next: '/api/v1/posts/?cursor=cursor-5' })).toBe('cursor-5')
  })

  it('falls back to page pagination from explicit fields or next urls', () => {
    expect(getNextPageFromResponse({ next_page: 2 })).toBe(2)
    expect(getNextPageFromResponse({ pagination: { next_page: 3 } })).toBe(3)
    expect(getNextPageFromResponse({ next: '/api/v1/posts/?page=4' })).toBe(4)
    expect(getNextPageFromResponse({ next: null })).toBeNull()
  })
})

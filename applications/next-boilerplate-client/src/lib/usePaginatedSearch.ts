import { NetworkStatus } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { DocumentNode } from '@apollo/client'
import type { Connection } from '../app/app.types'
import { useState, useEffect, useCallback } from 'react'

// #################################################################################################

export interface PaginatedSearchResult<T> {
  items: T[]
  search: string
  hasMore: boolean
  loading: boolean
  error: string | null
  loadMore: () => void
  loadingMore: boolean
  setSearch: (s: string) => void
}

// #################################################################################################

export function usePaginatedSearch<TNode, TData, TVars>(args: {
  query: DocumentNode
  pageSize?: number
  getConnection: (data: TData) => Connection<TNode>
  buildVars: (input: {
    first: number
    after?: string | null
    searchTerm?: string | null
  }) => TVars
}): PaginatedSearchResult<TNode> {
  const { query, pageSize = 20, getConnection, buildVars } = args

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input by 300ms before sending to server
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)

    return () => clearTimeout(timer)
  }, [search])

  const variables = buildVars({
    first: pageSize,
    searchTerm: debouncedSearch || null,
  }) as TVars & Record<string, unknown>

  const { data, error, fetchMore, networkStatus } = useQuery<TData>(query, {
    variables,
    notifyOnNetworkStatusChange: true,
  })

  const connection = data ? getConnection(data) : null
  const items = connection?.nodes ?? []
  const hasMore = connection?.pageInfo.hasNextPage ?? false

  const loadingMore = networkStatus === NetworkStatus.fetchMore
  // Loading is true on initial load AND when variables change (e.g., new search term)
  const loading =
    networkStatus === NetworkStatus.loading ||
    networkStatus === NetworkStatus.setVariables

  const loadMore = useCallback(() => {
    if (!connection?.pageInfo.hasNextPage || loadingMore) return
    fetchMore({
      variables: { ...variables, after: connection.pageInfo.endCursor },
    })
  }, [connection, fetchMore, loadingMore, variables])

  // While loading variables changes, hide stale items (typePolicies keep them in cache otherwise)
  const visibleItems = loading ? [] : items

  return {
    search,
    hasMore,
    loading,
    loadMore,
    setSearch,
    loadingMore,
    items: visibleItems,
    error: error ? error.message : null,
  }
}

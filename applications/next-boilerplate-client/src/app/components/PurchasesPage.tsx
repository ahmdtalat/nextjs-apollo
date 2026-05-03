'use client'

import { useCallback } from 'react'
import PurchaseCard from './PurchaseCard'
import { MultiSelect } from './MultiSelect'
import { NetworkStatus } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { User, Product, Connection } from '../app.types'
import { usePaginatedSearch } from '../../lib/usePaginatedSearch'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { USERS_QUERY, PRODUCTS_QUERY, PURCHASES_QUERY } from '../../lib/queries'
import type {
  UsersQueryData,
  UsersQueryVars,
  ProductsQueryData,
  ProductsQueryVars,
  PurchasesQueryData,
  PurchasesQueryVars,
} from '../../lib/queries'

// #################################################################################################

const PAGE_SIZE = 20

// #################################################################################################

export default function PurchasesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const productIdsParam = searchParams.get('productIds')
  const userIdsParam = searchParams.get('userIds')
  const committedProductIds = productIdsParam ? productIdsParam.split(',') : []
  const committedUserIds = userIdsParam ? userIdsParam.split(',') : []

  const products = usePaginatedSearch<
    Product,
    ProductsQueryData,
    ProductsQueryVars
  >({
    pageSize: PAGE_SIZE,
    query: PRODUCTS_QUERY,
    getConnection: (data) => data.products as Connection<Product>,
    buildVars: ({ first, after, searchTerm }) => ({ first, after, searchTerm }),
  })

  const users = usePaginatedSearch<User, UsersQueryData, UsersQueryVars>({
    pageSize: PAGE_SIZE,
    query: USERS_QUERY,
    getConnection: (data) => data.users as Connection<User>,
    buildVars: ({ first, after, searchTerm }) => ({ first, after, searchTerm }),
  })

  const purchaseVars: PurchasesQueryVars = {
    first: PAGE_SIZE,
    userIds: committedUserIds.length ? committedUserIds : null,
    productIds: committedProductIds.length ? committedProductIds : null,
  }

  const {
    data: purchasesData,
    error: purchasesError,
    fetchMore: fetchMorePurchases,
    networkStatus: purchasesNetworkStatus,
  } = useQuery<PurchasesQueryData, PurchasesQueryVars>(PURCHASES_QUERY, {
    variables: purchaseVars,
    notifyOnNetworkStatusChange: true,
  })

  const purchases = purchasesData?.purchases.nodes ?? []
  const hasNextPage = purchasesData?.purchases.pageInfo.hasNextPage ?? false
  const endCursor = purchasesData?.purchases.pageInfo.endCursor ?? null
  const loadingMorePurchases =
    purchasesNetworkStatus === NetworkStatus.fetchMore
  const loadingPurchases =
    purchasesNetworkStatus === NetworkStatus.loading ||
    purchasesNetworkStatus === NetworkStatus.setVariables

  const visiblePurchases = loadingPurchases ? [] : purchases

  const updateUrl = useCallback(
    (next: { productIds?: string[]; userIds?: string[] }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.productIds !== undefined) {
        if (next.productIds.length) {
          params.set('productIds', next.productIds.join(','))
        } else {
          params.delete('productIds')
        }
      }
      if (next.userIds !== undefined) {
        if (next.userIds.length) {
          params.set('userIds', next.userIds.join(','))
        } else {
          params.delete('userIds')
        }
      }
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  const handleApplyUsers = useCallback(
    (ids: string[]) => updateUrl({ userIds: ids }),
    [updateUrl],
  )

  const handleClearFilters = useCallback(
    () => updateUrl({ productIds: [], userIds: [] }),
    [updateUrl],
  )

  const handleApplyProducts = useCallback(
    (ids: string[]) => updateUrl({ productIds: ids }),
    [updateUrl],
  )

  const handleLoadMorePurchases = useCallback(() => {
    if (!hasNextPage || loadingMorePurchases || !endCursor) return
    fetchMorePurchases({
      variables: { ...purchaseVars, after: endCursor },
    })
  }, [
    hasNextPage,
    loadingMorePurchases,
    endCursor,
    fetchMorePurchases,
    purchaseVars,
  ])

  const hasFilters =
    committedProductIds.length > 0 || committedUserIds.length > 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Purchases</h1>
      <p className="text-sm text-gray-500 mb-6">Filter by product and user.</p>

      {/* Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">Product</p>
          <MultiSelect<Product>
            placeholder="Select Product"
            selectedLabel={(n) =>
              `${n} ${n === 1 ? 'product' : 'products'} selected`
            }
            items={products.items}
            selectedIds={committedProductIds}
            getId={(p) => p.id}
            getLabel={(p) => p.name}
            searchValue={products.search}
            onSearchChange={products.setSearch}
            hasMore={products.hasMore}
            loadingMore={products.loadingMore}
            onLoadMore={products.loadMore}
            loading={products.loading}
            error={products.error}
            onApply={handleApplyProducts}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 mb-1">User</p>
          <MultiSelect<User>
            placeholder="Select User"
            selectedLabel={(n) => `${n} ${n === 1 ? 'user' : 'users'} selected`}
            items={users.items}
            selectedIds={committedUserIds}
            getId={(u) => u.id}
            getLabel={(u) => `${u.firstName} ${u.lastName}`}
            searchValue={users.search}
            onSearchChange={users.setSearch}
            hasMore={users.hasMore}
            loadingMore={users.loadingMore}
            onLoadMore={users.loadMore}
            loading={users.loading}
            error={users.error}
            onApply={handleApplyUsers}
          />
        </div>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-teal-600 hover:text-teal-700 underline mb-4 block"
        >
          Clear filters
        </button>
      )}

      {/* Purchases grid */}
      {purchasesError && (
        <p className="text-sm text-red-500 mb-4">{purchasesError.message}</p>
      )}

      {loadingPurchases && (
        <p className="text-sm text-gray-500 text-center py-12">Loading...</p>
      )}

      {!loadingPurchases && visiblePurchases.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-12">
          No purchases found.
        </p>
      )}

      {visiblePurchases.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visiblePurchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}

      {/* Load more / count */}
      <div className="mt-6 flex items-center justify-center">
        {hasNextPage && !loadingMorePurchases && (
          <button
            type="button"
            onClick={handleLoadMorePurchases}
            className="rounded-md bg-teal-500 px-4 py-2 text-sm text-white hover:bg-teal-600"
          >
            Load more
          </button>
        )}
        {loadingMorePurchases && (
          <p className="text-sm text-gray-500">Loading more...</p>
        )}
        {!hasNextPage && visiblePurchases.length > 0 && (
          <p className="text-sm text-gray-500">
            {visiblePurchases.length} purchases
          </p>
        )}
      </div>
    </div>
  )
}

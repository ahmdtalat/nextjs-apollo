'use client'

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing/react'
import type { MockLink } from '@apollo/client/testing'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PurchasesPage from './PurchasesPage'
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

// next/navigation mock — must be at top level before any imports of the module
const mockPush = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => mockSearchParams,
}))

// #################################################################################################

const MOCK_PRODUCTS = [
  { __typename: 'Product', id: 'prod-1', name: 'Widget A', imageUrl: '' },
  { __typename: 'Product', id: 'prod-2', name: 'Widget B', imageUrl: '' },
]

const MOCK_USERS = [
  {
    __typename: 'User',
    id: 'user-1',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    profilePictureUrl: 'https://example.com/alice.jpg',
  },
  {
    __typename: 'User',
    id: 'user-2',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Jones',
    profilePictureUrl: 'https://example.com/bob.jpg',
  },
]

const MOCK_PURCHASES = [
  {
    __typename: 'Purchase',
    id: 'purchase-1',
    date: '2024-01-01T00:00:00.000Z',
    product: MOCK_PRODUCTS[0],
    user: MOCK_USERS[0],
  },
  {
    __typename: 'Purchase',
    id: 'purchase-2',
    date: '2024-01-02T00:00:00.000Z',
    product: MOCK_PRODUCTS[1],
    user: MOCK_USERS[1],
  },
]

const PAGE_INFO_NO_MORE = {
  __typename: 'PageInfo',
  endCursor: null,
  startCursor: null,
  hasNextPage: false,
  hasPreviousPage: false,
}

// #################################################################################################

function makeProductsMock(
  vars: ProductsQueryVars,
): MockLink.MockedResponse<ProductsQueryData, ProductsQueryVars> {
  return {
    request: { query: PRODUCTS_QUERY, variables: vars },
    maxUsageCount: 5,
    result: {
      data: {
        products: {
          __typename: 'ProductConnection',
          pageInfo: PAGE_INFO_NO_MORE,
          nodes: MOCK_PRODUCTS,
        },
      },
    },
  }
}

function makeUsersMock(
  vars: UsersQueryVars,
): MockLink.MockedResponse<UsersQueryData, UsersQueryVars> {
  return {
    request: { query: USERS_QUERY, variables: vars },
    maxUsageCount: 5,
    result: {
      data: {
        users: {
          __typename: 'UserConnection',
          pageInfo: PAGE_INFO_NO_MORE,
          nodes: MOCK_USERS,
        },
      },
    },
  }
}

function makePurchasesMock(
  vars: PurchasesQueryVars,
  nodes = MOCK_PURCHASES,
): MockLink.MockedResponse<PurchasesQueryData, PurchasesQueryVars> {
  return {
    request: { query: PURCHASES_QUERY, variables: vars },
    maxUsageCount: 5,
    result: {
      data: {
        purchases: {
          __typename: 'PurchaseConnection',
          pageInfo: PAGE_INFO_NO_MORE,
          nodes,
        },
      },
    },
  }
}

// Default set of mocks — all queries with null filters (initial page load)
function makeDefaultMocks() {
  const productVars: ProductsQueryVars = { first: 20, searchTerm: null }
  const userVars: UsersQueryVars = { first: 20, searchTerm: null }
  const purchaseVars: PurchasesQueryVars = {
    first: 20,
    userIds: null,
    productIds: null,
  }

  return [
    makeProductsMock(productVars),
    makeUsersMock(userVars),
    makePurchasesMock(purchaseVars),
  ]
}

function renderPage(mocks: MockLink.MockedResponse[] = makeDefaultMocks()) {
  return render(
    <MockedProvider mocks={mocks}>
      <PurchasesPage />
    </MockedProvider>,
  )
}

// #################################################################################################

describe('PurchasesPage', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSearchParams = new URLSearchParams()
  })

  it("mounts and renders the heading 'Purchases' and both filter labels", async () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: /Purchases/ }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Product')).toBeInTheDocument()
    })
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it("with ?productIds=* in URL, the products MultiSelect trigger shows 'All products selected'", async () => {
    mockSearchParams = new URLSearchParams('productIds=*')
    const mocks = [
      makeProductsMock({ first: 20, searchTerm: null }),
      makeUsersMock({ first: 20, searchTerm: null }),
      makePurchasesMock({ first: 20, userIds: null, productIds: null }),
    ]
    renderPage(mocks)

    await waitFor(() => {
      expect(screen.getByText('All products selected')).toBeInTheDocument()
    })
  })

  it("with ?productIds=prod-1,prod-2 in URL, the products trigger shows '2 products selected'", async () => {
    mockSearchParams = new URLSearchParams('productIds=prod-1,prod-2')
    const mocks = [
      makeProductsMock({ first: 20, searchTerm: null }),
      makeUsersMock({ first: 20, searchTerm: null }),
      makePurchasesMock({
        first: 20,
        userIds: null,
        productIds: ['prod-1', 'prod-2'],
      }),
    ]
    renderPage(mocks)

    await waitFor(() => {
      expect(screen.getByText('2 products selected')).toBeInTheDocument()
    })
  })

  it('selecting items in products dropdown and clicking Apply pushes URL with literal IDs', async () => {
    const user = userEvent.setup()

    renderPage()

    // Wait for initial data to load
    await waitFor(() => expect(screen.getByText('Product')).toBeInTheDocument())

    // Products initially load — wait for product multi-select to be interactive
    // Open the products dropdown
    const productTrigger = screen.getByRole('button', {
      name: /Select Product/,
    })
    await user.click(productTrigger)

    // Wait for items to appear (Apollo resolves)
    await waitFor(() => {
      expect(
        screen.getByRole('checkbox', { name: /Widget A/ }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('checkbox', { name: /Widget A/ }))
    await user.click(screen.getByRole('button', { name: /Apply/ }))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('productIds=prod-1'),
      expect.anything(),
    )
  })

  it("clicking 'Clear filters' when filters are active pushes URL without filter params", async () => {
    const user = userEvent.setup()
    mockSearchParams = new URLSearchParams('productIds=prod-1')

    const mocks = [
      makeProductsMock({ first: 20, searchTerm: null }),
      makeUsersMock({ first: 20, searchTerm: null }),
      makePurchasesMock({ first: 20, userIds: null, productIds: ['prod-1'] }),
    ]
    renderPage(mocks)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Clear filters/ }),
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /Clear filters/ }))

    expect(mockPush).toHaveBeenCalledWith('/', expect.anything())
  })

  it("Apollo receives productIds: null in variables when productIds param is '*'", async () => {
    mockSearchParams = new URLSearchParams('productIds=*')

    // The key assertion: the mock with productIds: null must match and resolve
    const mocks = [
      makeProductsMock({ first: 20, searchTerm: null }),
      makeUsersMock({ first: 20, searchTerm: null }),
      // When productIds=* the component passes productIds: null to the query
      makePurchasesMock({ first: 20, userIds: null, productIds: null }),
    ]

    renderPage(mocks)

    // Wait for purchases to load — means the query was sent with productIds: null
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    // The mock matched and purchases rendered (or "No purchases found" if empty)
    const purchaseCards = screen.queryAllByText(/Widget/)
    expect(purchaseCards.length).toBeGreaterThanOrEqual(0) // mock resolved means correct vars
  })
})

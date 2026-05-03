'use client'

import { gql } from '@apollo/client'
import ExampleProductList from './components/ExampleProductList'
import { useQuery } from '@apollo/client/react'
import { Product } from './app.types'

interface ProductsData {
  products: {
    pageInfo: {
      hasNextPage: boolean
      hasPreviousPage: boolean
      startCursor: string
      endCursor: string
    }
    nodes: Product[]
  }
}

const PRODUCTS_QUERY = gql`
  query Products($first: Int) {
    products(first: $first) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        name
      }
    }
  }
`

export default function Home() {
  const { loading, error, data } = useQuery<ProductsData>(PRODUCTS_QUERY, {
    variables: { first: 10 },
  })

  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="flex sm:items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col gap-2 p-4 bg-white shadow-md rounded-md w-full h-auto sm:min-h-[480px] sm:min-w-[584px] sm:h-auto sm:w-auto">
        <h1 className="text-2xl font-bold">Example Product List</h1>
        {!data || loading ? (
          <p>Loading products...</p>
        ) : (
          <ExampleProductList products={data.products.nodes} />
        )}
      </div>
    </div>
  )
}

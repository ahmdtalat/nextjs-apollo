import { gql } from '@apollo/client'
import type { User, Product, Purchase, Connection } from '../app/app.types'

// #################################################################################################

export interface UsersQueryVars {
  first: number
  after?: string | null
  searchTerm?: string | null
}

export interface UsersQueryData {
  users: Connection<User>
}

export interface ProductsQueryVars {
  first: number
  after?: string | null
  searchTerm?: string | null
}

export interface ProductsQueryData {
  products: Connection<Product>
}

export interface PurchasesQueryVars {
  first: number
  after?: string | null
  userIds?: string[] | null
  productIds?: string[] | null
}

export interface PurchasesQueryData {
  purchases: Connection<Purchase>
}

// #################################################################################################

export const USERS_QUERY = gql`
  query Users($first: Int, $after: String, $searchTerm: String) {
    users(first: $first, after: $after, searchTerm: $searchTerm) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        email
        firstName
        lastName
        profilePictureUrl
      }
    }
  }
`

export const PRODUCTS_QUERY = gql`
  query Products($first: Int, $after: String, $searchTerm: String) {
    products(first: $first, after: $after, searchTerm: $searchTerm) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        imageUrl
      }
    }
  }
`

export const PURCHASES_QUERY = gql`
  query Purchases(
    $first: Int
    $after: String
    $productIds: [ID]
    $userIds: [ID]
  ) {
    purchases(
      first: $first
      after: $after
      productIds: $productIds
      userIds: $userIds
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        date
        product {
          id
          name
          imageUrl
        }
        user {
          id
          email
          firstName
          lastName
          profilePictureUrl
        }
      }
    }
  }
`

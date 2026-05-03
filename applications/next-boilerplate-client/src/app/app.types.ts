export interface User {
  id: string
  email: string
  lastName: string
  firstName: string
  profilePictureUrl: string
}

export interface Product {
  id: string
  name: string
  imageUrl: string
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  endCursor: string | null
  startCursor: string | null
}

export interface Purchase {
  id: string
  user: User
  date: string
  product: Product
}

export interface Connection<T> {
  nodes: T[]
  pageInfo: PageInfo
}

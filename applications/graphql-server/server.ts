import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { faker } from '@faker-js/faker'

// Generate random products
const generateProducts = (num: number) => {
  const products = []
  for (let i = 0; i < num; i++) {
    products.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      imageUrl: faker.image.avatar(),
    })
  }
  return products
}

interface Product {
  id: string
  name: string
  imageUrl: string
}

// Generate random users
const generateUsers = (num: number) => {
  const users = []
  for (let i = 0; i < num; i++) {
    users.push({
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      profilePictureUrl: faker.image.avatar(),
      email: faker.internet.email(),
    })
  }
  return users
}

interface User {
  id: string
  firstName: string
  lastName: string
  profilePictureUrl: string
  email: string
}

// Generate random purchases
const generatePurchases = (num: number, users: User[], products: Product[]) => {
  const purchases = []
  for (let i = 0; i < num; i++) {
    purchases.push({
      id: faker.string.uuid(),
      userId: users[Math.floor(Math.random() * users.length)].id,
      productId: products[Math.floor(Math.random() * products.length)].id,
      date: faker.date.past().toISOString(),
    })
  }
  return purchases
}

interface Purchase {
  id: string
  userId: string
  productId: string
  date: string
}

// Utility function to add random delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const randomDelay = () => {
  const min = 500 // Minimum delay in milliseconds
  const max = 3000 // Maximum delay in milliseconds
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Sample data
const products = generateProducts(300)
const users = generateUsers(100)
const purchases = generatePurchases(150, users, products)

// GraphQL schema
const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    imageUrl: String!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    profilePictureUrl: String!
    email: String!
  }

  type Purchase {
    id: ID!
    date: String!
    user: User
    product: Product
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type PurchaseConnection {
    nodes: [Purchase!]!
    pageInfo: PageInfo!
  }

  type ProductConnection {
    nodes: [Product!]!
    pageInfo: PageInfo!
  }

  type UserConnection {
    nodes: [User!]!
    pageInfo: PageInfo!
  }

  type Query {
    products(
      searchTerm: String
      first: Int
      last: Int
      before: String
      after: String
    ): ProductConnection!
    users(
      searchTerm: String
      first: Int
      last: Int
      before: String
      after: String
    ): UserConnection!
    purchases(
      productIds: [ID]
      userIds: [ID]
      first: Int
      last: Int
      before: String
      after: String
    ): PurchaseConnection!
  }
`

interface PaginatedArgs {
  searchTerm?: string
  first?: number
  last?: number
  before?: string
  after?: string
}

interface PurchasesArgs {
  productIds?: string[]
  userIds?: string[]
  first?: number
  last?: number
  before?: string
  after?: string
}

const resolvers = {
  Query: {
    products: async (
      _: any,
      { searchTerm, first, last, before, after }: PaginatedArgs,
    ) => {
      // Validate pagination arguments
      if (first && last) {
        throw new Error("Cannot use 'first' and 'last' together.")
      }

      if (before && after) {
        throw new Error("Cannot use 'before' and 'after' together.")
      }

      if (!first && !last) {
        await delay(10000) // Delay for 10 seconds if no first or last arguments
      } else {
        await delay(randomDelay())
      }

      let filteredProducts = products

      // Filter by search term
      if (searchTerm) {
        filteredProducts = filteredProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      let start = 0
      let end = filteredProducts.length

      // Handle pagination based on cursors
      if (before || after) {
        const beforeIndex = before
          ? filteredProducts.findIndex((product) => product.id === before)
          : -1
        const afterIndex = after
          ? filteredProducts.findIndex((product) => product.id === after)
          : -1

        if (before && beforeIndex === -1) {
          throw new Error(`Cursor 'before' with ID '${before}' not found.`)
        }

        if (after && afterIndex === -1) {
          throw new Error(`Cursor 'after' with ID '${after}' not found.`)
        }

        if (beforeIndex !== -1) end = beforeIndex
        if (afterIndex !== -1) start = afterIndex + 1
      }

      // Apply first and last limits
      if (first) end = Math.min(end, start + first)
      if (last) start = Math.max(start, end - last)

      const paginatedProducts = filteredProducts.slice(start, end)

      return {
        nodes: paginatedProducts,
        pageInfo: {
          hasNextPage: end < filteredProducts.length,
          hasPreviousPage: start > 0,
          startCursor: paginatedProducts[0]?.id,
          endCursor: paginatedProducts[paginatedProducts.length - 1]?.id,
        },
      }
    },
    users: async (
      _: any,
      { searchTerm, first, last, before, after }: PaginatedArgs,
    ) => {
      // Validate pagination arguments
      if (first && last) {
        throw new Error("Cannot use 'first' and 'last' together.")
      }

      if (before && after) {
        throw new Error("Cannot use 'before' and 'after' together.")
      }

      if (!first && !last) {
        await delay(10000) // Delay for 10 seconds if no first or last arguments
      } else {
        await delay(randomDelay())
      }

      let filteredUsers = users

      // Filter by search term
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      let start = 0
      let end = filteredUsers.length

      // Handle pagination based on cursors
      if (before || after) {
        const beforeIndex = before
          ? filteredUsers.findIndex((user) => user.id === before)
          : -1
        const afterIndex = after
          ? filteredUsers.findIndex((user) => user.id === after)
          : -1

        if (before && beforeIndex === -1) {
          throw new Error(`Cursor 'before' with ID '${before}' not found.`)
        }

        if (after && afterIndex === -1) {
          throw new Error(`Cursor 'after' with ID '${after}' not found.`)
        }

        if (beforeIndex !== -1) end = beforeIndex
        if (afterIndex !== -1) start = afterIndex + 1
      }

      // Apply first and last limits
      if (first) end = Math.min(end, start + first)
      if (last) start = Math.max(start, end - last)

      const paginatedUsers = filteredUsers.slice(start, end)

      return {
        nodes: paginatedUsers,
        pageInfo: {
          hasNextPage: end < filteredUsers.length,
          hasPreviousPage: start > 0,
          startCursor: paginatedUsers[0]?.id,
          endCursor: paginatedUsers[paginatedUsers.length - 1]?.id,
        },
      }
    },
    purchases: async (
      _: any,
      { productIds, userIds, first, last, before, after }: PurchasesArgs,
    ) => {
      await delay(randomDelay())

      let filteredPurchases = purchases

      // Filter by product IDs
      if (productIds && productIds.length > 0) {
        filteredPurchases = filteredPurchases.filter((purchase) =>
          productIds.includes(purchase.productId),
        )
      }

      // Filter by user IDs
      if (userIds && userIds.length > 0) {
        filteredPurchases = filteredPurchases.filter((purchase) =>
          userIds.includes(purchase.userId),
        )
      }

      let start = 0
      let end = filteredPurchases.length

      // Handle pagination based on cursors
      if (before || after) {
        const beforeIndex = before
          ? filteredPurchases.findIndex((purchase) => purchase.id === before)
          : -1
        const afterIndex = after
          ? filteredPurchases.findIndex((purchase) => purchase.id === after)
          : -1

        if (before && beforeIndex === -1) {
          throw new Error(`Cursor 'before' with ID '${before}' not found.`)
        }

        if (after && afterIndex === -1) {
          throw new Error(`Cursor 'after' with ID '${after}' not found.`)
        }

        if (beforeIndex !== -1) end = beforeIndex
        if (afterIndex !== -1) start = afterIndex + 1
      }

      // Apply first and last limits
      if (first) end = Math.min(end, start + first)
      if (last) start = Math.max(start, end - last)

      const paginatedPurchases = filteredPurchases.slice(start, end)

      return {
        nodes: paginatedPurchases.map((purchase) => ({
          ...purchase,
          user: users.find((user) => user.id === purchase.userId),
          product: products.find(
            (product) => product.id === purchase.productId,
          ),
        })),
        pageInfo: {
          hasNextPage: end < filteredPurchases.length,
          hasPreviousPage: start > 0,
          startCursor: paginatedPurchases[0]?.id,
          endCursor: paginatedPurchases[paginatedPurchases.length - 1]?.id,
        },
      }
    },
  },
  Purchase: {
    user: (purchase: Purchase) =>
      users.find((user) => user.id === purchase.userId),
    product: (purchase: Purchase) =>
      products.find((product) => product.id === purchase.productId),
  },
}

const server = new ApolloServer({ typeDefs, resolvers })

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  })
  console.log(`🚀 Server ready at ${url}`)
}

startServer()

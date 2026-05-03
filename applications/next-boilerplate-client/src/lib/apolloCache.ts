import type { FieldMergeFunction } from '@apollo/client'
import { InMemoryCache } from '@apollo/client-integration-nextjs'

// #################################################################################################

// Cursor-based pagination merge: when `after` is provided, append incoming.nodes to existing.nodes.
// Without `after`, treat as a fresh query and replace.
const connectionMerge: FieldMergeFunction = (existing, incoming, { args }) => {
  if (!args?.after) return incoming
  const incomingTyped = incoming as { nodes: unknown[]; pageInfo: unknown }
  const existingTyped = existing as { nodes: unknown[] } | undefined

  return {
    ...incomingTyped,
    nodes: [...(existingTyped?.nodes ?? []), ...incomingTyped.nodes],
  }
}

// #################################################################################################

export function createCache() {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: {
            merge: connectionMerge,
            keyArgs: ['searchTerm'],
          },
          products: {
            merge: connectionMerge,
            keyArgs: ['searchTerm'],
          },
          purchases: {
            merge: connectionMerge,
            keyArgs: ['userIds', 'productIds'],
          },
        },
      },
    },
  })
}

import { HttpLink } from '@apollo/client'
import { createCache } from './apolloCache'
import {
  ApolloClient,
  registerApolloClient,
} from '@apollo/client-integration-nextjs'

// #################################################################################################

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: createCache(),
    link: new HttpLink({ uri: 'http://localhost:4000/' }),
  })
})

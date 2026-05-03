'use client'

import { HttpLink } from '@apollo/client'
import { createCache } from './apolloCache'
import {
  ApolloClient,
  ApolloNextAppProvider,
} from '@apollo/client-integration-nextjs'

// #################################################################################################

function makeClient() {
  const httpLink = new HttpLink({
    uri: 'http://localhost:4000/',
    fetchOptions: { cache: 'no-store' },
  })

  return new ApolloClient({
    cache: createCache(),
    link: httpLink,
  })
}

// #################################################################################################

export default function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  )
}

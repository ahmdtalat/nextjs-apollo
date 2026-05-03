import { Suspense } from 'react'
import PurchasesPage from './components/PurchasesPage'

// #################################################################################################

export default function Home() {
  return (
    <Suspense>
      <PurchasesPage />
    </Suspense>
  )
}
